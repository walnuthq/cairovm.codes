import React, { createContext, useState } from 'react'
import { CAIRO_VM_API_URL } from 'util/constants'

import { IInstruction } from 'types'

export enum CompilationState {
  Idle,
  Compiling,
  Compiled,
  Error,
}

type ContextProps = {
  sierraCode: string
  casmInstructions: IInstruction[]
  isCompiling: CompilationState
  cairoLangCompilerVersion: string

  compileCairoCode: (cairoCode: string) => void
}

export const CairoVMApiContext = createContext<ContextProps>({
  sierraCode: '',
  casmInstructions: [],
  cairoLangCompilerVersion: '',
  isCompiling: CompilationState.Idle,
  compileCairoCode: () => undefined,
})

export const CairoVMApiProvider: React.FC = ({ children }) => {
  const [sierraCode, setSierraCode] = useState<string>('')
  const [casmInstructions, setCasmInstructions] = useState<IInstruction[]>([])
  const [cairoLangCompilerVersion, setCairoLangCompilerVersion] = useState('')
  const [isCompiling, setIsCompiling] = useState<CompilationState>(
    CompilationState.Idle,
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
        setCasmInstructions(_parseCasmInstructions(data.casm_program_code))
        setSierraCode(data.sierra_program_code)
        setCairoLangCompilerVersion(data.cairo_lang_compiler_version)
      })
      .catch((error) => {
        setIsCompiling(CompilationState.Error)
        console.error('Error:', error)
      })
  }

  const _parseCasmInstructions = (casmCode: string) => {
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
        casmInstructions,
        isCompiling,
        cairoLangCompilerVersion,

        compileCairoCode,
      }}
    >
      {children}
    </CairoVMApiContext.Provider>
  )
}
