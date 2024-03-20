import { Modal } from 'components/ui'

type Props = {
  showArgumentsHelper: boolean
  setShowArgumentsHelper: (_visible: boolean) => void
}

export const ArgumentsHelperModal = ({
  showArgumentsHelper,
  setShowArgumentsHelper,
}: Props) => {
  return (
    <Modal
      title="Program arguments helper"
      visible={showArgumentsHelper}
      setVisible={setShowArgumentsHelper}
    >
      <div className="text-sm text-gray-900 dark:text-gray-200">
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
}

const CodeElement = ({ children }: { children: string }) => {
  return (
    <code className="inline-block px-1.5 py-0.5 my-0.5 rounded bg-stone-200/70 dark:bg-slate-700 text-red-400">
      {children}
    </code>
  )
}
