import { useContext, useEffect, useMemo, useState, useCallback } from 'react'

import { useRegisterActions, Action } from 'kbar'
import { useRouter } from 'next/router'
import Select, { OnChangeValue, components } from 'react-select'

import { EthereumContext } from 'context/ethereumContext'

import { CURRENT_FORK } from 'util/constants'
import { toKeyIndex } from 'util/string'

import { Label } from 'components/ui'

const ChainOption = (props: any) => {
  const { data, children } = props
  const isCurrent = data.value === CURRENT_FORK

  return (
    <components.Option {...props}>
      {children}
      {isCurrent && <Label>Live</Label>}
    </components.Option>
  )
}

const ChainSelector = () => {
  const { forks, selectedFork, onForkChange } = useContext(EthereumContext)

  const [forkValue, setForkValue] = useState()
  const [actions, setActions] = useState<Action[]>([])
  const router = useRouter()

  const forkOptions = useMemo(
    () => forks.map((fork) => ({ value: fork.name, label: fork.name })),
    [forks],
  )

  const defaultForkOption = useMemo(
    () => forkOptions.find((fork) => fork.value === selectedFork?.name),
    [forkOptions, selectedFork],
  )

  const handleForkChange = useCallback(
    (option: OnChangeValue<any, any>) => {
      setForkValue(option)
      onForkChange(option.value)

      router.query.fork = option.value
      router.push(router)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onForkChange],
  )

  useEffect(() => {
    if (defaultForkOption) {
      handleForkChange(defaultForkOption)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultForkOption])

  useEffect(() => {
    const forkIds: string[] = []

    const forkActions = forkOptions.map(
      (option: OnChangeValue<any, any>, index) => {
        const keyId = toKeyIndex('fork', index)
        forkIds.push(keyId)

        return {
          id: keyId,
          name: option.label,
          shortcut: [],
          keywords: option.label,
          section: '',
          perform: () => handleForkChange(option),
          parent: 'fork',
        }
      },
    )

    if (forkIds.length > 0) {
      setActions([
        ...forkActions,
        {
          id: 'fork',
          name: 'Select hardfork…',
          shortcut: ['f'],
          keywords: 'fork network evm',
          section: 'Preferences',
        },
      ])
    }
  }, [forkOptions, handleForkChange])

  useRegisterActions(actions, [actions])

  return (
    <div className="flex justify-end items-center rounded">
      {forks.length > 0 && (
        <div className="flex items-center mr-2">
          {/* <Icon name="git-branch-line" className="text-indigo-500 mr-2" /> */}

          <Select
            onChange={handleForkChange}
            options={forkOptions}
            value={forkValue}
            isSearchable={false}
            classNamePrefix="select"
            menuPlacement="auto"
            components={{ Option: ChainOption }}
          />
        </div>
      )}
    </div>
  )
}

export default ChainSelector
