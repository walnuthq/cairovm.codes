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
      <div
        className="text-sm md:text-md lg:text-lg"
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
          <code className="px-1 bg-gray-200 dark:bg-gray-600 text-orange-600">
            1 [3 4 5] 9
          </code>{' '}
          contains 3 arguments and the corresponding main function should be{' '}
          <code className="mx-1 text-orange-600">
            main(x: felt252, y: Array&lt;felt252&gt;, z: felt252)
          </code>
          .
        </p>
      </div>
    </Modal>
  )
}
