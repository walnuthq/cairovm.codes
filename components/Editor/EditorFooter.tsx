import { useContext } from 'react'

import { AppUiContext } from '../../context/appUiContext'
import { CairoVMApiContext } from '../../context/cairoVMApiContext'
import { cn } from '../../util/styles'
import KBarButton from '../KBar/Button'
import ThemeSelector from '../ThemeSelector'
import ToggleFullScreen from '../ToggleFullScreen'
import ToggleThreeColumnLayout from '../ToggleThreeColumnLayout'

function EditorFooter({ withoutContent = false }) {
  const { cairoLangCompilerVersion } = useContext(CairoVMApiContext)
  const { isFullScreen } = useContext(AppUiContext)
  return (
    <div
      className={cn(
        'px-5 bg-gray-100 dark:bg-darkMode-secondary border border-gray-200 dark:border-darkMode-primary text-xs h-[42px] items-center text-gray-600 ml-auto flex justify-between',
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
            {!withoutContent && (
              <>
                <KBarButton />
                <ToggleFullScreen />
              </>
            )}

            <ToggleThreeColumnLayout />
            {!withoutContent && <ThemeSelector />}
          </div>
        </div>
      )}
    </div>
  )
}

export default EditorFooter
