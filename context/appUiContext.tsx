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
  isFullScreen: boolean
  consoleLog: IConsoleOutput[]
  toggleFullScreen: () => void
  addToConsoleLog: (line: string, type?: LogType) => void
}

export const AppUiContext = createContext<AppUiContextProps>({
  isFullScreen: false,
  consoleLog: [],
  toggleFullScreen: () => undefined,
  addToConsoleLog: () => undefined,
})

export const AppUiProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [consoleLog, setConsoleLog] = useState<IConsoleOutput[]>([
    {
      type: LogType.Info,
      message: 'App initialised...',
    },
  ])

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
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
        isFullScreen,
        consoleLog,
        toggleFullScreen,
        addToConsoleLog,
      }}
    >
      {children}
    </AppUiContext.Provider>
  )
}
