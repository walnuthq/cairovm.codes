import React from 'react'

import * as Doc from 'components/ui/Doc'

type Props = {
  children: JSX.Element[]
}

export const MemoryTable: React.FC<Props> = ({ children }: Props) => {
  return (
    <table className="table-auto mb-4">
      <thead>
        <tr>
          <Doc.TH colSpan={2}>Memory</Doc.TH>
        </tr>
        <tr>
          <Doc.TH>
            <code>@</code>
          </Doc.TH>
          <Doc.TH>Value</Doc.TH>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}
