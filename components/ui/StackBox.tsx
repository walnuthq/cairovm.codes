import React from 'react'

import cn from 'classnames'

type Props = {
  value: string
  showEmpty?: boolean
  isFullWidth?: boolean
  className?: string
}

export const StackBox: React.FC<Props> = ({
  value,
  showEmpty,
  isFullWidth,
  className,
}) => {
  if (!showEmpty && value.length === 0) {
    return null
  }

  const parts = value.split(/[^\\]\|/)

  return (
    <>
      {(parts.length > 0 ? parts : [value]).map((p: string, index: number) => (
        <div
          key={index}
          className={cn(
            'font-mono mb-1 rounded-sm',
            { 'w-full': isFullWidth, 'mr-1': !isFullWidth },
            className,
          )}
          style={{ minHeight: 26 }}
        >
          <span className={cn('px-2 py-1 border', className)}>
            {p.trim().replace(/\\\|/g, '|')}
          </span>
        </div>
      ))}
    </>
  )
}
