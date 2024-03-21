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
  return (
    <div
      className={cn('mx-auto', className, {
        container: !fullWidth, // do not use "container" if full width is true
      })}
    >
      {children}
    </div>
  )
}
