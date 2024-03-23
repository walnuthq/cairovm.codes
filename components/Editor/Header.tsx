import { useMemo, useContext, useId } from 'react'
import Select, { OnChangeValue } from 'react-select'

import { CodeType, AppUiContext } from '../../context/appUiContext'

type Props = {
  codeType: string | undefined
  onCodeTypeChange: (option: OnChangeValue<any, any>) => void
  onlyDropDown?: boolean
}

const codeLangOptions = Object.keys(CodeType).map((lang) => ({
  value: lang,
  label: lang,
}))


const EditorHeader = ({
  codeType,
  onCodeTypeChange,
  onlyDropDown = false,
}: Props) => {

  const codeTypeValue = useMemo(
    () => ({
      value: codeType,
      label: codeType,
    }),
    [codeType],
  )
  
  const { isFullScreen } = useContext(AppUiContext)
  return <>
    <div className={`flex justify-between items-center ${!isFullScreen && 'w-full'}`}>

      { !isFullScreen && (
       !onlyDropDown && (
        <h3 className="font-semibold text-md hidden xl:inline-flex items-center">
          <span>Cairo VM Playground</span>
        </h3>
       ))}
      <div className="flex items-center ">
        <Select
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
} 
export default EditorHeader
