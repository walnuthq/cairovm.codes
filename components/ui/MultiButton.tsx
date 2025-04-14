import { useContext, useEffect } from 'react'

import { ReadyState } from 'react-use-websocket'

import { AppUiContext, LogType } from 'context/appUiContext'
import {
  CairoVMApiContext,
  ProgramCompilationState,
  ProgramDebugMode,
  ProgramExecutionState,
} from 'context/cairoVMApiContext'

import { Button } from './Button'

type CompileMods = 'run' | 'run-prove-verify'
interface MultiButtonProps {
  onCompileRun: (variant: CompileMods) => void
}

const MultiButton = ({ onCompileRun }: MultiButtonProps) => {
  const { addToConsoleLog, consoleLog } = useContext(AppUiContext)
  const {
    compilationState,
    readyState,
    setDebugMode,
    proof,
    executionState,
    proofRequired,
    provingIsNotSupported,
    isProveMode,
  } = useContext(CairoVMApiContext)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (readyState === ReadyState.OPEN) {
      const hasInitMessage = consoleLog.some(
        (item) => item.message === 'App initialised',
      )
      const lastMessageIsError =
        consoleLog[consoleLog.length - 1]?.message ===
        'Error: Connection closed'

      if (!hasInitMessage) {
        addToConsoleLog('App initialised')
      } else if (lastMessageIsError) {
        addToConsoleLog('App reconnected')
      }
    } else if (readyState === ReadyState.CLOSED) {
      timeoutId = setTimeout(() => {
        const lastMessage = consoleLog[consoleLog.length - 1]?.message
        if (
          readyState === ReadyState.CLOSED &&
          lastMessage !== 'Error: Connection closed'
        ) {
          addToConsoleLog('Error: Connection closed', LogType.Error)
        }
      }, 10000)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [readyState, consoleLog, addToConsoleLog])

  const handleMainButtonClick = () => {
    if (isProveMode) {
      onCompileRun('run-prove-verify')
    } else {
      onCompileRun('run')
    }
    setDebugMode(ProgramDebugMode.Execution)
  }

  return (
    <div className="inline-flex min-h-[38px] rounded bg-[#E85733] justify-between">
      <Button
        disabled={
          readyState !== ReadyState.OPEN ||
          compilationState === ProgramCompilationState.Compiling ||
          (!provingIsNotSupported &&
            proofRequired &&
            !proof &&
            (executionState === ProgramExecutionState.Executing ||
              executionState === ProgramExecutionState.Success))
        }
        size="sm"
        className="px-3 py-2 text-xs md:text-sm flex items-center whitespace-nowrap justify-center flex-1"
        onClick={handleMainButtonClick}
      >
        Run
      </Button>
    </div>
  )
}

export default MultiButton
