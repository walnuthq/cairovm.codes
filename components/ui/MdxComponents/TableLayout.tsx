import React from 'react'

type Props = {
  children: JSX.Element[]
}

export const TableLayout: React.FC<Props> = ({ children }: Props) => {
  return (
    <div className="flex flex-row space-x-16 items-start py-4">{children}</div>
  )
}
