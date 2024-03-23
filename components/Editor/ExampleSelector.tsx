import React, { useId } from 'react'

import { RiFileCodeLine } from '@remixicon/react'
import cn from 'classnames'
import Select, {
  components,
  DropdownIndicatorProps,
  StylesConfig,
  GroupBase,
} from 'react-select'

import { Button } from '../ui'

import { Examples, CairoExampleNames } from './examples'

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
      menuPlacement="auto"
      isSearchable={false}
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
    <div>
      <components.DropdownIndicator {...props}>
        <Button
          transparent
          padded={false}
          tooltip="Cairo Examples"
          tooltipId="cairo-examples"
          className={cn(
            'p-2 text-indigo-500 hover:text-indigo-600 focus:outline-none',
            props.selectProps.menuIsOpen
              ? 'bg-black-900/5 dark:bg-white/5'
              : '',
          )}
        >
          <RiFileCodeLine size={16} />
        </Button>
      </components.DropdownIndicator>
    </div>
  )
}
