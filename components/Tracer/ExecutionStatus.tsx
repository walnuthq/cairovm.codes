import { useContext, useId, useMemo } from 'react'

import {
  RiArrowGoForwardLine,
  RiArrowGoBackLine,
  RiPlayCircleLine,
} from '@remixicon/react'
import { Priority, useRegisterActions } from 'kbar'
import Select from 'react-select'

import { CairoVMApiContext, ProgramDebugMode } from 'context/cairoVMApiContext'

import { Button } from 'components/ui'

import { TraceEntry } from '.'

type DebugModeOption = {
  value: ProgramDebugMode
  label: ProgramDebugMode
}

const debugModeOptions: DebugModeOption[] = (
  Object.keys(ProgramDebugMode) as Array<keyof typeof ProgramDebugMode>
).map((mode) => ({
  value: ProgramDebugMode[mode],
  label: ProgramDebugMode[mode],
}))

const ExecutionStatus = ({
  onStepIn,
  onStepOut,
  onContinueExecution,
  trace,
  executionTraceStepNumber,
}: {
  onStepIn: () => void
  onStepOut: () => void
  onContinueExecution: () => void
  trace: TraceEntry[] | undefined
  executionTraceStepNumber: number
}) => {
  const { debugMode, setDebugMode } = useContext(CairoVMApiContext)

  const debugModeValue: DebugModeOption = useMemo(
    () => ({
      value: debugMode,
      label: debugMode,
    }),
    [debugMode],
  )

  const actions = [
    {
      id: 'stepnext',
      name: 'Step Next',
      shortcut: ['n'],
      keywords: 'step next',
      section: 'Execution',
      perform: () => {
        onStepIn()
      },
      subtitle: 'Run next execution',
      priority: Priority.HIGH,
    },
    {
      id: 'stepback',
      name: 'Step Back',
      shortcut: ['b'],
      keywords: 'execution back',
      section: 'Execution',
      perform: () => {
        onStepOut()
      },
      subtitle: 'Run back execution',
      priority: Priority.HIGH,
    },
    {
      id: 'continue',
      name: 'Continue',
      shortcut: ['c'],
      keywords: 'Execution continue',
      section: 'Execution',
      perform: () => {
        onContinueExecution()
      },
      subtitle: 'Continue execution',
      priority: Priority.HIGH,
    },
  ]

  const onChangeDebugMode = (option: DebugModeOption | null) => {
    if (option) {
      setDebugMode(option.value)
    }
  }

  useRegisterActions(actions, [onStepIn, onStepOut, onContinueExecution])

  return (
    <div className="flex flex-grow justify-between items-center text-sm">
      <div className="flex items-center">
        <Select
          onChange={onChangeDebugMode}
          options={debugModeOptions}
          value={debugModeValue}
          isSearchable={false}
          classNamePrefix="select"
          className="[&_.select\_\_menu]:w-56 [&_.select\_\_menu]:z-20"
          menuPlacement="auto"
          instanceId={useId()}
        />
      </div>

      <div className="flex flex-row items-center gap-4">
        <Button
          transparent
          onClick={onStepOut}
          padded={false}
          tooltip="Step back [b]"
          tooltipId="step1"
          disabled={executionTraceStepNumber === 0}
        >
          <RiArrowGoBackLine
            size={16}
            className="text-[#E85733] dark:text-darkMode-icons hover:text-[#fc9278]"
          />
        </Button>
        <Button
          transparent
          onClick={onStepIn}
          padded={false}
          tooltip="Step next [n]"
          tooltipId="step2"
          disabled={executionTraceStepNumber + 1 === trace?.length || !trace}
        >
          <RiArrowGoForwardLine
            size={16}
            className="text-[#E85733] dark:text-darkMode-icons hover:text-[#fc9278]"
          />
        </Button>
        <Button
          transparent
          onClick={onContinueExecution}
          padded={false}
          tooltip="Continue execution [c]"
          tooltipId="continue-execution"
          disabled={executionTraceStepNumber + 1 === trace?.length || !trace}
        >
          <RiPlayCircleLine
            size={16}
            className="text-[#E85733] dark:text-darkMode-icons hover:text-[#fc9278]"
          />
        </Button>
      </div>
    </div>
  )
}

export default ExecutionStatus
