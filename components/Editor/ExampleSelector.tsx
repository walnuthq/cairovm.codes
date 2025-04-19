import { useId } from 'react'

import { RiFileCodeLine } from '@remixicon/react'
import Select, {
  components,
  DropdownIndicatorProps,
  GroupBase,
  StylesConfig,
  OptionProps,
} from 'react-select'
import ReactTooltip from 'react-tooltip'

import { cn } from '../../util/styles'
import { Button } from '../ui'

import { CairoExampleNames, Examples, ProveExamples } from './examples'

type SelectOption = {
  value: number
  label: string
}
type OptionType = {
  value: number
  label: string
  isDisabled?: boolean
}

type Props = {
  onExampleChange: (option: SelectOption | null) => void
  isProveMode: boolean
}

const CustomOption = (props: OptionProps<OptionType, false>) => {
  const { data, isDisabled } = props
  const tooltipId = `tooltip-${data.value}`

  return (
    <>
      <components.Option
        {...props}
        innerRef={props.innerRef}
        innerProps={{
          ...props.innerProps,
          ...(isDisabled && {
            'data-tip': 'This example is not available for proving.',
            'data-for': tooltipId,
          }),
        }}
      />
      {isDisabled && (
        <ReactTooltip
          id={tooltipId}
          place="right"
          delayShow={200}
          effect="solid"
        />
      )}
    </>
  )
}

export function MobileExampleSelector({ onExampleChange, isProveMode }: Props) {
  const examplesArray = isProveMode ? ProveExamples : Examples
  const examplesOptions = examplesArray.Cairo.map((code, i) => ({
    value: i,
    label: CairoExampleNames[i],
    isDisabled:
      isProveMode &&
      (CairoExampleNames[i].includes('Contract') ||
        !code.includes('#[executable]')),
  }))

  return (
    <Select
      onChange={onExampleChange}
      options={examplesOptions}
      defaultValue={examplesOptions[0]}
      components={{
        DropdownIndicator,
        Option: CustomOption,
      }}
      controlShouldRenderValue={false}
      classNamePrefix="select"
      styles={reactSelectStyles}
      menuPlacement="top"
      isSearchable={false}
      instanceId={useId()}
    />
  )
}

export function ExampleSelector({ onExampleChange, isProveMode }: Props) {
  const examplesArray = isProveMode ? ProveExamples : Examples
  const examplesOptions = examplesArray.Cairo.map((code, i) => ({
    value: i,
    label: CairoExampleNames[i],
    isDisabled:
      isProveMode &&
      (CairoExampleNames[i].includes('Contract') ||
        !code.includes('#[executable]')),
  }))

  return (
    <Select<OptionType, false>
      onChange={onExampleChange}
      options={examplesOptions}
      defaultValue={examplesOptions[0]}
      classNamePrefix="select"
      placeholder={'Choose Cairo Example'}
      menuPlacement="top"
      isSearchable={false}
      components={{
        Option: CustomOption,
      }}
      instanceId={useId()}
    />
  )
}

export default ExampleSelector

const reactSelectStyles: StylesConfig<
  SelectOption,
  false,
  GroupBase<SelectOption>
> = {
  // as we dont want to show value field in react-select
  // and just want to show an icon, but input field takes some space
  // so we hide the valueContainer with css properties
  // Question: Why not remove the ValueContainer completely from 'components' prop in react-select?
  // Ans: react-select needs a valuefield
  //      as many features like click outside to close drop down etc depends on it
  //      so we just add display none (it doesn't hurt)
  valueContainer: (styles) => ({
    ...styles,
    width: '0',
    opacity: 0,
    padding: '0 !important',
  }),
}

const DropdownIndicator = (props: DropdownIndicatorProps<SelectOption>) => {
  return (
    <components.DropdownIndicator {...props}>
      <Button
        transparent
        padded={false}
        tooltip="Cairo Examples"
        tooltipId="cairo-examples"
        className={cn(
          'p-2 text-[#E85733] dark:text-darkMode-icons hover:text-[#fc9278] focus:outline-none',
          props.selectProps.menuIsOpen ? 'bg-black-900/5 dark:bg-white/5' : '',
        )}
      >
        <RiFileCodeLine size={16} />
      </Button>
    </components.DropdownIndicator>
  )
}
