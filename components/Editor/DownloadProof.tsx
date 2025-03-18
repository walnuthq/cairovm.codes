export const DownloadProof = ({ proof }: { proof: string }) => {
  function handleDownloadProof() {
    const content = proof
    const blob = new Blob([content], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'proof.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <>
      Click{' '}
      <button className="underline" onClick={handleDownloadProof}>
        here
      </button>{' '}
      to download the proof
    </>
  )
}
