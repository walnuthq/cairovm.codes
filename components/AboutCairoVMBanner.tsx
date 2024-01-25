import { useState, useEffect } from 'react'

const AboutCairoVMBanner = () => {
  const [isShown, setIsShown] = useState(false)

  useEffect(() => {
    // Check if the banner was closed previously
    const isBannerClosed = localStorage.getItem('isBannerClosed')
    if (!isBannerClosed) {
      setIsShown(true)
    }
  }, [])

  const handleCloseBanner = () => {
    // Save the state in local storage to prevent the banner from showing again
    // localStorage.setItem('isBannerClosed', 'true')
    setIsShown(false)
  }

  if (!isShown) {
    return null
  }

  return (
    <div className="relative bg-gray-50 dark:bg-black-700 pb-6 mt-0 mb-10">
      <button
        className="absolute top-6 right-6 focus:outline-none"
        onClick={handleCloseBanner}
        aria-label="Close banner"
      >
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <div className="container mx-auto px-4 md:px-6">
        <p className="font-medium md:text-xl mb-4 pt-6">
          About cairovm.codes
        </p>
        <p className="font-normal text-2base text-gray-400 mb-4">
          Built by{" "}
          <a
            className="underline text-indigo-500"
            href="https://walnut.dev"
            target="_blank"
          >
            Walnut
          </a>
          , this app lets you compile Cairo programs into Sierra and CASM. Gradually, we will introduce step-through execution for CASM, Sierra, and Cairo, as part of our Cairo debugger development.
        </p>
      </div>
    </div>
  )
}

export default AboutCairoVMBanner
