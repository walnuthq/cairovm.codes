import { useContext } from 'react'

import {
  CairoVMApiContext,
  ProgramExecutionState,
} from 'context/cairoVMApiContext'

const ProofData = ({ proof }: { proof: string | undefined }) => {
  const { proofRequired, executionState } = useContext(CairoVMApiContext)

  const parsedProof = proof && JSON.stringify(JSON.parse(proof), null, 2)

  return (
    <div className={proof ? 'h-full w-full overflow-auto pane pane-light' : ''}>
      {parsedProof ? (
        <pre className="pl-4 py-2 text-gray-600 text-sm">{parsedProof}</pre>
      ) : proofRequired ? (
        <div className="flex justify-center items-center text-gray-600 dark:text-darkMode-text">
          {executionState === ProgramExecutionState.Executing ||
          executionState === ProgramExecutionState.Success
            ? 'Loading...'
            : executionState === ProgramExecutionState.Error && 'Error'}
        </div>
      ) : (
        <div className="flex justify-center items-center text-gray-600 dark:text-darkMode-text">
          Use 'Prove and Verify' to generate the proof.
        </div>
      )}
    </div>
  )
}

export default ProofData
