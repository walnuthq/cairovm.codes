const EditorHeader = () => {
  return (
    <div className="flex justify-between items-center w-full">
      <h3 className="font-semibold text-md hidden xl:inline-flex items-center">
        <span>Cairo VM Playground</span>
      </h3>

      <div className="flex items-center justify-between w-full xl:w-auto">
        <span className="text-gray-600 dark:text-gray-400 text-sm">Cairo</span>
      </div>
    </div>
  )
}

export default EditorHeader
