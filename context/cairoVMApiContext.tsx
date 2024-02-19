import React, { createContext, useState } from 'react'

import { IInstruction, ILogEntry } from 'types'

import { CAIRO_VM_API_URL } from 'util/constants'

import { TraceEntry, TracerData } from 'components/Tracer'

export enum CompilationState {
  Idle,
  Compiling,
  Compiled,
  Error,
}

export type BreakPoints = { [key: string]: boolean }

const noOp = () => undefined

type ContextProps = {
  sierraCode: string
  casmCode: string
  isCompiling: CompilationState
  cairoLangCompilerVersion: string
  casmInstructions: IInstruction[]
  serializedOutput?: string
  logs: ILogEntry[]
  tracerData?: TracerData
  executionTraceStepNumber: number
  activeCasmInstructionIndex: number
  currentTraceEntry?: TraceEntry
  breakPoints?: BreakPoints

  compileCairoCode: (cairoCode: string, programArguments: string) => void
  onExecutionStepChange: (step: number) => void
  onContinueExecution: () => void
  addBreakPoint: (addr: string) => void
  removeBreakPoint: (addr: string) => void
}

export const CairoVMApiContext = createContext<ContextProps>({
  sierraCode: '',
  casmCode: '',
  casmInstructions: [],
  cairoLangCompilerVersion: '',
  serializedOutput: undefined,
  logs: [],
  isCompiling: CompilationState.Idle,
  executionTraceStepNumber: 0,
  activeCasmInstructionIndex: 0,
  breakPoints: {},

  compileCairoCode: noOp,
  onExecutionStepChange: noOp,
  onContinueExecution: noOp,
  addBreakPoint: noOp,
  removeBreakPoint: noOp,
})

export const CairoVMApiProvider: React.FC = ({ children }) => {
  const [sierraCode, setSierraCode] = useState<string>('')
  const [casmCode, setCasmCode] = useState<string>('')
  const [casmInstructions, setCasmInstructions] = useState<IInstruction[]>([])
  const [cairoLangCompilerVersion, setCairoLangCompilerVersion] = useState('')
  const [isCompiling, setIsCompiling] = useState<CompilationState>(
    CompilationState.Idle,
  )
  const [serializedOutput, setSerializedOutput] = useState<string | undefined>(
    undefined,
  )
  const [logs, setLogs] = useState<ILogEntry[]>([])
  const [tracerData, setTracerData] = useState<TracerData | undefined>(
    undefined,
  )
  const [breakPoints, setBreakPoints] = useState<BreakPoints>({})
  const [executionTraceStepNumber, setExecutionTraceStepNumber] =
    useState<number>(0)
  const currentTraceEntry = tracerData?.trace[executionTraceStepNumber]
  const activeCasmInstructionIndex =
    tracerData?.pcToInstIndexesMap[(currentTraceEntry?.pc ?? 0).toString()] ?? 0

  function onExecutionStepChange(stepNumber: number) {
    setExecutionTraceStepNumber(stepNumber)
  }

  function onContinueExecution() {
    if (!tracerData?.trace) {
      return
    }

    let nextStep = executionTraceStepNumber + 1

    while (
      nextStep < tracerData.trace.length &&
      !breakPoints[tracerData.trace[nextStep].pc]
    ) {
      nextStep += 1
    }

    // move to the next breakpoint or to the end of the program
    setExecutionTraceStepNumber(
      nextStep < tracerData.trace.length
        ? nextStep
        : tracerData.trace.length - 1,
    )
  }

  function addBreakPoint(addr: string) {
    setBreakPoints({ ...breakPoints, [addr]: true })
  }

  function removeBreakPoint(addr: string) {
    setBreakPoints({ ...breakPoints, [addr]: false })
  }

  const compileCairoCode = (cairoCode: string, programArguments = '') => {
    setIsCompiling(CompilationState.Compiling)

    fetch(CAIRO_VM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cairo_program_code: cairoCode,
        program_arguments: programArguments,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setExecutionTraceStepNumber(0)
        setIsCompiling(CompilationState.Compiled)
        setCasmCode(data.casm_program_code)
        setSierraCode(data.sierra_program_code)
        setCairoLangCompilerVersion(data.cairo_lang_compiler_version)
        setSerializedOutput(data.serialized_output)
        setLogs(data.logs)
        setTracerData({
          memory: data.tracer_data.memory,
          pcInstMap: data.tracer_data.pc_inst_map,
          trace: data.tracer_data.trace,
          pcToInstIndexesMap: data.tracer_data.pc_to_inst_indexes_map,
        })
        setBreakPoints(
          Object.keys(data.tracer_data.memory).reduce(
            (state, value) => ({ ...state, [value]: false }),
            {},
          ),
        )
        setCasmInstructions(
          parseCasmInstructions(data.casm_formatted_instructions),
        )
      })
      .catch((error) => {
        setIsCompiling(CompilationState.Error)
        console.error('Error:', error)
      })
  }

  return (
    <CairoVMApiContext.Provider
      value={{
        sierraCode,
        casmCode,
        isCompiling,
        cairoLangCompilerVersion,
        serializedOutput,
        logs,
        tracerData,
        casmInstructions,
        executionTraceStepNumber,
        currentTraceEntry,
        activeCasmInstructionIndex,
        breakPoints,

        compileCairoCode,
        onExecutionStepChange,
        onContinueExecution,
        addBreakPoint,
        removeBreakPoint,
      }}
    >
      {children}
    </CairoVMApiContext.Provider>
  )
}

const parseCasmInstructions = (instructions: string[]): IInstruction[] => {
  return instructions.map((instruction, index) => ({
    id: index,
    name: instruction,
    value: undefined,
    hasBreakpoint: false,
  }))
}
