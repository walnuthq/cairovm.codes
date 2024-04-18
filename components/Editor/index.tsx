import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { decode, encode } from '@kunigi/string-compression'
import { Editor as MonacoEditor, Monaco, useMonaco } from '@monaco-editor/react'
import copy from 'copy-to-clipboard'
import { Priority, useRegisterActions } from 'kbar'
import { editor } from 'monaco-editor'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'

import {
  CairoVMApiContext,
  ProgramCompilationState,
  ProgramExecutionState,
} from 'context/cairoVMApiContext'
import { Setting, SettingsContext } from 'context/settingsContext'

import { getAbsoluteURL } from 'util/browser'
import { isArgumentStringValid } from 'util/compiler'
import { codeHighlight, isEmpty, objToQueryString } from 'util/string'

import { Examples } from 'components/Editor/examples'
import { Tracer } from 'components/Tracer'

import { AppUiContext, CodeType, LogType } from '../../context/appUiContext'
import { cn } from '../../util/styles'

import { ArgumentsHelperModal } from './ArgumentsHelperModal'
import { registerCairoLanguageSupport } from './cairoLangConfig'
import EditorControls from './EditorControls'
import EditorFooter from './EditorFooter'
import ExtraColumn from './ExtraColumn'
import Header from './Header'
import { InstructionsTable } from './InstructionsTable'
// @ts-ignore - Cairo is not part of the official highlightjs package
type Props = {
  readOnly?: boolean
}

const Editor = ({ readOnly = false }: Props) => {
  const { settingsLoaded, getSetting } = useContext(SettingsContext)
  const router = useRouter()

  const {
    compilationState,
    executionState,
    executionPanicMessage,
    compileCairoCode,
    serializedOutput,
    casmInstructions,
    activeCasmInstructionIndex,
    errorCasmInstructionIndex,
    sierraStatements,
    casmToSierraProgramMap,
    casmToSierraStatementsMap,
    currentSierraVariables,
    sierraStatementsToCairoInfo,
    logs: apiLogs,
  } = useContext(CairoVMApiContext)

  const { addToConsoleLog, isThreeColumnLayout } = useContext(AppUiContext)

  const { theme } = useTheme()

  const [cairoCode, setCairoCode] = useState('')
  const [compiledCairoCode, setCompiledCairoCode] = useState(cairoCode)
  const [exampleOption, setExampleOption] = useState<number>(0)
  const [codeType, setCodeType] = useState<string | undefined>()
  const [programArguments, setProgramArguments] = useState<string>('')

  const editorRef = useRef<editor.IStandaloneCodeEditor>()
  const monaco = useMonaco()

  useEffect(() => {
    // when theme is changed, we again set theme of editor
    if (theme === 'dark') {
      monaco?.editor.setTheme('dark-theme')
    } else {
      monaco?.editor.setTheme('light-theme')
    }
  }, [monaco?.editor, theme])

  const handleEditorDidMount = async (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    editorRef.current = editor
    registerCairoLanguageSupport(monaco as any)
    // once the editor is mounted we set the user selected theme
    if (theme === 'dark') {
      monaco.editor.setTheme('dark-theme')
    } else {
      monaco.editor.setTheme('light-theme')
    }
  }

  const [decorations, setDecorations] = useState([])

  interface DecorationOptions {
    inlineClassName: string
  }
  interface Decoration {
    range: {
      startLineNumber: number
      startColumn: number
      endLineNumber: number
      endColumn: number
    }
    options: DecorationOptions
  }

  useEffect(() => {
    setTimeout(() => {
      const multiplieDecorations: Decoration[] = []
      let isHighlightOnScreen = false
      casmToSierraProgramMap[activeCasmInstructionIndex]?.map((item, i) => {
        const index = casmToSierraStatementsMap[activeCasmInstructionIndex][i]

        if (sierraStatementsToCairoInfo) {
          sierraStatementsToCairoInfo[index]?.cairo_locations.map(
            (cairoLocElem) => {
              if (
                isRangeVisible(cairoLocElem.start.line, cairoLocElem.end.line)
              ) {
                isHighlightOnScreen = true
              }
              const startLine: number = cairoLocElem.start.line + 1
              const endLine: number = cairoLocElem.end.line + 1
              const startCol: number = cairoLocElem.start.col + 1
              const endCol: number = cairoLocElem.end.col + 1
              if (monaco) {
                multiplieDecorations.push({
                  range: new monaco.Range(startLine, startCol, endLine, endCol),
                  options: { inlineClassName: 'bg-yellow-300 bg-opacity-40' },
                })
              }
            },
          )

          if (!isHighlightOnScreen && multiplieDecorations[0] && monaco) {
            editorRef.current?.revealRangeInCenter(
              new monaco.Range(
                multiplieDecorations[0].range.startLineNumber,
                multiplieDecorations[0].range.startColumn,
                multiplieDecorations[0].range.endLineNumber,
                multiplieDecorations[0].range.endColumn,
              ),
            )
          }
        }
      }) || []
      const editor = editorRef.current as any
      if (editor) {
        if (cairoCode === compiledCairoCode) {
          const newDecorationsIds = editor.deltaDecorations(
            decorations,
            multiplieDecorations,
          )
          setDecorations(newDecorationsIds)
        } else {
          const newDecorationsIds = editor.deltaDecorations(decorations, [])
          setDecorations(newDecorationsIds)
        }
      }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCasmInstructionIndex, codeType, cairoCode, compiledCairoCode])
  const [showArgumentsHelper, setShowArgumentsHelper] = useState(false)

  const { isFullScreen } = useContext(AppUiContext)

  useEffect(() => {
    const query = router.query

    if ('codeType' in query && 'code' in query) {
      setCodeType(query.codeType as string)
      setCairoCode(JSON.parse('{"a":' + decode(query.code as string) + '}').a)
    } else {
      const initialCodeType: CodeType =
        getSetting(Setting.EditorCodeType) || CodeType.Cairo

      setCodeType(initialCodeType)
      setCairoCode(Examples[initialCodeType][exampleOption])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoaded && router.isReady, exampleOption])

  useEffect(() => {
    if (compilationState === ProgramCompilationState.Compiling) {
      addToConsoleLog('Compiling...')
      return
    }

    if (compilationState === ProgramCompilationState.CompilationSuccess) {
      addToConsoleLog('Compilation successful')

      if (serializedOutput) {
        addToConsoleLog(`Execution output: ${serializedOutput}`)
      }

      if (executionState === ProgramExecutionState.Error) {
        addToConsoleLog(
          'Runtime error: ' + executionPanicMessage,
          LogType.Error,
        )
      }
    } else if (compilationState === ProgramCompilationState.CompilationErr) {
      addToConsoleLog('Compilation failed', LogType.Error)
    }

    // Compilation finished, log the API logs, if any
    for (const apiLogEntry of apiLogs) {
      let log_type
      if (apiLogEntry.log_type == 'Error') {
        log_type = LogType.Error
      } else if (apiLogEntry.log_type == 'Warn') {
        log_type = LogType.Warn
      } else {
        log_type = LogType.Info
      }

      addToConsoleLog(apiLogEntry.message, log_type)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    compilationState,
    executionState,
    serializedOutput,
    apiLogs,
    executionPanicMessage,
  ])

  const isRangeVisible = (startLine: number, endLine: number) => {
    const editor = editorRef.current
    if (editor) {
      const visibleRanges = editor.getVisibleRanges()
      return visibleRanges.some(
        (visibleRange) =>
          visibleRange.startLineNumber <= endLine &&
          visibleRange.endLineNumber >= startLine,
      )
    }
    return false
  }

  const handleCairoCodeChange = (value: string | undefined) => {
    if (value) {
      setCairoCode(value)
    } else {
      setCairoCode('')
    }
  }

  const highlightCode = (value: string, codeType: string | undefined) => {
    if (!codeType) {
      return value
    }

    let _codeType = codeType

    if (_codeType === CodeType.Sierra) {
      _codeType = CodeType.Cairo
    }

    if (_codeType === CodeType.CASM) {
      _codeType = 'bytecode'
    }

    return codeHighlight(value, _codeType)
      .value.split('\n')
      .map((line, i) => `<span class='line-number'>${i + 1}</span>${line}`)
      .join('\n')
  }

  const removeExtraWhitespaces = (value: string) => {
    const sanitizedValue = value.trim().replace(/\s+/g, ' ')
    return sanitizedValue
  }

  const handleProgramArgumentsUpdate = useCallback(
    (_programArguments: string) => {
      setProgramArguments(_programArguments)
    },
    [setProgramArguments],
  )

  const handleCompileRun = useCallback(() => {
    compileCairoCode(cairoCode, removeExtraWhitespaces(programArguments))
    setCompiledCairoCode(cairoCode)
  }, [cairoCode, programArguments, compileCairoCode])

  const handleCopyPermalink = useCallback(() => {
    const params = {
      codeType,
      code: encodeURIComponent(encode(JSON.stringify(cairoCode))),
    }

    copy(`${getAbsoluteURL('/')}?${objToQueryString(params)}`)
    addToConsoleLog('Link with current Cairo code copied to clipboard')
  }, [cairoCode, codeType, addToConsoleLog])

  const areProgramArgumentsValid = useMemo(() => {
    const sanitizedArguments = removeExtraWhitespaces(programArguments)
    return isArgumentStringValid(sanitizedArguments)
  }, [programArguments])

  const isCompileDisabled = useMemo(() => {
    return (
      compilationState === ProgramCompilationState.Compiling ||
      isEmpty(cairoCode)
    )
  }, [compilationState, cairoCode])

  const isBytecode = false

  const actions = [
    {
      id: 'cairo',
      name: 'Cairo',
      shortcut: ['x'],
      keywords: 'Cairo',
      section: 'Execution',
      perform: () => {
        setCodeType(CodeType.Cairo)
      },
      subtitle: 'Switch to Cairo',
      priority: Priority.HIGH,
    },
    {
      id: 'sierra',
      name: 'Sierra',
      shortcut: ['s'],
      keywords: 'Sierra',
      section: 'Execution',
      perform: () => {
        setCodeType(CodeType.Sierra)
      },
      subtitle: 'Switch to Sierra',
      priority: Priority.HIGH,
    },
    {
      id: 'casm',
      name: 'Casm',
      shortcut: ['w'],
      keywords: 'Casm',
      section: 'Execution',
      perform: () => {
        setCodeType(CodeType.CASM)
      },
      subtitle: 'Switch to Casm',
      priority: Priority.HIGH,
    },
  ]
  useRegisterActions(actions, [highlightCode])

  return (
    <>
      <div
        className={cn(
          'bg-gray-100 dark:bg-black-700 ',
          !isFullScreen && 'rounded-lg',
        )}
      >
        <div
          className={cn(
            'flex flex-col md:flex-row',
            isFullScreen
              ? 'md:h-[calc(100vh_-_42px)]'
              : 'md:h-[70vh] border-t border-l border-r rounded-t-lg border-gray-200 dark:border-black-500',
          )}
        >
          <div
            className={cn(
              'w-full md:w-1/2 flex flex-col',
              isThreeColumnLayout && 'md:w-2/3',
            )}
          >
            <div className={cn('flex flex-row grow')}>
              <div
                className={cn(
                  'w-full flex flex-col justify-between grow h-[50vh] md:h-auto',
                  isThreeColumnLayout && 'md:w-1/2',
                )}
              >
                <div className="border-b border-gray-200 dark:border-black-500 flex items-center pl-6 pr-2 h-14 flex-none md:border-r justify-between">
                  <Header
                    codeType={codeType}
                    onCodeTypeChange={({ value }) => setCodeType(value)}
                    withLogo={isFullScreen}
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
                      activeIndexes={
                        casmToSierraProgramMap[activeCasmInstructionIndex] ?? []
                      }
                      errorIndexes={
                        casmToSierraProgramMap[errorCasmInstructionIndex] ?? []
                      }
                      variables={currentSierraVariables || {}}
                    />
                  ) : (
                    <div className="h-full overflow-auto pane pane-light">
                      <MonacoEditor
                        // @ts-ignore: SCEditor is not TS-friendly

                        onMount={handleEditorDidMount}
                        options={{
                          minimap: { enabled: false },
                          wordBreak: 'keepAll',
                          wordWrap: 'on',
                          readOnly: readOnly,
                        }}
                        value={codeType === CodeType.Cairo ? cairoCode : ''}
                        onChange={handleCairoCodeChange}
                        language={'cairo'}
                        className={cn(
                          'code-editor whitespace-pre-wrap overflow-hidden',
                          {
                            'with-numbers': !isBytecode,
                          },
                        )}
                      />
                    </div>
                  )}
                </div>

                <EditorControls
                  isCompileDisabled={isCompileDisabled}
                  programArguments={programArguments}
                  areProgramArgumentsValid={areProgramArgumentsValid}
                  onCopyPermalink={handleCopyPermalink}
                  onProgramArgumentsUpdate={handleProgramArgumentsUpdate}
                  onCompileRun={handleCompileRun}
                  onShowArgumentsHelper={() => setShowArgumentsHelper(true)}
                  handleChangeExampleOption={(newExample) =>
                    newExample !== null
                      ? setExampleOption(newExample.value)
                      : setExampleOption(0)
                  }
                />
              </div>

              {isThreeColumnLayout && (
                <div
                  className={cn(
                    'w-full flex flex-col justify-between grow h-[50vh] md:h-auto',
                    isThreeColumnLayout && 'md:w-1/2',
                  )}
                >
                  <ExtraColumn
                    cairoCode={cairoCode}
                    handleCairoCodeChange={handleCairoCodeChange}
                    handleEditorDidMount={handleEditorDidMount}
                    isBytecode={isBytecode}
                  />
                </div>
              )}
            </div>
            <div className={cn('h-[22vh] border-r border-t bg-red-300')}>
              {/* <div className=" border-gray-200 dark:border-black-500 flex items-center pl-6 pr-2 h-14 flex-none md:border-r justify-between"> */}
              Console
              {/* </div> */}
            </div>
          </div>

          <div
            className={cn(
              'w-full md:w-1/2 flex flex-col justify-between h-[50vh] md:h-auto',
              isThreeColumnLayout && 'md:w-1/3',
            )}
          >
            <Tracer />
          </div>
        </div>

        <EditorFooter />
      </div>
      <ArgumentsHelperModal
        showArgumentsHelper={showArgumentsHelper}
        setShowArgumentsHelper={setShowArgumentsHelper}
      />
    </>
  )
}

export default Editor
