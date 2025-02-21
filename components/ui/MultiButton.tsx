import { useState } from 'react'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

import { Button } from './Button'

interface ButtonAction {
  name: string
  action: () => void
}

interface MultiButtonProps {
  buttonActions: ButtonAction[]
  defaultLabel?: string
}

const MultiButton = ({
  buttonActions,
  defaultLabel = 'Default',
}: MultiButtonProps) => {
  const [selected, setSelected] = useState<ButtonAction>(
    buttonActions[0] || {
      name: defaultLabel,
      action: () => console.log('Default action triggered'),
    },
  )

  const handleSelect = (item: ButtonAction) => {
    setSelected(item)
  }

  return (
    <div className="inline-flex min-h-[38px] rounded bg-[#E85733]">
      <Button
        size="sm"
        className="rounded-r-none px-3 py-2 text-xs md:text-sm min-w-[120px] flex items-center whitespace-nowrap justify-center"
        onClick={selected.action}
      >
        {selected.name}
      </Button>

      <Menu as="div" className="relative">
        <MenuButton className="h-full px-3 flex items-center justify-center rounded-r bg-[#E85733] hover:bg-[#fa5d36] focus:z-10 relative">
          <span className="sr-only">Open options</span>
          <ChevronDownIcon aria-hidden="true" className="w-5" color="black" />
          <span className="absolute left-0 top-1/2 h-2/3 w-[1px] bg-[#00000033] -translate-y-1/2" />
        </MenuButton>

        <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded shadow-lg focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in dark:bg-darkMode-primary bg-white">
          <div className="py-1">
            {buttonActions.map((item) => (
              <MenuItem key={item.name}>
                {({ active }) => (
                  <button
                    onClick={() => handleSelect(item)}
                    className={`block w-full px-4 py-2 text-sm text-left dark:text-darkMode-text text-gray-900 ${
                      active
                        ? 'dark:bg-darkMode-secondary dark:text-white bg-gray-100 text-black'
                        : ''
                    }`}
                  >
                    {item.name}
                  </button>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>
    </div>
  )
}

export default MultiButton
