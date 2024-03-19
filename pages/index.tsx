import { useContext } from 'react'

import type { NextPage } from 'next'
import Head from 'next/head'

import { AppUiContext } from 'context/appUiContext'

import AboutCairoVMBanner from 'components/AboutCairoVMBanner'
import ContributeBox from 'components/ContributeBox'
import Editor from 'components/Editor'
import HomeLayout from 'components/layouts/Home'
import { Container } from 'components/ui'

const HomePage = () => {
  const { isFullScreen } = useContext(AppUiContext)

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
      <AboutCairoVMBanner />
      <Container fullWidth={isFullScreen}>
        <Editor isFullScreen={isFullScreen} />
      </Container>
      {!isFullScreen && (
        <section className="pt-20 pb-10 text-center">
          <ContributeBox />
        </section>
      )}
    </>
  )
}

HomePage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export default HomePage
