import React, { createContext, useState } from 'react'
import { CAIRO_VM_API_URL } from 'util/constants'

import { IInstruction } from 'types'
import { TracerData } from 'components/Tracer'

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
  serializedOutput?: string
  tracerData?: TracerData

  compileCairoCode: (cairoCode: string) => void
}

export const CairoVMApiContext = createContext<ContextProps>({
  sierraCode: '',
  casmCode: '',
  cairoLangCompilerVersion: '',
  serializedOutput: undefined,
  isCompiling: CompilationState.Idle,
  compileCairoCode: () => undefined,
})

export const CairoVMApiProvider: React.FC = ({ children }) => {
  const [sierraCode, setSierraCode] = useState<string>('')
  const [casmCode, setCasmCode] = useState<string>('')
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
        setIsCompiling(CompilationState.Compiled)
        setCasmCode(data.casm_program_code)
        setSierraCode(data.sierra_program_code)
        setCairoLangCompilerVersion(data.cairo_lang_compiler_version)
        setSerializedOutput(data.serialized_output)
        setTracerData({
          memory: data.tracer_data.memory,
          pcInstMap: data.tracer_data.pc_inst_map,
          trace: data.tracer_data.trace,
        })
      })
      .catch((error) => {
        setIsCompiling(CompilationState.Error)
        console.error('Error:', error)
      })
  }

  const _parseCasmCode = (casmCode: string) => {
    const instructions: IInstruction[] = []

    casmCode.split(/\r?\n/).forEach((line, index) => {
      console.log('line:"', line, '"')

      if (line.trim() != '') {
        instructions.push({
          id: index,
          name: line,
          // value: "00",
          hasBreakpoint: false,
        })
      }
    })

    return instructions
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

        compileCairoCode,
      }}
    >
      {children}
    </CairoVMApiContext.Provider>
  )
}
