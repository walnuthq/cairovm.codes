import { useEffect, useState } from 'react'

import { useKBar } from 'kbar'

import { isMac } from 'util/browser'

import { Button } from 'components/ui'
import { RiCommandLine } from '@remixicon/react'

const KBarButton = () => {
  const { query } = useKBar()
  const [isMacUser, setIsMacUser] = useState(false)

  useEffect(() => {
    const checkIfMacUser = () => {
      setIsMacUser(isMac)
    }

    checkIfMacUser()
  }, [])

  return (
    <Button
      size="xs"
      onClick={query.toggle}
      className="mx-4 py-1 px-2 font-medium"
      transparent
      outline
      padded={false}
    >
      {isMacUser ? (
        <span className="flex flex-row">
          <RiCommandLine size={16} className="mr-0.5" />K
        </span>
      ) : (
        <span>Ctrl + K</span>
      )}
    </Button>
  )
}

export default KBarButton
