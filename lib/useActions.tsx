import { GITHUB_REPO_URL } from 'util/constants'

const useActions = () => {
  return [
    {
      id: 'github',
      name: 'GitHub',
      shortcut: ['g'],
      keywords: 'contribute GitHub issues',
      section: 'Navigation',
      subtitle: 'Contribute on GitHub',
      perform: () => window.open(GITHUB_REPO_URL, '_blank'),
    },
  ]
}

export default useActions
