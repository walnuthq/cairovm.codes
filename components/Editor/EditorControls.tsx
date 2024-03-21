import { useMemo, useRef, useId } from 'react'

import { RiLinksLine, RiQuestionLine } from '@remixicon/react'
import cn from 'classnames'
import { Priority, useRegisterActions } from 'kbar'
import Select, { OnChangeValue } from 'react-select'
import examples from 'components/Editor/examples'

import { Button, Input } from 'components/ui'

type SelectOption = {
  value: number
  label: string
}

type EditorControlsProps = {
  isCompileDisabled: boolean
  programArguments: string
  areProgramArgumentsValid: boolean
  exampleName: number
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
  exampleName,
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

  const CairoNameExamples = useMemo(
    () => [
      'Default',
      'Variables & mutability',
      'Type casting',
      'Control flow',
      'Functions',
      'Arrays',
      'Dictionaries',
      'Ownership',
    ],
    [],
  )

  const examplesOptions = examples.Cairo.map((example, i) => ({
    value: i,
    label: CairoNameExamples[i],
  }))

  const exampleNameValue = useMemo(
    () => ({
      value: exampleName,
      label: CairoNameExamples[exampleName],
    }),
    [CairoNameExamples, exampleName],
  )

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-x-4 px-4 py-4 md:py-2 md:border-r border-gray-200 dark:border-black-500">
      <div className="flex flex-col md:flex-row md:gap-x-4 gap-y-2 md:gap-y-0 mb-4 md:mb-0">
        <Button
          onClick={onCopyPermalink}
          transparent
          padded={false}
          tooltip="Share permalink [p]"
          tooltipId="share-permalink"
        >
          <span className="inline-block mr-4 select-all">
            <RiLinksLine size={16} className="text-indigo-500 mr-1" />
          </span>
        </Button>
      </div>
      <div className="w-full md:w-60 lg:mr-20">
        <Select
          isSearchable={false}
          classNamePrefix="select"
          menuPlacement="auto"
          value={exampleNameValue}
          options={examplesOptions}
          instanceId={useId()}
          onChange={handleChangeExampleOption}
          isDisabled={isCompileDisabled}
        />
      </div>
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
        className={cn('grow border bg-gray-200 dark:bg-gray-800 ', {
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
  )
}

export default EditorControls
