import React, { PropsWithChildren, createContext, useState } from 'react'

export enum LogType {
  Error,
  Info,
  Warn,
}

export enum CodeType {
  Cairo = 'Cairo',
  Sierra = 'Sierra',
  CASM = 'CASM',
}

export interface IConsoleOutput {
  type: LogType
  message: string
}

type AppUiContextProps = {
  isThreeColumnLayout: boolean
  isFullScreen: boolean
  consoleLog: IConsoleOutput[]
  toggleThreeColumnLayout: () => void
  toggleFullScreen: () => void
  addToConsoleLog: (line: string, type?: LogType) => void
}

export const AppUiContext = createContext<AppUiContextProps>({
  isThreeColumnLayout: false,
  isFullScreen: false,
  consoleLog: [],
  toggleThreeColumnLayout: () => undefined,
  toggleFullScreen: () => undefined,
  addToConsoleLog: () => undefined,
})

export const AppUiProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isThreeColumnLayout, setIsThreeColumnLayout] = useState(false)
  const [consoleLog, setConsoleLog] = useState<IConsoleOutput[]>([
    {
      type: LogType.Info,
      message: 'App initialised...',
    },
  ])

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  const toggleThreeColumnLayout = () => {
    setIsThreeColumnLayout((prev) => !prev)
  }

  const addToConsoleLog = (line: string, type = LogType.Info) => {
    setConsoleLog((previous) => {
      const cloned = previous.map((x) => ({ ...x }))
      cloned.push({ type, message: line })
      return cloned
    })
  }

  return (
    <AppUiContext.Provider
      value={{
        isThreeColumnLayout,
        isFullScreen,
        consoleLog,
        toggleThreeColumnLayout,
        toggleFullScreen,
        addToConsoleLog,
      }}
    >
      {children}
    </AppUiContext.Provider>
  )
}
