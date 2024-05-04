import { useMemo, useId } from 'react'

import Image from 'next/image'
import cairoLogo from 'public/cairo_logo.png'
import Select, { OnChangeValue } from 'react-select'

import { CodeType } from '../../context/appUiContext'

type Props = {
  codeType: string | undefined
  onCodeTypeChange: (option: OnChangeValue<any, any>) => void
  onlyDropDown?: boolean
  withLogo?: boolean
}

const codeLangOptions = Object.keys(CodeType).map((lang) => ({
  value: lang,
  label: lang,
}))

const EditorHeader = ({
  codeType,
  onCodeTypeChange,
  onlyDropDown = false,
  withLogo = false,
}: Props) => {
  const codeTypeValue = useMemo(
    () => ({
      value: codeType,
      label: codeType,
    }),
    [codeType],
  )
  return (
    <>
      <div className={'flex justify-between items-center w-full'}>
        {!onlyDropDown &&
          (withLogo ? (
            <div className="flex items-center text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
              <span className="pr-2">cairovm</span>
              <Image src={cairoLogo} width={20} height={20} alt="cairo" />
              <span className="pl-2">codes</span>
            </div>
          ) : (
            <h3 className="font-semibold text-md hidden xl:inline-flex items-center">
              <span>Cairo VM Playground</span>
            </h3>
          ))}

        <div className="flex items-center ">
          <Select
            className="z-40"
            onChange={onCodeTypeChange}
            options={codeLangOptions}
            value={codeTypeValue}
            isSearchable={false}
            classNamePrefix="select"
            menuPlacement="auto"
            instanceId={useId()}
          />
        </div>
      </div>
    </>
  )
}
export default EditorHeader
