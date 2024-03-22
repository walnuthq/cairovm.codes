import React, { PropsWithChildren, createContext, useState } from 'react'

import { IInstruction, ILogEntry } from 'types'

import { CAIRO_VM_API_URL } from 'util/constants'

import { TraceEntry, TracerData, SierraVariables } from 'components/Tracer'

export enum ProgramCompilationState {
  Idle,
  Compiling,
  CompilationSuccess,
  CompilationErr,
}

export enum ProgramExecutionState {
  Idle,
  Executing,
  Success,
  Error,
}

type CasmToSierraMap = { [key: string]: number[] }
export type BreakPoints = { [key: string]: boolean }

const noOp = () => undefined

type ContextProps = {
  sierraCode: string
  casmCode: string
  compilationState: ProgramCompilationState
  executionState: ProgramExecutionState
  executionPanicMessage: string
  cairoLangCompilerVersion: string
  casmInstructions: IInstruction[]
  serializedOutput?: string
  logs: ILogEntry[]
  tracerData?: TracerData
  executionTraceStepNumber: number
  activeCasmInstructionIndex: number
  errorCasmInstructionIndex: number
  sierraStatements: IInstruction[]
  casmToSierraMap: CasmToSierraMap
  currentTraceEntry?: TraceEntry
  currentSierraVariables?: SierraVariables
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
  compilationState: ProgramCompilationState.Idle,
  executionState: ProgramExecutionState.Idle,
  executionPanicMessage: '',
  executionTraceStepNumber: 0,
  activeCasmInstructionIndex: 0,
  errorCasmInstructionIndex: 0,
  sierraStatements: [],
  casmToSierraMap: {},
  breakPoints: {},

  compileCairoCode: noOp,
  onExecutionStepChange: noOp,
  onContinueExecution: noOp,
  addBreakPoint: noOp,
  removeBreakPoint: noOp,
})

export const CairoVMApiProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [sierraCode, setSierraCode] = useState<string>('')
  const [casmCode, setCasmCode] = useState<string>('')
  const [casmInstructions, setCasmInstructions] = useState<IInstruction[]>([])
  const [cairoLangCompilerVersion, setCairoLangCompilerVersion] = useState('')
  const [compilationState, setCompilationState] =
    useState<ProgramCompilationState>(ProgramCompilationState.Idle)
  const [executionState, setExecutionState] = useState<ProgramExecutionState>(
    ProgramExecutionState.Idle,
  )
  const [serializedOutput, setSerializedOutput] = useState<string | undefined>(
    undefined,
  )
  const [executionPanicMessage, setExecutionPanicMessage] = useState<string>('')
  const [logs, setLogs] = useState<ILogEntry[]>([])
  const [tracerData, setTracerData] = useState<TracerData | undefined>(
    undefined,
  )
  const [breakPoints, setBreakPoints] = useState<BreakPoints>({})
  const [executionTraceStepNumber, setExecutionTraceStepNumber] =
    useState<number>(0)
  const [sierraStatements, setSierraStatements] = useState<IInstruction[]>([])
  const [casmToSierraMap, setCasmToSierraMap] = useState<CasmToSierraMap>({})

  const currentTraceEntry = tracerData?.trace[executionTraceStepNumber]
  const currentSierraVariables =
    tracerData?.entryToSierraVarsMap[executionTraceStepNumber]
  const activeCasmInstructionIndex =
    tracerData?.pcToInstIndexesMap[(currentTraceEntry?.pc ?? 0).toString()] ?? 0
  const errorTraceEntry =
    executionState === ProgramExecutionState.Error
      ? tracerData?.trace.at(-1)
      : null
  const errorCasmInstructionIndex =
    tracerData?.pcToInstIndexesMap[(errorTraceEntry?.pc ?? 0).toString()] ?? -1

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
    setCompilationState(ProgramCompilationState.Compiling)
    setExecutionState(ProgramExecutionState.Executing)

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
        console.log('success')

        setCompilationState(
          data.is_compilation_successful === true
            ? ProgramCompilationState.CompilationSuccess
            : ProgramCompilationState.CompilationErr,
        )
        setExecutionState(
          data.is_execution_successful === true
            ? ProgramExecutionState.Success
            : ProgramExecutionState.Error,
        )

        setExecutionTraceStepNumber(0)
        setCasmCode(data.casm_program_code)
        setSierraCode(data.sierra_program_code)
        setCairoLangCompilerVersion(data.cairo_lang_compiler_version)
        setSerializedOutput(data.serialized_output)
        setLogs(data.logs)
        setExecutionPanicMessage(data.execution_panic_message)
        setTracerData({
          memory: data.tracer_data.memory,
          pcInstMap: data.tracer_data.pc_inst_map,
          trace: data.tracer_data.trace,
          callstack: data.tracer_data.callstack,
          pcToInstIndexesMap: data.tracer_data.pc_to_inst_indexes_map,
          entryToSierraVarsMap: data.tracer_data.trace_entries_to_sierra_vars,
        })
        setBreakPoints(
          Object.keys(data.tracer_data.memory).reduce(
            (state, value) => ({ ...state, [value]: false }),
            {},
          ),
        )
        setCasmInstructions(
          parseStringInstructions(data.casm_formatted_instructions),
        )
        const { sierraStatements, casmToSierraMap } =
          parseSierraFormattedProgramAndCasmToSierraMap(
            data.sierra_formatted_program,
            data.casm_to_sierra_map,
          )
        setSierraStatements(sierraStatements)
        setCasmToSierraMap(casmToSierraMap)
      })
      .catch((error) => {
        console.log('error')
        setCompilationState(ProgramCompilationState.CompilationErr)
        console.error('Error:', error)
      })
  }

  return (
    <CairoVMApiContext.Provider
      value={{
        sierraCode,
        casmCode,
        compilationState,
        executionState,
        executionPanicMessage,
        cairoLangCompilerVersion,
        serializedOutput,
        logs,
        tracerData,
        casmInstructions,
        executionTraceStepNumber,
        currentTraceEntry,
        currentSierraVariables,
        activeCasmInstructionIndex,
        errorCasmInstructionIndex,
        sierraStatements,
        casmToSierraMap,
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

const parseStringInstructions = (
  instructions: string[],
  indexOffset = 0,
): IInstruction[] => {
  return instructions.map((instruction, index) => ({
    id: index + indexOffset,
    name: instruction,
    value: undefined,
    hasBreakpoint: false,
  }))
}

const parseSierraFormattedProgramAndCasmToSierraMap = (
  program: {
    type_declarations: string[]
    libfunc_declarations: string[]
    statements: string[]
    funcs: string[]
  },
  casmToSierraMap: CasmToSierraMap,
): { sierraStatements: IInstruction[]; casmToSierraMap: CasmToSierraMap } => {
  let statements: IInstruction[] = []
  let indexOffset = 0
  statements = statements.concat(
    parseStringInstructions(
      ['// type declarations', ...program.type_declarations],
      indexOffset,
    ),
  )
  indexOffset += program.type_declarations.length + 1
  statements = statements.concat(
    parseStringInstructions(
      ['// libfunc declarations', ...program.libfunc_declarations],
      indexOffset,
    ),
  )
  indexOffset += program.libfunc_declarations.length + 1
  statements = statements.concat(
    parseStringInstructions(
      ['// statements', ...program.statements],
      indexOffset,
    ),
  )
  indexOffset += program.statements.length + 1
  statements = statements.concat(
    parseStringInstructions(['// funcs', ...program.funcs], indexOffset),
  )

  const offset =
    program.type_declarations.length + program.libfunc_declarations.length + 3
  Object.keys(casmToSierraMap).forEach((key) => {
    casmToSierraMap[key] = casmToSierraMap[key].map((v) => v + offset)
  })

  return { sierraStatements: statements, casmToSierraMap }
}
