import { ReactElement, ReactNode } from 'react'

import { KBarProvider } from 'kbar'
import useActions from 'lib/useActions'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'

import { AppUiProvider } from 'context/appUiContext'
import { CairoVMApiProvider } from 'context/cairoVMApiContext'
import { SettingsProvider } from 'context/settingsContext'

import KBar from 'components/KBar'

import '../styles/globals.css'
import '../styles/highlight/atom-one-light.css'
import '../styles/highlight/atom-one-dark.css'

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const Main = ({ Component, pageProps }: AppPropsWithLayout) => {
  const actions = useActions()

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <ThemeProvider attribute="class">
      <AppUiProvider>
        <SettingsProvider>
          <CairoVMApiProvider>
            <KBarProvider actions={actions}>
              {getLayout(<Component {...pageProps} />)}
              <KBar />
            </KBarProvider>
          </CairoVMApiProvider>
        </SettingsProvider>
      </AppUiProvider>
    </ThemeProvider>
  )
}

export default Main
