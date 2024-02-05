import React, { createContext, useState } from 'react'

type AppUiContextProps = {
  isFullScreen: boolean
  toggleFullScreen: () => void
}

export const AppUiContext = createContext<AppUiContextProps>({
  isFullScreen: false,
  toggleFullScreen: () => undefined,
})

export const AppUiProvider: React.FC = ({ children }) => {
  const [isFullScreen, setIsFullScreen] = useState(false)

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  return (
    <AppUiContext.Provider
      value={{
        isFullScreen,
        toggleFullScreen,
      }}
    >
      {children}
    </AppUiContext.Provider>
  )
}
