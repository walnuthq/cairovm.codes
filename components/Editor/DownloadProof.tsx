export const DownloadProof = () => {
  function handleDownloadProof() {
    const content = 'Proof'
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'proof.txt'
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
