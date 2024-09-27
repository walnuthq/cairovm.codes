import { ReactNode } from 'react'

import Head from 'next/head'

import Editor from 'components/Editor'
import HomeLayout from 'components/layouts/Home'
import { Container } from 'components/ui'

const PlaygroundPage = () => {
  return (
    <>
      <html lang="en"></html>
      <Head>
        <meta property="og:type" content="website" />
        <title>CairoVM Codes - Playground</title>
      </Head>

      <Container>
        <Editor />
      </Container>
    </>
  )
}

PlaygroundPage.getLayout = function getLayout(page: ReactNode) {
  return <HomeLayout>{page}</HomeLayout>
}

export default PlaygroundPage
