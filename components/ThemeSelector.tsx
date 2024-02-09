import { RiContrast2Fill, RiContrast2Line } from '@remixicon/react'
import { useRegisterActions, Action } from 'kbar'
import { useTheme } from 'next-themes'

import { Button } from 'components/ui'

const ThemeSelector = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const actions: Action[] = [
    {
      id: 'theme',
      name: 'Change theme…',
      keywords: 'interface color dark light',
      section: 'Preferences',
    },
    {
      id: 'theme-light',
      name: 'Light',
      shortcut: [],
      keywords: 'light',
      section: '',
      perform: () => setTheme('light'),
      parent: 'theme',
    },
    {
      id: 'theme-dark',
      name: 'Dark',
      shortcut: [],
      keywords: 'dark',
      section: '',
      perform: () => setTheme('dark'),
      parent: 'theme',
    },
    {
      id: 'theme-system',
      name: 'System',
      shortcut: [],
      keywords: 'system',
      section: '',
      perform: () => setTheme('system'),
      parent: 'theme',
    },
    {
      id: 'theme',
      name: 'Select theme…',
      shortcut: ['t'],
      keywords: 'theme appearance',
      section: 'Preferences',
      // children: ['theme-light', 'theme-dark', 'theme-system'],
    },
  ]

  useRegisterActions(actions, [actions])

  const handleThemChange = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  let Contrast2Icon
  if (resolvedTheme === 'dark') {
    Contrast2Icon = RiContrast2Fill
  } else {
    Contrast2Icon = RiContrast2Line
  }

  return (
    <Button transparent onClick={handleThemChange}>
      <Contrast2Icon
        size={16}
        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      />
    </Button>
  )
}

export default ThemeSelector
