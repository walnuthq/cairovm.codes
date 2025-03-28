const ProofData = ({ proof }: { proof: string | undefined }) => {
  const parsedProof = proof && JSON.stringify(JSON.parse(proof), null, 2)

  return (
    <div className={proof ? 'h-full w-full overflow-auto pane pane-light' : ''}>
      {parsedProof ? (
        <pre className="pl-4 py-2 text-gray-600 text-sm">{parsedProof}</pre>
      ) : (
        <div className="flex justify-center items-center text-gray-600 dark:text-darkMode-text">
          Use 'Prove and Verify' to generate the proof first.
        </div>
      )}
    </div>
  )
}

export default ProofData
