import React, {
  PropsWithChildren,
  createContext,
  useState,
  useEffect,
  useRef,
} from 'react'

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

export enum ProgramDebugMode {
  Execution = 'Debug VM Execution Trace',
  Sierra = 'Debug Sierra',
}

interface Position {
  line: number
  col: number
}

interface Location {
  start: Position
  end: Position
}
interface SierraStatementsToCairoInfo {
  [key: string]: {
    fn_name: string
    cairo_locations: Location[]
  }
}
type CasmToSierraMap = { [key: string]: number[] }
export type BreakPoints = { [key: string]: boolean }

const noOp = () => undefined

type ContextProps = {
  debugMode: ProgramDebugMode
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
  sierraSubStepIndex: number | undefined
  activeCasmInstructionIndex: number
  activeSierraIndexes: number[]
  errorCasmInstructionIndex: number
  sierraStatements: IInstruction[]
  casmToSierraStatementsMap: CasmToSierraMap
  casmToSierraProgramMap: CasmToSierraMap

  currentTraceEntry?: TraceEntry
  currentSierraVariables?: SierraVariables
  breakPoints?: BreakPoints
  sierraStatementsToCairoInfo?: SierraStatementsToCairoInfo

  setDebugMode: (debugMode: ProgramDebugMode) => void
  compileCairoCode: (cairoCode: string, programArguments: string) => void
  onExecutionStepChange: (action: 'increase' | 'decrease') => void
  onContinueExecution: () => void
  addBreakPoint: (addr: string) => void
  removeBreakPoint: (addr: string) => void
}

export const CairoVMApiContext = createContext<ContextProps>({
  debugMode: ProgramDebugMode.Execution,
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
  sierraSubStepIndex: undefined,
  activeCasmInstructionIndex: 0,
  activeSierraIndexes: [],
  errorCasmInstructionIndex: 0,
  sierraStatements: [],
  casmToSierraProgramMap: {},
  breakPoints: {},
  sierraStatementsToCairoInfo: {},
  casmToSierraStatementsMap: {},

  compileCairoCode: noOp,
  onExecutionStepChange: noOp,
  onContinueExecution: noOp,
  addBreakPoint: noOp,
  removeBreakPoint: noOp,
  setDebugMode: noOp,
})

export const CairoVMApiProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [debugMode, setDebugMode] = useState<ProgramDebugMode>(
    ProgramDebugMode.Execution,
  )
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
  const [sierraSubStepIndex, setSierraSubStepIndex] = useState<
    number | undefined
  >(undefined)
  const [sierraStatements, setSierraStatements] = useState<IInstruction[]>([])
  const [sierraStatementsToCairoInfo, setSierraStatementsToCairoInfo] =
    useState<SierraStatementsToCairoInfo>({})
  const [casmToSierraProgramMap, setCasmToSierraProgramMap] =
    useState<CasmToSierraMap>({})
  const [casmToSierraStatementsMap, setCasmToSierraStatementsMap] =
    useState<CasmToSierraMap>({})

  const currentTraceEntry = tracerData?.trace[executionTraceStepNumber]
  const currentSierraVariables =
    tracerData?.entryToSierraVarsMap[executionTraceStepNumber]
  const activeCasmInstructionIndex =
    tracerData?.pcToInstIndexesMap[(currentTraceEntry?.pc ?? 0).toString()] ?? 0
  const errorTraceEntry =
    executionState === ProgramExecutionState.Error
      ? tracerData?.trace.at(-2)
      : null
  const errorCasmInstructionIndex =
    tracerData?.pcToInstIndexesMap[(errorTraceEntry?.pc ?? 0).toString()] ?? -1

  // array of sierra indexes for the current activeCasmInstructionIndex
  const currentSierraIndexes =
    casmToSierraProgramMap[activeCasmInstructionIndex]

  // array of active sierra indexes (based on debug mode - sierra or vm execution trace)
  let activeSierraIndexes: number[] = []

  // If Sierra indexes for the current step exist
  if (currentSierraIndexes) {
    // if its sierra debug mode
    if (debugMode === ProgramDebugMode.Sierra) {
      // If sierra sub step index exists
      // then we assign activeSierraIndexes with the corresponding sierraIndex
      if (sierraSubStepIndex !== undefined) {
        activeSierraIndexes = [currentSierraIndexes[sierraSubStepIndex]]
      }
      // Otherwise, leave activeSierraIndexes as an empty array
    } else if (debugMode === ProgramDebugMode.Execution) {
      // In execution trace mode, use all Sierra indexes
      activeSierraIndexes = currentSierraIndexes
    }
  } // If no Sierra indexes for the current step exist, activeSierraIndexes remains an empty array

  const prevAction = useRef<'increase' | 'decrease'>()
  const traceLength = tracerData?.trace?.length

  useEffect(() => {
    // only if program is in sierra debug mode
    if (debugMode === ProgramDebugMode.Sierra) {
      if (currentSierraIndexes && currentSierraIndexes.length > 0) {
        // if sierraActiveIndexes exist then we initialise it with last index or 0 index
        // based on the button action (increase / decrease)
        if (prevAction.current === 'increase') {
          setSierraSubStepIndex(0)
        } else {
          setSierraSubStepIndex(currentSierraIndexes.length - 1)
        }
      }
      // when no sierraActiveIndexes exist
      else if (prevAction.current !== undefined) {
        // !!!Important Note!!!:
        // due to the dependency of executionTraceStepNumber
        // this will be called recursively until
        // we find a step with some sierraActiveIndexes or trace step is at the end or the start
        // This helps in skipping all trace steps without sierra statements

        // if action was of increase then we increase step number
        // with checks if its less than tracelength
        if (
          prevAction.current === 'increase' &&
          traceLength &&
          executionTraceStepNumber + 1 < traceLength
        ) {
          setExecutionTraceStepNumber((prev) => prev + 1)
        }
        // if action was of decrease then we decrease step number
        // with checks if its more than 0
        else if (
          prevAction.current === 'decrease' &&
          executionTraceStepNumber > 0
        ) {
          setExecutionTraceStepNumber((prev) => prev - 1)
        }
      }
    }
  }, [debugMode, currentSierraIndexes, executionTraceStepNumber, traceLength])

  const onExecutionStepChange = (action: 'increase' | 'decrease') => {
    // once executionTraceStepNumber is updated, sierraActiveIndexes updates
    // so to know whether to initialize sub step with first or last element of sierraActiveIndexes
    // we save the action in ref which we use in useEffect hook above
    prevAction.current = action

    // check if it's Sierra debug mode.
    if (debugMode === ProgramDebugMode.Sierra) {
      // Check if there are active sub-steps for the current execution step
      if (sierraSubStepIndex !== undefined) {
        if (action === 'increase') {
          // Move to the next sub-step
          if (sierraSubStepIndex < currentSierraIndexes.length - 1) {
            setSierraSubStepIndex(sierraSubStepIndex + 1)
          } else {
            // No more sub-steps, move to the next trace step
            setExecutionTraceStepNumber((prev) => prev + 1)
            // Reset sub-step since we're changing steps
            setSierraSubStepIndex(undefined)
          }
        } else if (action === 'decrease') {
          // Move to the previous sub-step
          if (sierraSubStepIndex > 0) {
            setSierraSubStepIndex(sierraSubStepIndex - 1)
          } else {
            // No more sub-steps, move to the previous trace step
            setExecutionTraceStepNumber((prev) => prev - 1)
            // Reset sub-step since we're changing steps
            setSierraSubStepIndex(undefined)
          }
        }
      } else {
        // if no substep then we simply increase executionTraceStepNumber
        setExecutionTraceStepNumber((prev) =>
          action === 'increase' ? prev + 1 : prev - 1,
        )
      }
    } else {
      // default behaviour for vm execution trace
      setExecutionTraceStepNumber((prev) =>
        action === 'increase' ? prev + 1 : prev - 1,
      )
    }
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
        setSierraSubStepIndex(undefined)
        setLogs(data.logs)
        setExecutionState(
          data.is_execution_successful === true
            ? ProgramExecutionState.Success
            : ProgramExecutionState.Error,
        )
        setExecutionTraceStepNumber(
          data.is_execution_successful === true
            ? 0
            : data.tracer_data.trace.length - 2,
        )
        setCasmCode(data.casm_program_code)
        setSierraCode(data.sierra_program_code)
        setCairoLangCompilerVersion(data.cairo_lang_compiler_version)
        setSerializedOutput(data.serialized_output)
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
        setSierraStatementsToCairoInfo(
          data.tracer_data.sierra_to_cairo_debug_info
            .sierra_statements_to_cairo_info,
        )
        setCasmToSierraStatementsMap(data.casm_to_sierra_map)
        setCasmInstructions(
          parseStringInstructions(data.casm_formatted_instructions),
        )
        const { sierraStatements, casmToSierraProgramMap } =
          parseSierraFormattedProgramAndCasmToSierraMap(
            data.sierra_formatted_program,
            data.casm_to_sierra_map,
          )
        setSierraStatements(sierraStatements)
        setCasmToSierraProgramMap(casmToSierraProgramMap)
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
        debugMode,
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
        sierraSubStepIndex,
        currentTraceEntry,
        currentSierraVariables,
        activeCasmInstructionIndex,
        activeSierraIndexes,
        errorCasmInstructionIndex,
        sierraStatements,
        casmToSierraProgramMap,
        casmToSierraStatementsMap,
        breakPoints,
        sierraStatementsToCairoInfo,
        setDebugMode,
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
): {
  sierraStatements: IInstruction[]
  casmToSierraProgramMap: CasmToSierraMap
} => {
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

  const casmToSierraProgramMap: CasmToSierraMap = {}

  const offset =
    program.type_declarations.length + program.libfunc_declarations.length + 3
  Object.keys(casmToSierraMap).forEach((key) => {
    casmToSierraProgramMap[key] = casmToSierraMap[key].map(
      (v: number) => v + offset,
    )
  })

  return {
    sierraStatements: statements,
    casmToSierraProgramMap: casmToSierraProgramMap,
  }
}
