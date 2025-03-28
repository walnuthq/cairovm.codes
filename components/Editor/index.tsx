import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Editor as MonacoEditor, Monaco, useMonaco } from '@monaco-editor/react'
import copy from 'copy-to-clipboard'
import { Priority, useRegisterActions } from 'kbar'
import LZString from 'lz-string'
import { editor } from 'monaco-editor'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'

import {
  CairoVMApiContext,
  ProgramCompilationState,
  ProgramDebugMode,
  ProgramExecutionState,
} from 'context/cairoVMApiContext'
import { Setting, SettingsContext } from 'context/settingsContext'

import { getAbsoluteURL } from 'util/browser'
import { isArgumentStringValid } from 'util/compiler'
import {
  codeHighlight,
  formatTime,
  isEmpty,
  objToQueryString,
} from 'util/string'

import { Examples } from 'components/Editor/examples'
import { Tracer } from 'components/Tracer'

import { AppUiContext, CodeType, LogType } from '../../context/appUiContext'
import { cn } from '../../util/styles'

import { ArgumentsHelperModal } from './ArgumentsHelperModal'
import { registerCairoLanguageSupport } from './cairoLangConfig'
import Console from './Console'
import { DownloadProof } from './DownloadProof'
import EditorControls from './EditorControls'
import EditorFooter from './EditorFooter'
import ExtraColumn from './ExtraColumn'
import Header from './Header'
import { InstructionsTable } from './InstructionsTable'

// @ts-ignore - Cairo is not part of the official highlightjs package
type Props = {
  readOnly?: boolean
  isCairoLangPage?: boolean
}

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

const Editor = ({ readOnly = false, isCairoLangPage = false }: Props) => {
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
    sierraSubStepIndex,
    debugMode,
    activeSierraIndexes,
    setDebugMode,
    proof,
    proofTime,
    verificationTime,
    provingIsNotSupported,
    proofRequired,
  } = useContext(CairoVMApiContext)

  const { addToConsoleLog, isThreeColumnLayout } = useContext(AppUiContext)

  const { theme } = useTheme()

  const [cairoCode, setCairoCode] = useState('')
  const [compiledCairoCode, setCompiledCairoCode] = useState(cairoCode)
  const [exampleOption, setExampleOption] = useState<number>(0)
  const [codeType, setCodeType] = useState<string | undefined>()
  const [programArguments, setProgramArguments] = useState<string>('')
  const [editorDecorations, setEditorDecorations] =
    useState<editor.IEditorDecorationsCollection | null>(null)
  const editorRef = useRef<editor.IStandaloneCodeEditor>()
  const monaco = useMonaco()

  useEffect(() => {
    // when theme is changed, we again set theme of editor
    if (theme === 'dark' || isCairoLangPage) {
      monaco?.editor.setTheme('dark-theme')
    } else {
      monaco?.editor.setTheme('light-theme')
    }
  }, [monaco?.editor, theme, isCairoLangPage])

  const handleEditorDidMount = async (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    editorRef.current = editor
    registerCairoLanguageSupport(monaco as any)
    // once the editor is mounted we set the user selected theme
    if (theme === 'dark' || isCairoLangPage) {
      monaco.editor.setTheme('dark-theme')
    } else {
      monaco.editor.setTheme('light-theme')
    }
  }

  function highLightEditor(decorations: Decoration[]) {
    const editor = editorRef.current
    if (editor) {
      // we clear previous decorations
      editorDecorations?.clear()
      // add editor decorations
      const editor_decorations = editor.createDecorationsCollection(decorations)
      // update new decorations
      setEditorDecorations(editor_decorations)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      const multipleDecorations: Decoration[] = []
      let isHighlightOnScreen = false
      const isSierraDebugMode = debugMode === ProgramDebugMode.Sierra

      casmToSierraProgramMap[activeCasmInstructionIndex]?.forEach((item, i) => {
        const index = isSierraDebugMode
          ? sierraSubStepIndex !== undefined
            ? casmToSierraStatementsMap[activeCasmInstructionIndex][
                sierraSubStepIndex
              ]
            : undefined
          : casmToSierraStatementsMap[activeCasmInstructionIndex][i]

        // if in sierra debugmode we dont need to add decorations for
        // all sierra statements in current activeCasmInstructionIndex
        // we need to add decorations just for the current substep sierra statement
        if (isSierraDebugMode && i > 0) {
          return
        }

        if (sierraStatementsToCairoInfo && index !== undefined) {
          sierraStatementsToCairoInfo[index]?.cairo_locations.forEach(
            (cairoLocElem) => {
              const isInsideVisibleRange = isRangeVisible(
                cairoLocElem.start.line,
                cairoLocElem.end.line,
              )
              if (isInsideVisibleRange) {
                isHighlightOnScreen = true
              }
              const startLine: number = cairoLocElem.start.line + 1
              const endLine: number = cairoLocElem.end.line + 1
              const startCol: number = cairoLocElem.start.col + 1
              const endCol: number = cairoLocElem.end.col + 1
              if (monaco) {
                multipleDecorations.push({
                  range: new monaco.Range(startLine, startCol, endLine, endCol),
                  options: { inlineClassName: 'bg-yellow-300 bg-opacity-40' },
                })
              }
            },
          )

          if (!isHighlightOnScreen && multipleDecorations[0] && monaco) {
            editorRef.current?.revealRangeInCenter(
              new monaco.Range(
                multipleDecorations[0].range.startLineNumber,
                multipleDecorations[0].range.startColumn,
                multipleDecorations[0].range.endLineNumber,
                multipleDecorations[0].range.endColumn,
              ),
            )
          }
        }
      })

      highLightEditor(multipleDecorations)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeCasmInstructionIndex,
    codeType,
    cairoCode,
    compiledCairoCode,
    debugMode,
    sierraSubStepIndex,
  ])
  const [showArgumentsHelper, setShowArgumentsHelper] = useState(false)

  const { isFullScreen } = useContext(AppUiContext)

  useEffect(() => {
    const query = router.query

    if ('codeType' in query && 'code' in query) {
      setCodeType(query.codeType as string)
      setCairoCode(
        JSON.parse(
          LZString.decompressFromEncodedURIComponent(query.code as string),
        ),
      )
      if ('debugMode' in query) {
        const debugModeValue = query.debugMode as ProgramDebugMode
        setDebugMode(debugModeValue)
      }
      router.push('/')
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
        if (executionPanicMessage && executionPanicMessage.length > 0) {
          addToConsoleLog(
            'Runtime error: ' + executionPanicMessage,
            LogType.Error,
          )
        } else {
          addToConsoleLog('Runtime error', LogType.Error)
        }
      }

      if (provingIsNotSupported) {
        addToConsoleLog('Proving is not supported for contracts', LogType.Error)
      } else if (proofRequired) {
        addToConsoleLog('Generating proof...', LogType.Info)
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

  useEffect(() => {
    if (
      compilationState === ProgramCompilationState.CompilationSuccess &&
      proofRequired
    ) {
      if (proof && proofTime) {
        addToConsoleLog(
          `Proof generation successful (finished in ${formatTime(proofTime)})`,
          LogType.Info,
        )
        setTimeout(() => {
          setDebugMode(ProgramDebugMode.Proof)
        }, 100)
        addToConsoleLog(<DownloadProof proof={proof} />, LogType.Info)

        if (verificationTime) {
          addToConsoleLog('Verifying proof...', LogType.Info)
          setTimeout(() => {
            addToConsoleLog(
              `Verification successful (finished in ${formatTime(
                verificationTime,
              )})`,
              LogType.Info,
            )
          }, 200)
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    compilationState,
    proof,
    proofTime,
    provingIsNotSupported,
    verificationTime,
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

  const handleCompileRun = useCallback(
    async (variant: 'run' | 'run-prove-verify' | 'prove') => {
      await compileCairoCode(
        cairoCode,
        removeExtraWhitespaces(programArguments),
        variant === 'run-prove-verify',
        variant === 'run-prove-verify',
      )
      setCompiledCairoCode(cairoCode)
    },
    [compileCairoCode, cairoCode, programArguments],
  )

  const handleCopyPermalink = useCallback(() => {
    const params = {
      codeType,
      debugMode: encodeURIComponent(debugMode),
      code: LZString.compressToEncodedURIComponent(JSON.stringify(cairoCode)),
    }

    copy(`${getAbsoluteURL('/')}?${objToQueryString(params)}`)
    addToConsoleLog('Link with current Cairo code copied to clipboard')
  }, [cairoCode, codeType, addToConsoleLog, debugMode])

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
          'bg-gray-100 dark:bg-darkMode-secondary font-normal',
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
                <div className="border-b border-gray-200 dark:border-darkMode-primary flex items-center pl-4 pr-2 h-14 flex-none md:border-r justify-between">
                  <Header
                    codeType={codeType}
                    onCodeTypeChange={({ value }) => setCodeType(value)}
                    withLogo={isFullScreen}
                    anotherTitle={isCairoLangPage}
                  />
                </div>

                <div className="relative pane grow pane-light overflow-auto md:border-r bg-gray-50 dark:bg-black-600 border-gray-200 dark:border-darkMode-secondary">
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
                    <div className="h-full overflow-auto pane pane-light">
                      <MonacoEditor
                        // @ts-ignore: SCEditor is not TS-friendly

                        onMount={handleEditorDidMount}
                        options={{
                          overviewRulerLanes: 0,
                          minimap: { enabled: false },
                          wordBreak: 'keepAll',
                          wordWrap: 'on',
                          readOnly: readOnly,
                          scrollbar: {
                            verticalSliderSize: 5,
                            verticalScrollbarSize: 5,
                          },
                        }}
                        value={codeType === CodeType.Cairo ? cairoCode : ''}
                        onChange={handleCairoCodeChange}
                        language={'cairo'}
                        className={cn(
                          'code-editor whitespace-pre-wrap overflow-hidden p-0 m-0 w-full h-full absolute top-0 left-0',
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
                    'w-full flex-col justify-between grow h-[50vh] md:h-auto md:flex hidden',
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
            <div
              className={cn(
                'h-[22vh] border-r border-t pane pane-light overflow-auto border-gray-200 dark:border-darkMode-primary',
              )}
            >
              <Console />
            </div>
          </div>

          <div
            className={cn(
              'w-full md:w-1/2 flex flex-col justify-between rounded-r-[inherit] dark:bg-darkMode-primary h-[50vh] md:h-auto',
              isThreeColumnLayout && 'md:w-1/3',
            )}
          >
            <Tracer />
          </div>
        </div>

        <EditorFooter withoutContent={isCairoLangPage} />
      </div>
      <ArgumentsHelperModal
        showArgumentsHelper={showArgumentsHelper}
        setShowArgumentsHelper={setShowArgumentsHelper}
      />
    </>
  )
}

export default Editor
