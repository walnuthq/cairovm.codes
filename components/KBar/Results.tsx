import { KBarResults, useMatches } from 'kbar'

import ResultItem from './ResultItem'

const Results = () => {
  const groups = useMatches().results

  return (
    <KBarResults
      items={groups}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div className="px-4 py-2 text-2xs uppercase text-gray-400 dark:text-gray-600 bg-white dark:bg-black-600">
            {item}
          </div>
        ) : (
          <ResultItem action={item} active={active} />
        )
      }
    />
  )
}

export default Results
