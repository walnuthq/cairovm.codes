import { useEffect, useState } from 'react'

import { useKBar } from 'kbar'

import { isMac } from 'util/browser'

import { Button } from 'components/ui'

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
      {/* {isMac && <Icon name="command-line" className="mr-1" />} */}
      {isMacUser ? <span>Cmd + K</span> : <span>Ctrl + K</span>}
    </Button>
  )
}

export default KBarButton
