import { useRef, useState } from 'react'

import { RiLinksLine, RiQuestionLine } from '@remixicon/react'
import cn from 'classnames'

import { Button, Input, Modal } from 'components/ui'

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
  const [showArgumentsHelper, setShowArgumentsHelper] = useState(false)

  const argumentHelperModal = (
    <Modal
      title="Program arguments helper"
      visible={showArgumentsHelper}
      setVisible={setShowArgumentsHelper}
    >
      <div
        className="text-sm md:text-md lg:text-lg text-gray-900 dark:text-gray-900"
        role="button"
        tabIndex={0}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <p className="my-2">
          This input field accepts a list of program arguments separated by a{' '}
          <span className="font-semibold">whitespace</span>.
        </p>
        <p className="my-2">Each argument could be:</p>
        <ul className="list-disc ml-4">
          <li>
            a <span className="font-semibold">single</span>
            <code className="mx-1 text-orange-600">felt252</code>,
          </li>
          <li>
            an <span className="font-semibold">array</span> of
            <code className="mx-1 text-orange-600">felt252</code> where items
            are also separated by a{' '}
            <span className="font-semibold">whitespace</span>.
          </li>
        </ul>
        <p className="mt-2 italic">
          Note that only decimal values are supported for{' '}
          <code className="mx-1 text-orange-600">felt252</code>. That means
          neither hexadecimal value nor short string are supported yet.
        </p>
        <p className="mt-4">
          Of course, the signature of your{' '}
          <code className="mx-1 text-orange-600">main()</code> function must be
          adapted accordingly.
        </p>
        <p className="mt-6">
          For example,{' '}
          <code className="px-1 bg-gray-200 text-orange-600">1 [3 4 5] 9</code>{' '}
          contains 3 arguments and the corresponding main function should be{' '}
          <code className="mx-1 text-orange-600">
            main(x: felt252, y: Array&lt;felt252&gt;, z: felt252)
          </code>
          .
        </p>
      </div>
    </Modal>
  )
  const argumentHelperIcon = (
    <>
      <button onClick={() => setShowArgumentsHelper(true)}>
        <RiQuestionLine size={20} className="text-gray-400" />
      </button>
      {showArgumentsHelper && argumentHelperModal}
    </>
  )

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
        rightIcon={argumentHelperIcon}
        onChange={(e) => {
          onProgramArgumentsUpdate(e.target.value)
        }}
        readOnly={isCompileDisabled}
        value={programArguments}
        placeholder={`Enter program arguments...`}
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
