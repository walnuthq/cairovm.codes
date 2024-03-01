import { useMemo, Fragment, useRef, useState, useEffect } from 'react'

import {
  RiCheckLine,
  RiLinksLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
} from '@remixicon/react'
import cn from 'classnames'
import { useRouter } from 'next/router'
import {
  useTable,
  useExpanded,
  useFilters,
  useSortBy,
  Row,
  Cell,
  Column,
  UseExpandedRowProps,
} from 'react-table'
import { ILibFuncDocs, ILibFuncDoc } from 'types'

import { Button } from 'components/ui'

import columnDefinition from './columns'
import DocRowDetail from './DocRowDetail'
import Filters from './Filters'

const LibFuncTable = ({ docs }: { docs: ILibFuncDocs }) => {
  const router = useRouter()

  const data = useMemo(() => docs, [docs])
  const columns = useMemo<Column[]>(() => columnDefinition, [])
  const initialState = useMemo(
    () => ({
      sortBy: [
        {
          id: 'name',
          desc: false,
        },
      ],
    }),
    [],
  )

  // FIXME: See: https://github.com/tannerlinsley/react-table/issues/3064
  const table = useTable(
    // @ts-ignore: Waiting for 8.x of react-table to have better types
    { columns, data, initialState },
    useFilters,
    useSortBy,
    useExpanded,
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // @ts-ignore: Waiting for 8.x of react-table to have better types
    toggleAllRowsExpanded,
    // @ts-ignore: Waiting for 8.x of react-table to have better types
    isAllRowsExpanded,
    // @ts-ignore: Waiting for 8.x of react-table to have better types
    setFilter,
  } = table

  const rowRefs = useRef<HTMLTableRowElement[]>([])
  const [focusedLibFuncIndex, setFocusedLibFuncIndex] = useState<
    number | null
  >()

  const [clickedPermalinks, setClickedPermalinks] = useState<{
    [key: string]: boolean
  }>(docs.reduce((state, current) => ({ ...state, [current.name]: false }), {}))

  const handlePermalink = (libFuncName: string) => {
    const pageUrl = `${window.location.origin}${window.location.pathname}`
    const permalink = `${pageUrl}#${libFuncName}`

    navigator.clipboard.writeText(permalink)

    // make the permalinks temporary "clicked" to show a specific icon/message
    setClickedPermalinks((previous) => ({
      ...previous,
      [libFuncName]: true,
    }))
    setTimeout(
      () =>
        setClickedPermalinks((previous) => ({
          ...previous,
          [libFuncName]: false,
        })),
      1000,
    )
  }

  // Focus and expand anchored reference
  useEffect(() => {
    if (docs && rowRefs?.current) {
      const libFuncIndex = docs.findIndex((item) => {
        const re = new RegExp(`#${item.name}`, 'gi')
        return router.asPath.match(re)
      })

      if (libFuncIndex >= 0) {
        setFocusedLibFuncIndex(libFuncIndex)
        setTimeout(() => {
          if (rowRefs.current[libFuncIndex]) {
            rowRefs.current[libFuncIndex].scrollIntoView({ behavior: 'smooth' })
          }
        }, 300)
      }
    }
  }, [docs, router.asPath])

  const renderExpandButton = () => {
    return (
      <div className="hidden md:block">
        <Button
          onClick={() => toggleAllRowsExpanded(!isAllRowsExpanded)}
          padded={false}
          transparent
          className="text-gray-800 dark:text-gray-200"
        >
          <span className="text-sm font-normal">
            {isAllRowsExpanded ? 'Collapse' : 'Expand'}
          </span>
          {isAllRowsExpanded ? (
            <RiArrowUpSLine className="text-indigo-500" size="16" />
          ) : (
            <RiArrowDownSLine className="text-indigo-500" size="16" />
          )}
        </Button>
      </div>
    )
  }

  if (docs.length === 0) {
    return <div className="text-center">No core libfunc yet :-/</div>
  }

  const renderHeader = () => {
    return (
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr
            key={headerGroup.getHeaderGroupProps().key}
            className="sticky bg-gray-50 dark:bg-black-700 border-b border-gray-200 dark:border-black-500 uppercase text-xs tracking-wide text-left text-gray-500 dark:text-gray-400"
            style={{
              top: 54,
            }}
          >
            {headerGroup.headers.map((column: any, index: number) => {
              const isLastColumn = index + 1 === headerGroup.headers.length

              return (
                <th
                  key={column.getHeaderProps().key}
                  className={cn('py-3 font-medium', column.className, {
                    'pr-6': !isLastColumn,
                  })}
                  style={{
                    width: column.width || 'auto',
                  }}
                >
                  <div className="flex items-center justify-between">
                    {column.render('Header')}
                    {isLastColumn && renderExpandButton()}
                  </div>
                </th>
              )
            })}
          </tr>
        ))}
      </thead>
    )
  }

  const renderPermalinkCell = (
    listFuncName: string,
    cell: Cell<ILibFuncDoc>,
  ) => {
    return (
      <div className="flex flex-row items-center gap-x-2">
        {clickedPermalinks[listFuncName] ? (
          <>
            <RiCheckLine className="text-green-500" size="16" />
            <span> copied !</span>
          </>
        ) : (
          <>
            <RiLinksLine
              className="text-indigo-500"
              size="16"
              onClick={(e) => {
                handlePermalink(listFuncName)
                e.stopPropagation()
              }}
            />
            {cell.render('Cell')}
          </>
        )}
      </div>
    )
  }

  const renderBody = () => {
    return (
      <tbody {...getTableBodyProps()} className="text-sm">
        {rows.map((row: Row<ILibFuncDoc>) => {
          prepareRow(row)

          const expandedRow = row as Row<ILibFuncDoc> &
            UseExpandedRowProps<ILibFuncDoc>
          const rowId = parseInt(row.id)
          const rowObject = row.original
          const isExpanded =
            expandedRow.isExpanded || focusedLibFuncIndex === rowId

          return (
            <Fragment key={row.getRowProps().key}>
              <tr
                id={`rowObject.name`}
                ref={(el) => {
                  if (el) {
                    rowRefs.current[row.index] = el
                  }
                }}
                className={cn('border-t cursor-pointer', {
                  'border-gray-200 dark:border-black-500 hover:bg-gray-100 dark:hover:bg-black-600':
                    !isExpanded,
                  'border-b border-indigo-100 dark:border-black-500':
                    isExpanded,
                })}
                // @ts-ignore: Waiting for 8.x of react-table to have better types
                onClick={() => row.toggleRowExpanded()}
                style={{ scrollMarginTop: '96px' }}
              >
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={cell.getCellProps().key}
                    // FIXME: See: https://github.com/tannerlinsley/react-table/issues/3064
                    // @ts-ignore: Waiting for 8.x of react-table to have better types
                    className="py-2 pr-6"
                    style={{
                      width: cell.column.width || 'auto',
                    }}
                  >
                    {cellIndex === 0
                      ? renderPermalinkCell(rowObject.name, cell)
                      : cell.render('Cell')}
                  </td>
                ))}
              </tr>

              {isExpanded ? (
                <tr className="bg-indigo-50 dark:bg-black-600">
                  <td colSpan={5}>
                    <DocRowDetail mdxContent={rowObject.mdxDescription} />
                  </td>
                </tr>
              ) : null}
            </Fragment>
          )
        })}
      </tbody>
    )
  }

  return (
    <>
      <div className="flex flex-row items-center justify-end mb-4 md:mb-10">
        <Filters onSetFilter={setFilter} />
      </div>
      <table {...getTableProps()} className="w-full table-fixed">
        {renderHeader()}
        {renderBody()}
      </table>
    </>
  )
}

export default LibFuncTable
