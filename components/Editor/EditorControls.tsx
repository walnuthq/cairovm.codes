import { useRef } from 'react'

import { RiLinksLine, RiQuestionLine } from '@remixicon/react'
import cn from 'classnames'
import { Priority, useRegisterActions } from 'kbar'
import { OnChangeValue } from 'react-select'

import { Button, Input } from 'components/ui'

import ExampleSelector from './ExampleSelector'

type SelectOption = {
  value: number
  label: string
}

type EditorControlsProps = {
  isCompileDisabled: boolean
  programArguments: string
  areProgramArgumentsValid: boolean
  handleChangeExampleOption: (
    option: OnChangeValue<SelectOption, false>,
  ) => void
  onCopyPermalink: () => void
  onCompileRun: () => void
  onProgramArgumentsUpdate: (args: string) => void
  onShowArgumentsHelper: () => void
}

const EditorControls = ({
  isCompileDisabled,
  programArguments,
  areProgramArgumentsValid,
  handleChangeExampleOption,
  onCopyPermalink,
  onCompileRun,
  onProgramArgumentsUpdate,
  onShowArgumentsHelper,
}: EditorControlsProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const actions = [
    {
      id: 'compile',
      name: 'Compile and run',
      shortcut: ['r'],
      keywords: 'compile run',
      section: 'Execution',
      perform: () => {
        onCompileRun()
      },
      subtitle: 'Run execution',
      priority: Priority.HIGH,
    },
    {
      id: 'permalink',
      name: 'Share permalink',
      shortcut: ['p'],
      keywords: 'Share permalink',
      section: 'Execution',
      perform: () => {
        onCopyPermalink()
      },
      subtitle: 'Copy permalink',
      priority: Priority.HIGH,
    },
  ]

  useRegisterActions(actions, [onCompileRun, onCopyPermalink])

  const onExampleChange = (option: SelectOption | null) => {
    handleChangeExampleOption(option)
  }

  return (
    <div className="flex flex-row items-center justify-between gap-x-4 px-4 py-4 md:py-2 md:border-r border-gray-200 dark:border-black-500">
      <div className="flex flex-row">
        <Button
          onClick={onCopyPermalink}
          transparent
          padded={false}
          tooltip="Share permalink [p]"
          tooltipId="share-permalink"
          className="p-2 text-indigo-500 hover:text-indigo-600 focus:outline-none"
        >
          <RiLinksLine size={16} />
        </Button>

        <ExampleSelector onExampleChange={onExampleChange} />
      </div>

      <div className="flex flex-row grow gap-x-2 items-center justify-end">
        <Input
          ref={inputRef}
          rightIcon={
            <button onClick={onShowArgumentsHelper}>
              <RiQuestionLine
                size={20}
                className="text-gray-400 hover:text-gray-500"
              />
            </button>
          }
          onChange={(e) => {
            onProgramArgumentsUpdate(e.target.value)
          }}
          readOnly={isCompileDisabled}
          value={programArguments}
          placeholder={`Program arguments`}
          className={cn('max-w-64 border bg-gray-200 dark:bg-gray-800 ', {
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
            Run
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EditorControls
