import { useRef } from 'react'

import { RiLinksLine, RiQuestionLine } from '@remixicon/react'
import { Priority, useRegisterActions } from 'kbar'
import { OnChangeValue } from 'react-select'

import { Button, Input } from 'components/ui'
import MultiButton from 'components/ui/MultiButton'

import { cn } from '../../util/styles'

import ExampleSelector, { MobileExampleSelector } from './ExampleSelector'
import { Checkbox } from 'components/ui/Checkbox'

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
  onCompileRun: (variant: 'run' | 'run-prove-verify') => void
  onProgramArgumentsUpdate: (args: string) => void
  onShowArgumentsHelper: () => void
  isProveMode: boolean
  setProveMode: (proveMode: boolean) => void
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
  isProveMode,
  setProveMode,
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
        onCompileRun('run')
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
    <>
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
        className={cn(
          'border bg-gray-200 rounded-none dark:bg-darkMode-primary lg:hidden',
          {
            'dark:border-[#46373A]': areProgramArgumentsValid,
            'border-red-500': !areProgramArgumentsValid,
          },
        )}
        inputClassName={cn('text-xs md:text-sm', {
          'text-red-500': !areProgramArgumentsValid,
        })}
      />
      <div className="flex dark:bg-darkMode-primary flex-row items-center justify-between gap-x-4 px-4 py-4 md:py-2 md:border-r border-gray-200 dark:border-black-500">
        <div className="flex flex-row">
          <Button
            onClick={onCopyPermalink}
            transparent
            padded={false}
            tooltip="Share permalink [p]"
            tooltipId="share-permalink"
            className="p-2 text-[#E85733] dark:text-darkMode-icons hover:text-[#fc9278] focus:outline-none"
          >
            <RiLinksLine size={16} />
          </Button>

          <div className="xl:block hidden max-w-36 2xl:max-w-full">
            <ExampleSelector
              isProveMode={isProveMode}
              onExampleChange={onExampleChange}
            />
          </div>
          <div className="xl:hidden block">
            <MobileExampleSelector
              isProveMode={isProveMode}
              onExampleChange={onExampleChange}
            />
          </div>
        </div>

        <div className="flex flex-row grow gap-x-2 items-center justify-end">
          <div className="flex items-center">
            <Checkbox
              text="Prove & Verify"
              value={'Prove mode'}
              isChecked={isProveMode}
              tooltip="Contract examples are not available for proving"
              tooltipId="prove-and-verify"
              onChange={() => setProveMode(!isProveMode)}
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
            className={cn(
              'max-w-64 border hidden lg:flex bg-gray-200 dark:bg-darkMode-primary',
              {
                'dark:border-[#46373A]': areProgramArgumentsValid,
                'border-red-500': !areProgramArgumentsValid,
              },
            )}
            inputClassName={cn('text-xs md:text-sm', {
              'text-red-500': !areProgramArgumentsValid,
            })}
          />
          <MultiButton onCompileRun={onCompileRun} />
        </div>
      </div>
    </>
  )
}

export default EditorControls
