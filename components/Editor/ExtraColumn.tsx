import { useContext, useState } from 'react'

import { Editor as MonacoEditor, Monaco } from '@monaco-editor/react'
import { editor } from 'monaco-editor'

import { CodeType } from '../../context/appUiContext'
import { CairoVMApiContext } from '../../context/cairoVMApiContext'
import { cn } from '../../util/styles'

import Header from './Header'
import { InstructionsTable } from './InstructionsTable'

type ExtraColumnProps = {
  cairoCode: string
  handleCairoCodeChange: (value: string | undefined) => void
  handleEditorDidMount: (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => void
  isBytecode: boolean
}

const ExtraColumn = ({
  cairoCode,
  handleCairoCodeChange,
  handleEditorDidMount,
  isBytecode,
}: ExtraColumnProps) => {
  const [codeType, setCodeType] = useState<string | undefined>(CodeType.Sierra)

  const {
    casmInstructions,
    activeCasmInstructionIndex,
    errorCasmInstructionIndex,
    sierraStatements,
    casmToSierraProgramMap,
    currentSierraVariables,
    activeSierraIndexes,
  } = useContext(CairoVMApiContext)

  return (
    <>
      <div className="border-b border-gray-200 dark:border-black-500 flex items-center pl-6 pr-2 h-14 flex-none">
        <Header
          codeType={codeType}
          onCodeTypeChange={({ value }) => setCodeType(value)}
          onlyDropDown
        />
      </div>
      <div className="relative pane grow pane-light overflow-auto md:border-r bg-gray-50 dark:bg-black-600 border-gray-200 dark:border-black-500">
        {codeType === CodeType.CASM ? (
          <InstructionsTable
            instructions={casmInstructions}
            codeType={codeType}
            activeIndexes={[activeCasmInstructionIndex]}
            errorIndexes={[errorCasmInstructionIndex]}
            variables={{}}
          />
        ) : codeType === CodeType.Sierra ? (
          <InstructionsTable
            instructions={sierraStatements}
            codeType={codeType}
            activeIndexes={activeSierraIndexes}
            errorIndexes={
              casmToSierraProgramMap[errorCasmInstructionIndex] ?? []
            }
            variables={currentSierraVariables || {}}
          />
        ) : (
          <MonacoEditor
            // @ts-ignore: SCEditor is not TS-friendly
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              wordBreak: 'keepAll',
              wordWrap: 'on',
            }}
            value={codeType === CodeType.Cairo ? cairoCode : ''}
            onChange={handleCairoCodeChange}
            language={'cairo'}
            className={cn('code-editor whitespace-pre-wrap overflow-hidden', {
              'with-numbers': !isBytecode,
            })}
          />
        )}
      </div>
    </>
  )
}

export default ExtraColumn
