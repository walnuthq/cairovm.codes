import { useId } from 'react'

import { RiFileCodeLine } from '@remixicon/react'
import Select, {
  components,
  DropdownIndicatorProps,
  GroupBase,
  StylesConfig,
} from 'react-select'

import { cn } from '../../util/styles'
import { Button } from '../ui'

import { CairoExampleNames, Examples } from './examples'

type SelectOption = {
  value: number
  label: string
}

type Props = {
  onExampleChange: (option: SelectOption | null) => void
}

const examplesOptions = Examples.Cairo.map((_, i) => ({
  value: i,
  label: CairoExampleNames[i],
}))

function ExampleSelector({ onExampleChange }: Props) {
  return (
    <Select
      onChange={onExampleChange}
      options={examplesOptions}
      components={{
        DropdownIndicator,
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

export default ExampleSelector

export function MobileExampleSelector({ onExampleChange }: Props) {
  return (
    <Select
      onChange={onExampleChange}
      options={examplesOptions}
      classNamePrefix="select"
      placeholder={'Choose Cairo Example'}
      menuPlacement="top"
      isSearchable={false}
      instanceId={useId()}
      styles={{
        placeholder: (baseStyles) => ({
          ...baseStyles,
          color: '#4B5563',
          ':hover': {
            color: '#111827',
          },
          whiteSpace: 'nowrap',
        }),
      }}
    />
  )
}

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
