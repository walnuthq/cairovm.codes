import React from 'react'

import cn from 'classnames'

type Props = {
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
}

export const Container: React.FC<Props> = ({
  children,
  className,
  fullWidth,
}) => {
  // const renderAsFullWidth = fullWidth || false

  return (
    <div
      className={cn('mx-auto px-4 md:px-6', className, {
        container: !fullWidth, // do not use "container" if full width is true
      })}
    >
      {children}
    </div>
  )
}
