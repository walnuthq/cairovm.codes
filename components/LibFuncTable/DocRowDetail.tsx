import cn from 'classnames'
import { MDXRemote } from 'next-mdx-remote'
import remarkGfm from 'remark-gfm'

import { GITHUB_REPO_URL } from 'util/constants'

import { Button } from 'components/ui'
import * as Doc from 'components/ui/Doc'

const options = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
}

const mdxComponents = {
  h1: Doc.H1,
  h2: Doc.H2,
  h3: Doc.H3,
  p: Doc.P,
  ul: Doc.UL,
  ol: Doc.OL,
  li: Doc.LI,
  table: Doc.Table,
  thead: Doc.THead,
  th: Doc.TH,
  td: Doc.TD,
  a: Doc.A,
  pre: Doc.Pre,
}

const DocRowDetail = ({ mdxContent }: { mdxContent: any }) => {
  return (
    <div
      className={cn('text-sm px-4 md:px-8 py-4 ', {
        'bg-indigo-50 dark:bg-black-600': mdxContent,
        'bg-orange-50 dark:bg-gray-800': !mdxContent,
      })}
    >
      <div>
        {mdxContent ? (
          <MDXRemote
            {...mdxContent}
            options={options}
            components={mdxComponents}
          />
        ) : (
          <div className="flex flex-row justify-between items-center">
            <div>
              This function is not yet documented. Feel free to help us
              documenting it !
            </div>
            <Button size="xs" external href={GITHUB_REPO_URL}>
              Contribute on GitHub
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DocRowDetail
