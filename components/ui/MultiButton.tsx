import { useContext, useEffect, useState } from 'react'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { ReadyState } from 'react-use-websocket'

import { AppUiContext } from 'context/appUiContext'
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
  const [selected, setSelected] = useState<CompileMods>('run')
  const { addToConsoleLog } = useContext(AppUiContext)
  const {
    compilationState,
    readyState,
    setDebugMode,
    proof,
    executionState,
    proofRequired,
  } = useContext(CairoVMApiContext)
  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      addToConsoleLog('App initialised')
    }
  }, [readyState])

  const handleMainButtonClick = () => {
    switch (selected) {
      case 'run-prove-verify':
        onCompileRun('run-prove-verify')
        setDebugMode(ProgramDebugMode.Execution)
        break
      case 'run':
        onCompileRun('run')
        setDebugMode(ProgramDebugMode.Execution)
        break
      default:
        break
    }
  }

  return (
    <div className="inline-flex min-h-[38px] rounded bg-[#E85733] justify-between">
      <Button
        disabled={
          readyState !== ReadyState.OPEN ||
          compilationState === ProgramCompilationState.Compiling ||
          (proofRequired &&
            !proof &&
            (executionState === ProgramExecutionState.Executing ||
              executionState === ProgramExecutionState.Success))
        }
        size="sm"
        className="rounded-r-none px-3 py-2 text-xs md:text-sm min-w-[130px] flex items-center whitespace-nowrap justify-left flex-1"
        onClick={handleMainButtonClick}
      >
        {selected === 'run-prove-verify'
          ? 'Run, Prove and Debug'
          : 'Run and Debug'}
      </Button>

      <Menu as="div" className="relative">
        <MenuButton
          disabled={
            readyState !== ReadyState.OPEN ||
            compilationState === ProgramCompilationState.Compiling ||
            (proofRequired &&
              !proof &&
              (executionState === ProgramExecutionState.Executing ||
                executionState === ProgramExecutionState.Success))
          }
          className="h-full disabled:cursor-not-allowed disabled:opacity-50 px-3 flex items-center justify-center rounded-r bg-[#E85733] hover:bg-[#fa5d36] focus:z-10 relative"
        >
          <span className="sr-only">Open options</span>
          <ChevronDownIcon aria-hidden="true" className="w-5" color="black" />
          <span className="absolute left-0 top-1/2 h-2/3 w-[1px] bg-[#00000033] -translate-y-1/2" />
        </MenuButton>
        <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded shadow-lg focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in dark:bg-darkMode-primary bg-white">
          <div>
            <MenuItem>
              <button
                onClick={() => setSelected('run')}
                className="block w-full px-4 pt-3 pb-2 text-sm text-left dark:text-darkMode-text text-gray-900 hover:bg-gray-100 dark:hover:bg-darkMode-secondary hover:rounded-t rounded-none"
              >
                Run and Debug
              </button>
            </MenuItem>
            <MenuItem>
              <button
                onClick={() => setSelected('run-prove-verify')}
                className="block w-full px-4 pt-2 pb-3 text-sm text-left dark:text-darkMode-text text-gray-900 hover:bg-gray-100 dark:hover:bg-darkMode-secondary hover:rounded-b rounded-none"
              >
                Run, Prove and Debug
              </button>
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
    </div>
  )
}

export default MultiButton
