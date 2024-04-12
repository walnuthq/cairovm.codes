import { useContext } from 'react'

import { AppUiContext } from '../../context/appUiContext'
import { CairoVMApiContext } from '../../context/cairoVMApiContext'
import { cn } from '../../util/styles'
import KBarButton from '../KBar/Button'
import ThemeSelector from '../ThemeSelector'
import ToggleFullScreen from '../ToggleFullScreen'
import ToggleThreeColumnLayout from '../ToggleThreeColumnLayout'

function EditorFooter() {
  const { cairoLangCompilerVersion } = useContext(CairoVMApiContext)
  const { isFullScreen } = useContext(AppUiContext)
  return (
    <div
      className={cn(
        'px-5 bg-gray-100 dark:bg-black-700 border-t border-gray-200 dark:border-black-500 text-xs h-[42px] items-center text-gray-600 ml-auto flex justify-between',
        !isFullScreen && 'rounded-b-lg',
      )}
    >
      <span>
        {cairoLangCompilerVersion !== ''
          ? `Cairo Compiler v${cairoLangCompilerVersion}`
          : ' '}
      </span>

      {isFullScreen && (
        <div className="flex items-center justify-end divide-x divide-gray-200 dark:divide-black-500">
          <span className="pr-4">
            Made with ❤️ by{' '}
            <a
              className="underline font-medium"
              href="https://walnut.dev"
              target="_blank"
              rel="noreferrer"
            >
              Walnut
            </a>
          </span>
          <div className="items-center flex">
            <KBarButton />
            <ToggleFullScreen />
            <ToggleThreeColumnLayout />
            <ThemeSelector />
          </div>
        </div>
      )}
    </div>
  )
}

export default EditorFooter
