import {
  RiArrowGoForwardLine,
  RiArrowGoBackLine,
  RiPlayCircleLine,
} from '@remixicon/react'

import { Button } from 'components/ui'

const ExecutionStatus = ({
  onStepIn,
  onStepOut,
  onContinueExecution,
}: {
  onStepIn: () => void
  onStepOut: () => void
  onContinueExecution: () => void
}) => {
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
          tooltip="Step back"
          tooltipId="step1"
        >
          <RiArrowGoBackLine size={16} className="text-indigo-500" />
        </Button>
        <Button
          transparent
          onClick={onStepIn}
          padded={false}
          tooltip="Step next"
          tooltipId="step2"
        >
          <RiArrowGoForwardLine size={16} className="text-indigo-500" />
        </Button>
        <Button
          transparent
          onClick={onContinueExecution}
          padded={false}
          tooltip="Continue execution"
          tooltipId="continue-execution"
        >
          <RiPlayCircleLine size={16} className="text-indigo-500" />
        </Button>
      </div>
    </div>
  )
}

export default ExecutionStatus
