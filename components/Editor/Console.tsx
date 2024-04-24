import { useEffect, useContext, useRef } from 'react'

import { toKeyIndex } from 'util/string'

import { AppUiContext, LogType } from '../../context/appUiContext'

const Console = () => {
  const container = useRef<HTMLDivElement>(null)
  const endDiv = useRef<HTMLDivElement>(null)

  const { consoleLog } = useContext(AppUiContext)

  useEffect(() => {
    container.current?.parentElement?.scrollTo({
      top: endDiv.current?.offsetTop,
      behavior: 'smooth',
    })
  }, [consoleLog])

  return (
    <div className='p-4'>
      <p className='text-gray-500 dark:text-gray-400 font-medium uppercase text-2xs'>Console</p>
      <div
        ref={container}
        className="leading-5 font-mono text-tiny text-gray-400 dark:text-gray-500"
      >
        {consoleLog.map((log, index) => (
          <pre key={toKeyIndex('line', index)}>
            {log.type === LogType.Error && (
              <span className="text-red-500">[Error] </span>
            )}
            {log.type === LogType.Warn && (
              <span className="text-yellow-500">[Warn] </span>
            )}
            {log.message}
          </pre>
        ))}
        <div ref={endDiv}></div>
      </div>
    </div>
  )
}

export default Console
