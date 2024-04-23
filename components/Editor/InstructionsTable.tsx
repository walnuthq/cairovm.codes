import React, { memo, useCallback, useEffect, useRef } from 'react'

import ReactTooltip from 'react-tooltip'
import { TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso'
import { IInstruction } from 'types'

import { CodeType } from 'context/appUiContext'

import { SierraVariables } from 'components/Tracer'

import { cn } from '../../util/styles'

const sierraVariableRe = /\[(\d+)\]/

export const InstructionsTable = ({
  instructions,
  activeIndexes,
  errorIndexes,
  variables,
  codeType,
}: {
  instructions: IInstruction[]
  activeIndexes: number[]
  errorIndexes: number[]
  variables: SierraVariables
  codeType: CodeType
}) => {
  // reference to the virtuoso instance
  const virtuosoRef = useRef<TableVirtuosoHandle>(null)
  // reference to the range of items rendered in the dom by virtuoso
  // to determine when to do smooth scroll and when to not
  // Refer: https://virtuoso.dev/scroll-to-index/
  const virtuosoVisibleRange = useRef({
    startIndex: 0,
    endIndex: 0,
  })
  useEffect(() => {
    if (virtuosoRef.current) {
      const indexToScroll = activeIndexes[0]
      if (indexToScroll !== undefined) {
        const { startIndex, endIndex } = virtuosoVisibleRange.current
        // check if the index is between our virtuoso range
        // if within the range we do smooth scroll or else jump scroll
        // Why? because of performance reasons.

        const behavior =
          indexToScroll >= startIndex && indexToScroll <= endIndex
            ? 'smooth'
            : 'auto'

        // scroll to the index
        virtuosoRef.current.scrollToIndex({
          index: indexToScroll,
          align: 'center',
          behavior: behavior,
        })
      }
    }
  }, [activeIndexes])

  const splitInLines = useCallback(
    (instructionName: string) =>
      instructionName.split('\n').map((line, i) => (
        <span key={i}>
          {i !== 0 && <br />}
          {line}
        </span>
      )),
    [],
  )

  const getRandomToolTipId = () =>
    `tooltip-sierra-${Math.floor(Math.random() * 100000000)}`

  const isSierraVariable = (s: string) => sierraVariableRe.test(s)
  const getSierraVariableNameFromTag = (tag: string) => {
    const match = sierraVariableRe.exec(tag)
    if (!match) {
      return null
    }

    return match[1]
  }

  const formatSierraVariableValue = useCallback(
    (values: Array<string>): string => {
      // TODO if type info is provided by the back-end
      // => convert the array of felt252 to a more human-readable
      // value, according to the variable type.
      if (values.length > 1) {
        return `[${values.join(', ')}]`
      }
      return values[0]
    },
    [],
  )

  const renderSierraVariableWithToolTip = useCallback(
    (sierraVariableTag: string, key: number) => {
      const variableName = getSierraVariableNameFromTag(sierraVariableTag)
      if (!variableName) {
        return sierraVariableTag
      }

      if (
        !(variableName in variables) ||
        variables[variableName].length === 0
      ) {
        return sierraVariableTag
      }

      const variableValues = variables[variableName]
      const tooltipId = getRandomToolTipId()

      return (
        <React.Fragment key={key}>
          <span
            data-tip
            data-for={tooltipId}
            className="hover:text-orange-500 cursor-pointer"
          >
            {sierraVariableTag}
          </span>
          <ReactTooltip id={tooltipId} effect="solid">
            <span>{formatSierraVariableValue(variableValues)}</span>
          </ReactTooltip>
        </React.Fragment>
      )
    },
    [formatSierraVariableValue, variables],
  )

  const addVariableToolTipToSierraInstruction = useCallback(
    (instructionName: string) => {
      // regex to split on [*] and \n
      const re = /(?=\[\d+\]|\n)|(?<=\[\d+\]|\n)/g
      const parts = instructionName.split(re)

      return parts.map((part, index) => {
        if (part === '\n') {
          return <br key={index} />
        }

        if (isSierraVariable(part)) {
          return renderSierraVariableWithToolTip(part, index)
        }

        return part
      })
    },
    [renderSierraVariableWithToolTip],
  )

  return (
    <div className="h-full bg-gray-50 dark:bg-black-600 border-gray-200 dark:border-black-500">
      {/* 
        Some References for react-virtuoso:
        Official Doc: https://virtuoso.dev/
        TableVirtuoso: https://virtuoso.dev/hello-table/
        components reference: https://virtuoso.dev/virtuoso-api/interfaces/TableComponents/, https://virtuoso.dev/footer/
      */}
      <TableVirtuoso
        ref={virtuosoRef}
        style={{ height: '100%' }}
        className="pane pane-light relative"
        data={instructions}
        context={{ activeIndexes, errorIndexes }}
        increaseViewportBy={{ top: 150, bottom: 150 }}
        components={{ Table, TableRow }}
        rangeChanged={(range) => (virtuosoVisibleRange.current = range)}
        itemContent={(index, instruction, context) => {
          const isActive = context?.activeIndexes?.includes(index)
          // this should only return the content which should be inside <tr> tag of each row
          // for <table> and <tr> tag refer Table and TableRow components at bottom of this file
          return (
            <TableRowContent
              index={index}
              codeType={codeType}
              isActive={isActive}
              instruction={instruction}
              splitInLines={splitInLines}
              addVariableToolTipToSierraInstruction={
                addVariableToolTipToSierraInstruction
              }
            />
          )
        }}
      />
    </div>
  )
}

const Table = (props: any) => {
  return <table className="w-full font-mono text-tiny" {...props} />
}

const TableRow = (props: any) => {
  const { context, ...rest } = props
  const { activeIndexes, errorIndexes } = context
  const isActive = activeIndexes?.includes(rest?.['data-item-index'])
  const isError = errorIndexes.includes(rest?.['data-item-index'])
  return (
    <tr
      className={cn('border-b border-gray-200 dark:border-black-500 w-full', {
        'text-gray-900 dark:text-gray-200': isActive,
        'text-gray-400 dark:text-gray-600': !isActive,
        'bg-red-100 dark:bg-red-500/10': isError,
      })}
      {...rest}
    />
  )
}

const TableRowContent = memo(
  ({
    codeType,
    index,
    instruction,
    isActive,
    addVariableToolTipToSierraInstruction,
    splitInLines,
  }: {
    index: number
    isActive: boolean
    instruction: IInstruction
    codeType: CodeType
    splitInLines: (instructionName: string) => React.JSX.Element[]
    addVariableToolTipToSierraInstruction: (
      instructionName: string,
    ) => (string | React.JSX.Element)[]
  }) => {
    return (
      <>
        <td className={`pl-6 pr-1 whitespace-nowrap`} style={{ width: '3rem' }}>
          {index + 1}
        </td>
        <td
          className="py-1 px-2 break-normal sm:break-all lg:break-normal"
          style={{ maxWidth: '10rem' }}
        >
          {isActive && codeType === CodeType.Sierra
            ? addVariableToolTipToSierraInstruction(instruction.name)
            : splitInLines(instruction.name)}
        </td>
      </>
    )
  },
)
