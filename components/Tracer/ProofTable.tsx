const ProofTable = ({ proof }: { proof: string | undefined }) => {
  return (
    <div className={proof ? 'h-full w-full' : ''}>
      {proof ? (
        <div className="pl-4 text-gray-600 text-sm">{proof}</div>
      ) : (
        <div className="flex justify-center items-center text-gray-600 dark:text-darkMode-text">
          Use 'Prove and Verify' to generate the proof first.
        </div>
      )}
    </div>
  )
}

export default ProofTable
