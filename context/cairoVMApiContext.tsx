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

  compileCairoCode: (cairoCode: string, programArguments: string) => void
  onExecutionStepChange: (step: number) => void
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

  compileCairoCode: () => undefined,
  onExecutionStepChange: () => undefined,
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
  const [executionTraceStepNumber, setExecutionTraceStepNumber] =
    useState<number>(0)
  const currentTraceEntry = tracerData?.trace[executionTraceStepNumber]
  const activeCasmInstructionIndex =
    tracerData?.pcToInstIndexesMap[(currentTraceEntry?.pc ?? 0).toString()] ?? 0

  function onExecutionStepChange(stepNumber: number) {
    setExecutionTraceStepNumber(stepNumber)
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

        compileCairoCode,
        onExecutionStepChange,
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
