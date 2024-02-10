import { useRef } from 'react'

import { RiLinksLine } from '@remixicon/react'
import cn from 'classnames'

import { Button, Input } from 'components/ui'

type EditorControlsProps = {
  isCompileDisabled: boolean
  programArguments: string
  areProgramArgumentsValid: boolean
  onCopyPermalink: () => void
  onCompileRun: () => void
  onProgramArgumentsUpdate: (args: string) => void
}

const EditorControls = ({
  isCompileDisabled,
  programArguments,
  areProgramArgumentsValid,
  onCopyPermalink,
  onCompileRun,
  onProgramArgumentsUpdate,
}: EditorControlsProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-x-4 px-4 py-4 md:py-2 md:border-r border-gray-200 dark:border-black-500">
      <div className="flex flex-col md:flex-row md:gap-x-4 gap-y-2 md:gap-y-0 mb-4 md:mb-0">
        <Button
          onClick={onCopyPermalink}
          transparent
          padded={false}
          tooltip="Share permalink"
          tooltipId="share-permalink"
        >
          <span className="inline-block mr-4 select-all">
            <RiLinksLine size={16} className="text-indigo-500 mr-1" />
          </span>
        </Button>
      </div>

      <Input
        ref={inputRef}
        onChange={(e) => {
          onProgramArgumentsUpdate(e.target.value)
        }}
        readOnly={isCompileDisabled}
        value={programArguments}
        placeholder={`Enter program parameters...`}
        className={cn('grow border bg-gray-200 dark:bg-gray-800', {
          'dark:border-gray-800 border-gray-200': areProgramArgumentsValid,
          'border-red-500': !areProgramArgumentsValid,
        })}
        inputClassName={cn({
          'text-red-500': !areProgramArgumentsValid,
        })}
      />

      <div>
        <Button
          onClick={onCompileRun}
          disabled={isCompileDisabled || !areProgramArgumentsValid}
          size="sm"
          contentClassName="justify-center"
        >
          Compile and run
        </Button>
      </div>
    </div>
  )
}

export default EditorControls
