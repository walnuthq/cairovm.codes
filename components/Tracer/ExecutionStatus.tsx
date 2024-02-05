import { useContext } from 'react'

import ReactTooltip from 'react-tooltip'

import { RiArrowGoForwardLine, RiArrowGoBackLine } from '@remixicon/react'

import { Button } from 'components/ui'

const ExecutionStatus = ({
  onStepIn,
  onStepOut,
}: {
  onStepIn: () => void
  onStepOut: () => void
}) => {
  return (
    <div className="flex flex-grow justify-between items-center text-sm">
      <div>
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          Execution Trace
        </span>
      </div>
      {/* <div>
        <span className="inline-block ml-1 mr-2 text-gray-400">
          <Icon name="gas-station-fill" className="text-indigo-500" />
        </span>
        <span className="inline-block mr-1 text-gray-500 text-sm select-none">
          Current:
        </span>
        <span
          className="inline-block mr-4 select-all cursor-help"
          data-tip="Gas consumed for the current instruction"
        >
          {executionState.currentGas || 0}
        </span>
        <span className="inline-block mr-1 text-gray-500 text-sm select-none">
          Total:
        </span>
        <span
          className="inline-block mr-4 select-all cursor-help"
          data-tip="Total gas consumed"
        >
          {executionState.totalGas || 0}
        </span>

        <ReactTooltip className="tooltip" effect="solid" />
      </div> */}

      <div className="flex flex-row items-center gap-4">
        <Button
          transparent
          // disabled={true}
          onClick={onStepOut}
          padded={false}
          tooltip="Step out"
          tooltipId="step1"
        >
          <RiArrowGoBackLine size={16} className="text-indigo-500" />
        </Button>
        <Button
          transparent
          // disabled={!isExecuting}
          onClick={onStepIn}
          padded={false}
          tooltip="Step in"
          tooltipId="step2"
        >
          <RiArrowGoForwardLine size={16} className="text-indigo-500" />
        </Button>

        {/* <Button
          transparent
          // disabled={!isExecuting}
          // onClick={continueExecution}
          padded={false}
          tooltip="Continue execution"
          tooltipId="continue"
        >
          <Icon name="play-circle-line" className="text-indigo-500" />
        </Button> */}
      </div>
    </div>
  )
}

export default ExecutionStatus
