import React, {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { decode, encode } from '@kunigi/string-compression'
import cn from 'classnames'
import copy from 'copy-to-clipboard'
import { Priority, useRegisterActions } from 'kbar'
import { useRouter } from 'next/router'
import SCEditor from 'react-simple-code-editor'

import {
  CairoVMApiContext,
  ProgramCompilationState,
  ProgramExecutionState,
} from 'context/cairoVMApiContext'
import { Setting, SettingsContext } from 'context/settingsContext'

import { getAbsoluteURL } from 'util/browser'
import { isArgumentStringValid } from 'util/compiler'
import { codeHighlight, isEmpty, objToQueryString } from 'util/string'

import examples from 'components/Editor/examples'
import KBarButton from 'components/KBar/Button'
import ThemeSelector from 'components/ThemeSelector'
import ToggleFullScreen from 'components/ToggleFullScreen'
import { Tracer } from 'components/Tracer'

import { AppUiContext, CodeType, LogType } from '../../context/appUiContext'

import { ArgumentsHelperModal } from './ArgumentsHelperModal'
import EditorControls from './EditorControls'
import ExtraColumn from './ExtraColumn'
import Header from './Header'
import { InstructionsTable } from './InstructionsTable'

type Props = {
  readOnly?: boolean
}

type SCEditorRef = {
  _input: HTMLTextAreaElement
} & RefObject<React.FC>

const cairoEditorHeight = 350

function isCommentLine(input: string) {
  return input.startsWith('// ')
}

const Editor = ({ readOnly = false }: Props) => {
  const { settingsLoaded, getSetting } = useContext(SettingsContext)
  const router = useRouter()

  const {
    compilationState,
    executionState,
    executionPanicMessage,
    compileCairoCode,
    cairoLangCompilerVersion,
    serializedOutput,
    casmInstructions,
    activeCasmInstructionIndex,
    sierraStatements,
    casmToSierraMap,
    currentSierraVariables,
    logs: apiLogs,
  } = useContext(CairoVMApiContext)

  const { addToConsoleLog, isThreeColumnLayout } = useContext(AppUiContext)

  const [cairoCode, setCairoCode] = useState('')
  const [exampleOption, setExampleOption] = useState<number>(0)
  const [codeType, setCodeType] = useState<string | undefined>()
  const [programArguments, setProgramArguments] = useState<string>('')

  const editorRef = useRef<SCEditorRef>()
  const [showArgumentsHelper, setShowArgumentsHelper] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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
      setCairoCode(examples[initialCodeType][exampleOption])
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
    } else if (compilationState === ProgramCompilationState.CompilationErr) {
      addToConsoleLog('Compilation failed', LogType.Error)
    }

    if (executionState === ProgramExecutionState.Error) {
      addToConsoleLog('Runtime error: ' + executionPanicMessage, LogType.Error)
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

  const handleCairoCodeChange = (value: string) => {
    setCairoCode(value)
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

  const handleCommentLine = useCallback(() => {
    if (!editorRef.current) {
      return
    }
    const textareaRef = editorRef.current._input
    const selectionLineNumberStart = cairoCode
      .substring(0, textareaRef.selectionStart)
      .split('\n').length
    const selectionLineNumberEnd = cairoCode
      .substring(0, textareaRef.selectionEnd)
      .split('\n').length

    const selectionStart = textareaRef.selectionStart
    const selectionEnd = textareaRef.selectionEnd
    const lines = cairoCode.split('\n')
    const linesToComment: number[] = []
    for (let k = selectionLineNumberStart; k <= selectionLineNumberEnd; k++) {
      linesToComment.push(k)
    }

    const isMultilineSelection = linesToComment.length > 1
    let charOffsetStart = 0
    let charOffsetEnd = 0
    if (isMultilineSelection) {
      for (const lineNumber of linesToComment) {
        if (lines[lineNumber - 1] !== undefined) {
          const line = lines[lineNumber - 1]
          if (isCommentLine(line)) {
            lines[lineNumber - 1] = line.substring(3)
            charOffsetEnd -= 3
          } else {
            lines[lineNumber - 1] = '// ' + line
            charOffsetEnd += 3
          }
        }
      }
    } else {
      const lineNumber = linesToComment[0]
      const line = lines[lineNumber - 1]
      if (isCommentLine(line)) {
        lines[lineNumber - 1] = line.substring(3)
        charOffsetStart = -3
        charOffsetEnd = -3
      } else {
        lines[lineNumber - 1] = '// ' + line
        charOffsetStart = 3
        charOffsetEnd = 3
      }
    }

    setCairoCode(lines.join('\n'))
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(
      () =>
        textareaRef.setSelectionRange(
          selectionStart + charOffsetStart,
          selectionEnd + charOffsetEnd,
        ),
      0,
    )
  }, [cairoCode])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault()
        handleCommentLine()
      }
    }
    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleCommentLine, cairoCode])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <>

      <div
        className={cn('bg-gray-100 dark:bg-black-700 ',  {
          'rounded-lg': !isFullScreen,
        })}
      >
        <div
          className="flex flex-col md:flex-row"
          style={{
            minHeight: isFullScreen ? 'calc(100vh - 40.4px)' : '60vh',
          }}
        >
          <div  className={cn(
              'w-full md:w-1/2 flex flex-col',
              isThreeColumnLayout && 'md:w-1/3',
            )}>

            <div className="border-b border-gray-200 dark:border-black-500 flex items-center pl-6 pr-2 h-14 md:border-r">
              <Header
                codeType={codeType}
                onCodeTypeChange={({ value }) => setCodeType(value)}
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
                  variables={{}}
                />
              ) : codeType === CodeType.Sierra ? (
                <InstructionsTable
                  instructions={sierraStatements}
                  codeType={codeType}
                  activeIndexes={
                    casmToSierraMap[activeCasmInstructionIndex] ?? []
                  }
                  variables={currentSierraVariables || {}}
                />
              ) : (
                <SCEditor
                  // @ts-ignore: SCEditor is not TS-friendly
                  ref={editorRef}
                  value={codeType === CodeType.Cairo ? cairoCode : ''}
                  readOnly={readOnly}
                  onValueChange={handleCairoCodeChange}
                  highlight={(value) => highlightCode(value, codeType)}
                  tabSize={4}
                  className={cn('code-editor', {
                    'with-numbers': !isBytecode,
                  })}
                />
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
              exampleName={exampleOption}
              handleChangeExampleOption={(newExample) =>
                newExample !== null
                  ? setExampleOption(newExample.value)
                  : setExampleOption(0)
              }
            />
          </div>


          {isThreeColumnLayout && (
            <ExtraColumn
              cairoCode={cairoCode}
              cairoEditorHeight={cairoEditorHeight}
              highlightCode={highlightCode}
              isBytecode={isBytecode}
            />
          )}

          <div
            className={cn(
              'w-full md:w-1/2 flex flex-col',
              isThreeColumnLayout && 'md:w-1/3',
            )}
          >
            <Tracer />

          </div>
        </div>

        <div
          className={cn(
            'px-5 border-t bg-gray-800 dark:bg-black-700 border-black-900/25 text-gray-400 dark:text-gray-600 text-xs h-10 items-center ml-auto flex',
            {
              'rounded-b-lg': !isFullScreen,
            },
          )}
        >
          {cairoLangCompilerVersion !== ''
            ? `Cairo Compiler v${cairoLangCompilerVersion}`
            : ' '}
          {isFullScreen && (
            <>
              <div className="items-center ml-auto mr-auto flex">
                <KBarButton />
                <ToggleFullScreen />
                <ThemeSelector />
              </div>
              <div>
                <span>
                  Made with ❤️ by{' '}
                  <a
                    className="underline font-medium"
                    href="https://walnut.dev"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Walnut
                  </a>
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      <ArgumentsHelperModal
        showArgumentsHelper={showArgumentsHelper}
        setShowArgumentsHelper={setShowArgumentsHelper}
      />
    </>
  )
}

export default Editor
