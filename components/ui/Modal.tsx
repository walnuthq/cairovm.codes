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
      className="flex fixed top-0 left-0 z-80 w-screen h-screen bg-gray-800/50 dark:bg-gray-800/50 justify-center items-center cursor-auto"
      role="button"
      tabIndex={0}
      onClick={closeModal}
      onKeyDown={closeModal}
    >
      <div
        className="md:max-w-3xl relative p-4 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-400 w-full m-auto flex-col flex rounded-lg cursor-auto"
        role="button"
        tabIndex={0}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex flex-row justify-between pb-2 border-b border-slate-300 mb-4">
          <h2 className="text-sm md:text-md lg:text-lg font-semibold">
            {title}
          </h2>
          <button onClick={closeModal} aria-label="Close modal">
            <RiCloseLine size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  ) : (
    <></>
  )
}
