import cn from 'classnames'
import Link from 'next/link'

import { GITHUB_REPO_URL } from 'util/constants'

import NavLink from 'components/NavLink'
import ThemeSelector from 'components/ThemeSelector'
import ToggleFullScreen from 'components/ToggleFullScreen'
import { Container, Logo } from 'components/ui'
import KBarButton from 'components/KBar/Button'

const Nav = () => {
  return (
    <nav className="fixed z-40 top-0 inset-x-0 py-2 bg-white dark:bg-black-800">
      <Container>
        <div className="h-10 flex items-center justify-between">
          <Link href="/" passHref legacyBehavior>
            <a>
              <Logo />
            </a>
          </Link>

          <ul
            className={cn(
              'py-2 md:py-0 px-2 flex justify-between items-start md:items-center flex-col md:flex-row w-full md:w-auto fixed md:static shadow-md md:shadow-none transition-all',
              '-left-full',
            )}
            style={{ top: 56 }}
          ></ul>

          <div className="items-center ml-auto flex">
            <KBarButton />
            <NavLink href={GITHUB_REPO_URL} external>
              GitHub
            </NavLink>
            <ToggleFullScreen />
            <ThemeSelector />
          </div>
        </div>
      </Container>
    </nav>
  )
}

export default Nav
