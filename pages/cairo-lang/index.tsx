import { useContext, useEffect } from 'react'

import Head from 'next/head'
import { useTheme } from 'next-themes'

import { AppUiContext } from 'context/appUiContext'

import Editor from 'components/Editor'

const CairoLangPage = () => {
  const { enableFullScreen } = useContext(AppUiContext)
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme('dark')
    enableFullScreen()
  }, [enableFullScreen, setTheme])

  return (
    <>
      <Head>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CairoVM Codes" />
        <meta
          name="description"
          content="Interactive CairoVM Reference & Debugger"
        />
      </Head>
      <Editor isCairoLangPage={true} />
    </>
  )
}

export default CairoLangPage
