import { useContext, PropsWithChildren } from 'react'

import { GoogleAnalytics } from '@next/third-parties/google'
import type { NextPage } from 'next'
import Head from 'next/head'

import { AppUiContext } from 'context/appUiContext'

import { getAbsoluteURL } from 'util/browser'

import Footer from './Footer'
import Nav from './Nav'


const HomeLayout: NextPage<PropsWithChildren> = ({ children }) => {
  const { isFullScreen } = useContext(AppUiContext)
  return (
    <>
      <Head>
        <title>Cairo VM Codes</title>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Cairo VM Codes" />
        <meta
          property="og:description"
          content="An Cairo Virtual Machine Interactive Reference"
        />
        <meta
          property="og:image"
          content={`${getAbsoluteURL('/cairo_logo_full.png')}`}
        />
        <meta property="og:url" content={getAbsoluteURL()} />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col h-screen justify-between">
        <Nav />

        <main className={`${isFullScreen ? '' : 'mt-20 pb-10'}`}>
          {children}
        </main>

        <Footer />
        <GoogleAnalytics gaId="G-E1BJYMMWDD" />
      </div>
    </>
  )
}

export default HomeLayout
