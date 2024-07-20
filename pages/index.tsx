import { ReactNode, useContext } from 'react'

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
        <meta property="og:title" content="Cairo VM Codes" />
        <meta
          name="description"
          content="A Cairo Virtual Machine Interactive Reference"
        />
      </Head>

      {!isFullScreen && <AboutCairoVMBanner />}

      <Container fullWidth={isFullScreen}>
        <Editor />
      </Container>

      {!isFullScreen && (
        <section className="pt-20 pb-10 text-center">
          <ContributeBox />
        </section>
      )}
    </>
  )
}

HomePage.getLayout = function getLayout(page: ReactNode) {
  return <HomeLayout>{page}</HomeLayout>
}

export default HomePage
