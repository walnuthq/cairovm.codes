import React from 'react'

import * as Doc from 'components/ui/Doc'

type Props = {
  title: string
  children: JSX.Element[]
}

export const RefsTable: React.FC<Props> = ({ title, children }: Props) => {
  return (
    <table className="table-auto mb-4">
      <thead>
        <tr>
          <Doc.TH colSpan={3}>{title}</Doc.TH>
        </tr>
        <tr>
          <Doc.TH></Doc.TH>
          <Doc.TH>Parameter</Doc.TH>
          <Doc.TH>Value</Doc.TH>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}
