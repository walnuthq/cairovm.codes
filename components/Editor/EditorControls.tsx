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
      <div className="text-md text-gray-900">
        <p className="my-2">
          This input field accepts a list of program arguments for the{' '}
          <CodeElement>main()</CodeElement> function, separated by a{' '}
          <span className="font-semibold">whitespace</span>.
        </p>
        <p className="my-2">Each argument can be:</p>
        <ul className="list-disc ml-4">
          <li>
            a <span className="font-semibold">single</span>{' '}
            <CodeElement>felt252</CodeElement>,
          </li>
          <li>
            an <span className="font-semibold">array</span> of{' '}
            <CodeElement>felt252</CodeElement> items seperated by a{' '}
            <span className="font-semibold">whitespace</span>.
          </li>
        </ul>
        <p className="mt-2 italic">
          Note that only decimal values are supported for{' '}
          <CodeElement>felt252</CodeElement>. That means neither hexadecimal
          value nor short string are supported yet.
        </p>
        <p className="mt-4">
          The signature of <CodeElement>main()</CodeElement> function must be
          adapted accordingly.
        </p>
        <p className="mt-6">
          For example, <CodeElement>1 [3 4 5] 9</CodeElement> contains 3
          arguments and the corresponding main function should be
          <br />
          <CodeElement>
            main(x: felt252, y: Array&lt;felt252&gt;, z: felt252)
          </CodeElement>
          .
        </p>
      </div>
    </Modal>
  )
  const argumentHelperIcon = (
    <>
      <button onClick={() => setShowArgumentsHelper(true)}>
        <RiQuestionLine
          size={20}
          className="text-gray-400 hover:text-gray-500"
        />
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

const CodeElement = ({ children }: { children: string }) => {
  return (
    <code className="inline-block px-1.5 py-0.5 my-0.5 rounded bg-stone-200/70 text-red-500">
      {children}
    </code>
  )
}

export default EditorControls
