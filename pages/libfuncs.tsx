import fs from 'fs'
import path from 'path'

import matter from 'gray-matter'
import type { NextPage } from 'next'
import getConfig from 'next/config'
import Head from 'next/head'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import { ILibFuncDocs } from 'types'

import ContributeBox from 'components/ContributeBox'
import HomeLayout from 'components/layouts/Home'
import LibFuncTable from 'components/LibFuncTable'
import { H1, Container } from 'components/ui'

const { serverRuntimeConfig } = getConfig()

const LibFuncPage = ({ libFuncDocs }: { libFuncDocs: ILibFuncDocs }) => {
  return (
    <>
      <Head>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CairoVM Codes - LibFuncs" />
        <meta
          name="description"
          content="Sierra LibFuncs Interactive Reference"
        />
      </Head>
      <Container>
        <H1>Sierra LibFuncs Interactive Reference</H1>
      </Container>

      <section className="py-10 md:py-20 bg-gray-50 dark:bg-black-700">
        <Container>
          <LibFuncTable docs={libFuncDocs} />
        </Container>
      </section>

      <section className="pt-20 pb-10 text-center">
        <ContributeBox />
      </section>
    </>
  )
}

LibFuncPage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export const getStaticProps = async () => {
  const mdxOptions = {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  }

  const docsPath = path.join(serverRuntimeConfig.APP_ROOT, 'docs/libfuncs')
  const docs = fs.readdirSync(docsPath)

  const libFuncDocs: ILibFuncDocs = []

  await Promise.all(
    docs.map(async (docFile) => {
      const docFileInfo = fs.statSync(path.join(docsPath, docFile))
      const libFuncName = path.parse(docFile).name.toLowerCase()

      try {
        if (docFileInfo.isFile()) {
          const mdxFileContent = fs.readFileSync(
            path.join(docsPath, docFile),
            'utf-8',
          )
          const { data: metadata, content } = matter(mdxFileContent)

          libFuncDocs.push({
            name: libFuncName,
            shortDescription: metadata['shortDescription'] || null,
            invokeRefs: metadata['invokeRefs'] || null,
            outputRefs: metadata['outputRefs'] || null,
            mdxDescription:
              content.length > 0
                ? await serialize(content, {
                    scope: {},
                    mdxOptions,
                    parseFrontmatter: false,
                  })
                : null,
          })
        }
      } catch (error) {
        console.debug("Couldn't read the Markdown doc for the opcode", error)
      }
    }),
  )
  return {
    props: {
      libFuncDocs,
    },
  }
}

export default LibFuncPage
