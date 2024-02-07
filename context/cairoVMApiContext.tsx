import React, { createContext, useState } from 'react'

import { IInstruction } from 'types'

import { CAIRO_VM_API_URL } from 'util/constants'

import { TraceEntry, TracerData } from 'components/Tracer'

export enum CompilationState {
  Idle,
  Compiling,
  Compiled,
  Error,
}

type CasmToSierraMap = { [key: string]: number[] }

type ContextProps = {
  sierraCode: string
  casmCode: string
  isCompiling: CompilationState
  cairoLangCompilerVersion: string
  casmInstructions: IInstruction[]
  serializedOutput?: string
  tracerData?: TracerData
  executionTraceStepNumber: number
  activeCasmInstructionIndex: number
  sierraStatements: IInstruction[]
  casmToSierraMap: CasmToSierraMap
  currentTraceEntry?: TraceEntry

  compileCairoCode: (cairoCode: string) => void
  onExecutionStepChange: (step: number) => void
}

export const CairoVMApiContext = createContext<ContextProps>({
  sierraCode: '',
  casmCode: '',
  casmInstructions: [],
  cairoLangCompilerVersion: '',
  serializedOutput: undefined,
  isCompiling: CompilationState.Idle,
  executionTraceStepNumber: 0,
  activeCasmInstructionIndex: 0,
  sierraStatements: [],
  casmToSierraMap: {},

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
  const [tracerData, setTracerData] = useState<TracerData | undefined>(
    undefined,
  )
  const [executionTraceStepNumber, setExecutionTraceStepNumber] =
    useState<number>(0)
  const [sierraStatements, setSierraStatements] = useState<IInstruction[]>([])
  const [casmToSierraMap, setCasmToSierraMap] = useState<CasmToSierraMap>({})

  const currentTraceEntry = tracerData?.trace[executionTraceStepNumber]
  const activeCasmInstructionIndex =
    tracerData?.pcToInstIndexesMap[(currentTraceEntry?.pc ?? 0).toString()] ?? 0

  function onExecutionStepChange(stepNumber: number) {
    setExecutionTraceStepNumber(stepNumber)
  }

  const compileCairoCode = (cairoCode: string) => {
    setIsCompiling(CompilationState.Compiling)

    fetch(CAIRO_VM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cairo_program_code: cairoCode }),
    })
      .then((response) => response.json())
      .then((data) => {
        setExecutionTraceStepNumber(0)
        setIsCompiling(CompilationState.Compiled)
        setCasmCode(data.casm_program_code)
        setSierraCode(data.sierra_program_code)
        setCairoLangCompilerVersion(data.cairo_lang_compiler_version)
        setSerializedOutput(data.serialized_output)
        setTracerData({
          memory: data.tracer_data.memory,
          pcInstMap: data.tracer_data.pc_inst_map,
          trace: data.tracer_data.trace,
          pcToInstIndexesMap: data.tracer_data.pc_to_inst_indexes_map,
        })
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
        tracerData,
        casmInstructions,
        executionTraceStepNumber,
        currentTraceEntry,
        activeCasmInstructionIndex,
        sierraStatements,
        casmToSierraMap,

        compileCairoCode,
        onExecutionStepChange,
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
