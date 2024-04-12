import React from 'react'

import { cn } from '../../util/styles'

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
        'px-4 md:px-6': !fullWidth,
      })}
    >
      {children}
    </div>
  )
}
