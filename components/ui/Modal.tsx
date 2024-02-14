import { RiCloseLine } from '@remixicon/react'

export type ModalProps = {
  title: string
  visible: boolean
  setVisible: (_visible: boolean) => void
  children: React.ReactNode
}

export const Modal = ({
  title,
  visible,
  setVisible,
  children,
}: ModalProps): JSX.Element => {
  const closeModal = () => setVisible(false)

  return visible ? (
    <div
      className="flex fixed top-0 left-0 z-80 w-screen h-screen bg-gray-800/30 dark:bg-gray-800/50 justify-center items-center"
      role="button"
      tabIndex={0}
      onClick={closeModal}
      onKeyDown={closeModal}
    >
      <div className="fixed inset-0 z-50 overflow-auto bg-black/80 flex">
        <div className="max-w-lg lg:max-w-3xl relative p-4 bg-white w-full m-auto flex-col flex rounded-lg">
          <div className="flex flex-row justify-between pb-2 border-b border-slate-300 mb-4">
            <h2 className="text-sm md:text-md lg:text-lg text-gray-900 dark:text-gray-900 font-semibold">
              {title}
            </h2>
            <button onClick={closeModal} aria-label="Close modal">
              <RiCloseLine size={24} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  ) : (
    <></>
  )
}
