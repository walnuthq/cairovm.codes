import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  MutableRefObject,
  RefObject,
  Fragment,
} from 'react'

import { bufferToHex } from '@ethereumjs/util'
import { encode, decode } from '@kunigi/string-compression'
import cn from 'classnames'
import copy from 'copy-to-clipboard'
import { useRouter } from 'next/router'
import { OnChangeValue } from 'react-select'
import SCEditor from 'react-simple-code-editor'

import { EthereumContext } from 'context/ethereumContext'
import { SettingsContext, Setting } from 'context/settingsContext'

import { getAbsoluteURL } from 'util/browser'
import {
  getTargetEvmVersion,
  compilerSemVer,
  getBytecodeFromMnemonic,
  getMnemonicFromBytecode,
  getBytecodeLinesFromInstructions,
} from 'util/compiler'
import {
  codeHighlight,
  isEmpty,
  isFullHex,
  isHex,
  objToQueryString,
} from 'util/string'

import examples from 'components/Editor/examples'
import InstructionList from 'components/Editor/Instructions'
import { Button, Icon } from 'components/ui'

import Console from './Console'
import ExecutionState from './ExecutionState'
import ExecutionStatus from './ExecutionStatus'
import Header from './Header'
import { IConsoleOutput, CodeType, ValueUnit, Contract } from './types'
import { CairoVMApiContext, CompilationState } from 'context/cairoVMApiContext'

type Props = {
  readOnly?: boolean
}

type SCEditorRef = {
  _input: HTMLTextAreaElement
} & RefObject<React.FC>

const cairoEditorHeight = 350
const runBarHeight = 52
const sierraEditorHeight = cairoEditorHeight + runBarHeight
const casmInstructionsListHeight = cairoEditorHeight + runBarHeight
const instructionsListWithExpandHeight = cairoEditorHeight + 156 // Advance Mode bar
const consoleHeight = 150

const Editor = ({ readOnly = false }: Props) => {
  const { settingsLoaded, getSetting, setSetting } = useContext(SettingsContext)
  const router = useRouter()

  const {
    deployedContractAddress,
    selectedFork,
    opcodes,
    instructions,
    onForkChange,
  } = useContext(EthereumContext)

  const {
    sierraCode,
    isCompiling,
    compileCairoCode,
  } = useContext(CairoVMApiContext)

  const [cairoCode, setCairoCode] = useState('')
  const [codeType, setCodeType] = useState<string | undefined>()
  const [cairoCodeModified, setCairoCodeModified] = useState(false)
  const [output, setOutput] = useState<IConsoleOutput[]>([
    {
      type: 'info',
      message: 'App initialised...',
    },
  ])
  // const solcWorkerRef = useRef<null | Worker>(null)
  const instructionsRef = useRef() as MutableRefObject<HTMLDivElement>
  const editorRef = useRef<SCEditorRef>()
  const [callData, setCallData] = useState('')
  const [callValue, setCallValue] = useState('')
  const [unit, setUnit] = useState(ValueUnit.Wei as string)

  const [isExpanded, setIsExpanded] = useState(false)

  const log = useCallback(
    (line: string, type = 'info') => {
      // See https://blog.logrocket.com/a-guide-to-usestate-in-react-ecb9952e406c/
      setOutput((previous) => {
        const cloned = previous.map((x) => ({ ...x }))
        cloned.push({ type, message: line })
        return cloned
      })
    },
    [setOutput],
  )

  useEffect(() => {
    const query = router.query

    if ('callValue' in query && 'unit' in query) {
      setCallValue(query.callValue as string)
      setUnit(query.unit as string)
    }

    if ('callData' in query) {
      setCallData(query.callData as string)
    }

    if ('codeType' in query && 'code' in query) {
      setCodeType(query.codeType as string)
      setCairoCode(JSON.parse('{"a":' + decode(query.code as string) + '}').a)
    } else {
      const initialCodeType: CodeType =
        getSetting(Setting.EditorCodeType) || CodeType.Cairo

      setCodeType(initialCodeType)
      setCairoCode(examples[initialCodeType][0])
    }

    if ('fork' in query) {
      onForkChange(query.fork as string)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoaded && router.isReady])

  useEffect(() => {
    if (isCompiling === CompilationState.Compiling) {
      log('Compiling...')
    }

    else if (isCompiling === CompilationState.Compiled) {
      log('Compilation successful')
    }

    else if (isCompiling === CompilationState.Error) {
      log('Compilation failed: ', 'error')
    }
  }, [isCompiling])

  useEffect(() => {
    if (deployedContractAddress) {
      log(`Contract deployed at address: ${deployedContractAddress}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployedContractAddress])

  const handleCairoCodeChange = (value: string) => {
    setCairoCode(value)
    setCairoCodeModified(true)
  }

  const highlightCode = (value: string) => {
    if (!codeType) {
      return value
    }

    if (codeType === CodeType.Bytecode) {
      return codeHighlight(value, codeType).value
    }
    return codeHighlight(value, codeType)
      .value.split('\n')
      .map((line, i) => `<span class='line-number'>${i + 1}</span>${line}`)
      .join('\n')
  }

  const handleCompileRun = useCallback(() => {
    compileCairoCode(cairoCode)
  }, [
    cairoCode,
  ])

  const handleCopyPermalink = useCallback(() => {
    const fork = selectedFork?.name
    const params = {
      fork,
      callValue,
      unit,
      callData,
      codeType,
      code: encodeURIComponent(encode(JSON.stringify(cairoCode))),
    }

    copy(`${getAbsoluteURL('/playground')}?${objToQueryString(params)}`)
    log('Link to current fork, code, calldata and value copied to clipboard')
  }, [selectedFork, callValue, unit, callData, codeType, cairoCode, log])

  const isCompileDisabled = useMemo(() => {
    return isCompiling === CompilationState.Compiling || isEmpty(cairoCode)
  }, [isCompiling, cairoCode])

  const isBytecode = useMemo(() => codeType === CodeType.Bytecode, [codeType])

  const showAdvanceMode = useMemo(() => {
    return codeType === CodeType.Cairo && isExpanded
  }, [codeType, isExpanded])

  return (
    <div className="bg-gray-100 dark:bg-black-700 rounded-lg">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3">
          <div className="border-b border-gray-200 dark:border-black-500 flex items-center pl-6 pr-2 h-14 md:border-r">
            <Header/>
          </div>

          <div>
            <div
              className="relative pane pane-light overflow-auto md:border-r bg-gray-50 dark:bg-black-600 border-gray-200 dark:border-black-500"
              style={{ height: cairoEditorHeight }}
            >
              <SCEditor
                // @ts-ignore: SCEditor is not TS-friendly
                ref={editorRef}
                value={cairoCode}
                readOnly={readOnly}
                onValueChange={handleCairoCodeChange}
                highlight={highlightCode}
                tabSize={4}
                className={cn('code-editor', {
                  'with-numbers': !isBytecode,
                })}
              />
            </div>

            <Fragment>
              {!showAdvanceMode && (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-4 md:py-2 md:border-r border-gray-200 dark:border-black-500">
                  <div className="flex flex-col md:flex-row md:gap-x-4 gap-y-2 md:gap-y-0 mb-4 md:mb-0">
                    <Button
                      onClick={handleCopyPermalink}
                      transparent
                      padded={false}
                    >
                      <span
                        className="inline-block mr-4 select-all"
                        data-tip="Share permalink"
                      >
                        <Icon
                          name="links-line"
                          className="text-indigo-500 mr-1"
                        />
                      </span>
                    </Button>
                  </div>

                  <div>
                    <Button
                      onClick={handleCompileRun}
                      disabled={isCompileDisabled}
                      size="sm"
                      contentClassName="justify-center"
                    >
                      Compile
                    </Button>
                  </div>
                </div>
              )}
            </Fragment>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <div className="border-t md:border-t-0 border-b border-gray-200 dark:border-black-500 flex items-center pl-4 pr-6 h-14 md:border-r">
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              Sierra
            </span>
          </div>

          <div
            className="pane pane-light overflow-auto md:border-r bg-gray-50 dark:bg-black-600 border-gray-200 dark:border-black-500 h-full"
            style={{ height: sierraEditorHeight }}
          >
            <SCEditor
              // @ts-ignore: SCEditor is not TS-friendly
              ref={editorRef}
              value={sierraCode}
              readOnly={readOnly}
              onValueChange={handleCairoCodeChange}
              highlight={highlightCode}
              tabSize={4}
              className={cn('code-editor', {
                'with-numbers': !isBytecode,
              })}
            />
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <div className="border-t md:border-t-0 border-b border-gray-200 dark:border-black-500 flex items-center pl-4 pr-6 h-14">
            <ExecutionStatus />
          </div>

          <div
            className="pane pane-light overflow-auto bg-gray-50 dark:bg-black-600 h-full"
            ref={instructionsRef}
            style={{
              height: isExpanded
                ? instructionsListWithExpandHeight
                : casmInstructionsListHeight,
            }}
          >
            <InstructionList containerRef={instructionsRef} />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row-reverse">
        {/* <div className="w-full md:w-1/2">
          <div
            className="pane pane-dark overflow-auto border-t border-black-900/25 bg-gray-800 dark:bg-black-700 text-white px-4 py-3"
            style={{ height: consoleHeight }}
          >
            <ExecutionState />
          </div>
        </div> */}
        <div className="w-full">
          <div
            className="pane pane-dark overflow-auto bg-gray-800 dark:bg-black-700 text-white border-t border-black-900/25 md:border-r"
            style={{ height: consoleHeight }}
          >
            <Console output={output} />
          </div>
        </div>
      </div>

      <div className="rounded-b-lg py-2 px-4 border-t bg-gray-800 dark:bg-black-700 border-black-900/25 text-gray-400 dark:text-gray-600 text-xs">
        Cairo Compiler v2.5.0
         {/* {compilerSemVer} */}
      </div>
    </div>
  )
}

export default Editor
