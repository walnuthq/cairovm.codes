import type { NextPage } from 'next'
import Head from 'next/head'

import { getAbsoluteURL } from 'util/browser'

import Footer from './Footer'
import Nav from './Nav'

const HomeLayout: NextPage = ({ children }) => {
  return (
    <>
      <html lang="en"></html>
      <Head>
        <title>
          Cairo VM Codes
        </title>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Cairo VM Codes" />
        <meta
          property="og:description"
          content="An Cairo Virtual Machine Interactive Reference"
        />
        <meta property="og:image" content={`${getAbsoluteURL('/cairo_logo_full.png')}`} />
        <meta property="og:url" content={getAbsoluteURL()} />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col h-screen justify-between">
        <Nav />

        <main className="mb-auto mt-20 md:mt-28 pb-10">{children}</main>

        <Footer />
      </div>
    </>
  )
}

export default HomeLayout
