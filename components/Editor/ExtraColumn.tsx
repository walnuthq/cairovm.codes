import { useContext, useState } from 'react'

import cn from 'classnames'
import SCEditor from 'react-simple-code-editor'

import { CodeType } from '../../context/appUiContext'
import { CairoVMApiContext } from '../../context/cairoVMApiContext'

import Header from './Header'
import { InstructionsTable } from './InstructionsTable'

type ExtraColumnProps = {
  cairoEditorHeight: number
  cairoCode: string
  highlightCode: (value: string, codeType: string | undefined) => string
  isBytecode: boolean
}

const ExtraColumn = ({
  cairoEditorHeight,
  cairoCode,
  highlightCode,
  isBytecode,
}: ExtraColumnProps) => {
  const [codeType, setCodeType] = useState<string | undefined>(CodeType.Sierra)

  const {
    casmInstructions,
    activeCasmInstructionIndex,
    errorCasmInstructionIndex,
    sierraStatements,
    casmToSierraMap,
    currentSierraVariables,
  } = useContext(CairoVMApiContext)

  return (
    <div className="w-full md:w-1/3 flex flex-col">
      <div className="border-b border-gray-200 dark:border-black-500 flex items-center pl-6 pr-2 h-14 md:border-r">
        <Header
          codeType={codeType}
          onCodeTypeChange={({ value }) => setCodeType(value)}
          onlyDropDown
        />
      </div>
      <div
        className="relative pane grow pane-light overflow-auto md:border-r bg-gray-50 dark:bg-black-600 border-gray-200 dark:border-black-500"
        style={{ height: cairoEditorHeight }}
      >
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
            activeIndexes={casmToSierraMap[activeCasmInstructionIndex] ?? []}
            errorIndexes={casmToSierraMap[errorCasmInstructionIndex] ?? []}
            variables={currentSierraVariables || {}}
          />
        ) : (
          <SCEditor
            // @ts-ignore: SCEditor is not TS-friendly
            value={codeType === CodeType.Cairo ? cairoCode : ''}
            readOnly={true}
            onValueChange={() => void 0} // as its readonly mode, we do nothing onValueChange(a required prop)
            highlight={(value) => highlightCode(value, codeType)}
            tabSize={4}
            className={cn('code-editor', {
              'with-numbers': !isBytecode,
            })}
          />
        )}
      </div>
    </div>
  )
}

export default ExtraColumn
