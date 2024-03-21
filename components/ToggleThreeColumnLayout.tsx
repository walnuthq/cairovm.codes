import { useContext } from 'react'

import { RiLayoutVerticalLine, RiLayoutVerticalFill } from '@remixicon/react'
import { Action, Priority, useRegisterActions } from 'kbar'

import { AppUiContext } from 'context/appUiContext'

import { Button } from 'components/ui'

const ToggleThreeColumnLayout = () => {
  const { isThreeColumnLayout, toggleThreeColumnLayout } =
    useContext(AppUiContext)

  const actions: Action[] = [
    {
      id: 'threeColumnLayout',
      name: 'Three Column Layout',
      shortcut: ['l'],
      keywords: 'three column layout',
      section: 'Preferences',
      subtitle: 'Enable / Disable Three Column Layout',
      perform: () => {
        toggleThreeColumnLayout()
      },
      priority: Priority.LOW,
    },
  ]

  useRegisterActions(actions, [actions])

  const handleToggleThreeColumnLayout = () => {
    toggleThreeColumnLayout()
  }

  let ColumnLayoutIcon
  if (isThreeColumnLayout) {
    ColumnLayoutIcon = RiLayoutVerticalFill
  } else {
    ColumnLayoutIcon = RiLayoutVerticalLine
  }

  return (
    <Button
      transparent
      onClick={handleToggleThreeColumnLayout}
      tooltip={`${
        isThreeColumnLayout ? 'Disable' : 'Enable'
      } Three Column Layout`}
      tooltipId="toggle-threeColumnLayout"
    >
      <ColumnLayoutIcon
        size={16}
        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      />
    </Button>
  )
}

export default ToggleThreeColumnLayout
