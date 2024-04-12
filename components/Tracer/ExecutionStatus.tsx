import {
  RiArrowGoForwardLine,
  RiArrowGoBackLine,
  RiPlayCircleLine,
} from '@remixicon/react'
import { Priority, useRegisterActions } from 'kbar'

import { Button } from 'components/ui'

import { TraceEntry } from '.'

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

  useRegisterActions(actions, [onStepIn, onStepOut, onContinueExecution])

  return (
    <div className="flex flex-grow justify-between items-center text-sm">
      <div>
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          Execution Trace
        </span>
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
          <RiArrowGoBackLine size={16} className="text-indigo-500" />
        </Button>
        <Button
          transparent
          onClick={onStepIn}
          padded={false}
          tooltip="Step next [n]"
          tooltipId="step2"
          disabled={executionTraceStepNumber + 1 === trace?.length || !trace}
        >
          <RiArrowGoForwardLine size={16} className="text-indigo-500" />
        </Button>
        <Button
          transparent
          onClick={onContinueExecution}
          padded={false}
          tooltip="Continue execution [c]"
          tooltipId="continue-execution"
          disabled={executionTraceStepNumber + 1 === trace?.length || !trace}
        >
          <RiPlayCircleLine size={16} className="text-indigo-500" />
        </Button>
      </div>
    </div>
  )
}

export default ExecutionStatus
