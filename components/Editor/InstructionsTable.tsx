import { useEffect, useRef } from 'react'

import cn from 'classnames'
import ReactTooltip from 'react-tooltip'
import { IInstruction } from 'types'

import { CodeType } from 'context/appUiContext'

import { SierraVariables } from 'components/Tracer'

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
  useEffect(() => {
    if (
      tableRef.current &&
      focusRowRef.current &&
      focusRowRef.current.offsetTop
    ) {
      tableRef.current.scrollTo({
        top: focusRowRef.current.offsetTop - 58,
        behavior: 'smooth',
      })
    }
  }, [activeIndexes])

  const tableRef = useRef<HTMLDivElement>(null)
  const focusRowRef = useRef<HTMLTableRowElement>(null)

  const splitInLines = (instructionName: string) =>
    instructionName.split('\n').map((line, i) => (
      <span key={i}>
        {i !== 0 && <br />}
        {line}
      </span>
    ))

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

  const formatSierraVariableValue = (values: Array<string>): string => {
    // TODO if type info is provided by the back-end
    // => convert the array of felt252 to a more human-readable
    // value, according to the variable type.
    if (values.length > 1) {
      return `[${values.join(', ')}]`
    }
    return values[0]
  }

  const renderSierraVariableWithToolTip = (
    sierraVariableTag: string,
    key: number,
  ) => {
    const variableName = getSierraVariableNameFromTag(sierraVariableTag)
    if (!variableName) {
      return sierraVariableTag
    }

    if (!(variableName in variables) || variables[variableName].length === 0) {
      return sierraVariableTag
    }

    const variableValues = variables[variableName]
    const tooltipId = getRandomToolTipId()

    return (
      <>
        <span
          key={key}
          data-tip
          data-for={tooltipId}
          className="hover:text-orange-500 cursor-pointer"
        >
          {sierraVariableTag}
        </span>
        <ReactTooltip id={tooltipId} effect="solid">
          <span>{formatSierraVariableValue(variableValues)}</span>
        </ReactTooltip>
      </>
    )
  }

  const addVariableToolTipToSierraInstruction = (instructionName: string) => {
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
  }

  return (
    <div
      ref={tableRef}
      className="overflow-auto pane pane-light relative bg-gray-50 dark:bg-black-600 border-gray-200 dark:border-black-500"
    >
      <table className="w-full font-mono text-tiny">
        <tbody>
          {instructions.map((instruction, index) => {
            const isActive = activeIndexes.includes(index)
            const isError = errorIndexes.includes(index)
            return (
              <tr
                ref={activeIndexes[0] === index ? focusRowRef : undefined}
                key={index}
                className={cn(
                  'border-b border-gray-200 dark:border-black-500',
                  {
                    'text-gray-900 dark:text-gray-200': isActive,
                    'text-gray-400 dark:text-gray-600': !isActive,
                    'bg-red-100 dark:bg-red-500/10': isError,
                  },
                )}
              >
                <td className={`pl-6 pr-1 px-2 whitespace-nowrap w-[1%]`}>
                  {index + 1}
                </td>
                <td className="py-1 px-2 max-w-40 break-words">
                  {isActive && codeType === CodeType.Sierra
                    ? addVariableToolTipToSierraInstruction(instruction.name)
                    : splitInLines(instruction.name)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
