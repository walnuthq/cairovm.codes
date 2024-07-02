import { useContext, useEffect } from 'react'

import Head from 'next/head'

import { AppUiContext } from 'context/appUiContext'

import Editor from 'components/Editor'

const HomePage = () => {
  const { enableFullScreen } = useContext(AppUiContext)

  useEffect(() => {
    enableFullScreen()
  }, [enableFullScreen])

  return (
    <>
      <Head>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="EVM Codes - Opcodes" />
        <meta
          name="description"
          content="An Ethereum Virtual Machine Opcodes Interactive Reference"
        />
      </Head>
      <Editor isCairoLangPage={true} />
    </>
  )
}

export default HomePage
