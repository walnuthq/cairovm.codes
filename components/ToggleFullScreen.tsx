import { useTheme } from 'next-themes'
import { useContext } from 'react'
import { AppUiContext } from 'context/appUiContext'

import {
  RiFullscreenExitFill,
  RiFullscreenExitLine,
  RiFullscreenFill,
  RiFullscreenLine,
} from '@remixicon/react'

import { Button } from 'components/ui'

const ToggleFullScreen = () => {
  const { isFullScreen, toggleFullScreen } = useContext(AppUiContext)

  const { resolvedTheme } = useTheme()

  let handleToggleFullScreen = () => {
    toggleFullScreen()
  }

  let FullScreenIcon
  if (isFullScreen) {
    FullScreenIcon =
      resolvedTheme === 'dark' ? RiFullscreenExitFill : RiFullscreenExitLine
  } else {
    FullScreenIcon =
      resolvedTheme === 'dark' ? RiFullscreenFill : RiFullscreenLine
  }

  return (
    <Button
      transparent
      onClick={handleToggleFullScreen}
      tooltip={`${isFullScreen ? 'Exit' : 'Enter'} Full Screen`}
      tooltipId="toggle-fullscreen"
    >
      <FullScreenIcon
        size={16}
        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      />
    </Button>
  )
}

export default ToggleFullScreen
