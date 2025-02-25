import { useState } from 'react'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

import { Button } from './Button'

type CompileMods = 'run' | 'run-prove-verify' | 'prove'
interface MultiButtonProps {
  onCompileRun: (variant: CompileMods) => void
}

const MultiButton = ({ onCompileRun }: MultiButtonProps) => {
  const [selected, setSelected] = useState<CompileMods>('run-prove-verify')

  const handleMainButtonClick = () => {
    switch (selected) {
      case 'run-prove-verify':
        onCompileRun('run-prove-verify')
        break
      case 'run':
        onCompileRun('run')
        break
      case 'prove':
        onCompileRun('prove')
        break
      default:
        break
    }
  }

  return (
    <div className="inline-flex min-h-[38px] rounded bg-[#E85733] justify-between">
      <Button
        size="sm"
        className="rounded-r-none px-3 py-2 text-xs md:text-sm min-w-[160px] flex items-center whitespace-nowrap justify-left flex-1"
        onClick={handleMainButtonClick}
      >
        {selected === 'run-prove-verify'
          ? 'Run and prove'
          : selected === 'run'
          ? 'Only run'
          : 'Only prove'}
      </Button>

      <Menu as="div" className="relative">
        <MenuButton className="h-full px-3 flex items-center justify-center rounded-r bg-[#E85733] hover:bg-[#fa5d36] focus:z-10 relative">
          <span className="sr-only">Open options</span>
          <ChevronDownIcon aria-hidden="true" className="w-5" color="black" />
          <span className="absolute left-0 top-1/2 h-2/3 w-[1px] bg-[#00000033] -translate-y-1/2" />
        </MenuButton>
        <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded shadow-lg focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in dark:bg-darkMode-primary bg-white">
          <div>
            <MenuItem>
              <button
                onClick={() => setSelected('run')}
                className="block w-full px-4 pt-3 pb-2 text-sm text-left dark:text-darkMode-text text-gray-900 hover:bg-gray-100 dark:hover:bg-darkMode-secondary hover:rounded-t rounded-none"
              >
                Only run
              </button>
            </MenuItem>
            <MenuItem>
              <button
                onClick={() => setSelected('prove')}
                className="block w-full px-4 py-2 text-sm text-left dark:text-darkMode-text text-gray-900 hover:bg-gray-100 dark:hover:bg-darkMode-secondary rounded-none"
              >
                Only prove
              </button>
            </MenuItem>
            <MenuItem>
              <button
                onClick={() => setSelected('run-prove-verify')}
                className="block w-full px-4 pt-2 pb-3 text-sm text-left dark:text-darkMode-text text-gray-900 hover:bg-gray-100 dark:hover:bg-darkMode-secondary hover:rounded-b rounded-none"
              >
                Run and prove
              </button>
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
    </div>
  )
}

export default MultiButton
