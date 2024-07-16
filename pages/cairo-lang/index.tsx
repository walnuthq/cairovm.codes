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
        <meta property="og:title" content="Cairo VM Codes" />
        <meta
          name="description"
          content="A Cairo Virtual Machine Interactive Reference"
        />
      </Head>
      <Editor isCairoLangPage={true} />
    </>
  )
}

export default CairoLangPage
