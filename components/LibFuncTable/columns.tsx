import { Row } from 'react-table'

import { StackBox } from 'components/ui'

type TableRow = Row<Record<string, string | undefined>>

const filter = (rows: TableRow[], id: string, filterValue: string) => {
  return rows.filter((row) =>
    row.original[id]
      ?.toLocaleLowerCase()
      .includes(filterValue.toLocaleLowerCase()),
  )
}

const filterDescription = (
  rows: TableRow[],
  id: string,
  filterValue: string,
) => {
  return rows.filter((row) =>
    (row.original[id] || '-')
      ?.toLocaleLowerCase()
      .includes(filterValue.toLocaleLowerCase()),
  )
}

const refsRenderer = ({ value }: { value: string }) =>
  value ? (
    <StackBox
      value={value}
      className="text-xs border-indigo-300 dark:border-indigo-900 text-gray-800 dark:text-gray-200"
    />
  ) : (
    '-'
  )

const columns = [
  {
    id: 'name',
    Header: 'Name',
    accessor: 'name',
    width: 120,
    filter,
  },
  {
    id: 'invokeRefs',
    Header: 'Invoke Refs',
    accessor: 'invokeRefs',
    width: 80,
    Cell: refsRenderer,
  },
  {
    id: 'fallthroughBranch',
    Header: 'Fallthrough Branch Refs',
    accessor: 'fallthroughBranch',
    width: 100,
    Cell: refsRenderer,
  },
  {
    id: 'statementBranch',
    Header: 'Statement Branch Refs',
    accessor: 'statementBranch',
    width: 100,
    Cell: refsRenderer,
  },
  {
    id: 'shortDescription',
    Header: 'Short Description',
    accessor: (row: any) => (row.shortDescription ? row.shortDescription : '-'),
    filterDescription,
  },
]

export default columns
