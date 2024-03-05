import fs from 'fs'
import path from 'path'

import { useState, useEffect } from 'react'

import { RiCloseLine } from '@remixicon/react'
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
import { H1, H2, Container } from 'components/ui'

const { serverRuntimeConfig } = getConfig()

const LibFuncPage = ({ libFuncDocs }: { libFuncDocs: ILibFuncDocs }) => {
  const [showIntro, setShowIntro] = useState(false)

  useEffect(() => {
    const isIntroClosed = localStorage.getItem('isIntroClosed')
    if (!isIntroClosed) {
      setShowIntro(true)
    }
  }, [])

  const handleCloseIntro = () => {
    localStorage.setItem('isIntroClosed', 'closed')
    setShowIntro(false)
  }

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
      <Container className="text-sm leading-6">
        <H1>Sierra LibFuncs - Interactive Reference</H1>

        {showIntro && (
          <>
            <div className="flex flex-row justify-between item-centers">
              <H2 className="mb-4">Introduction</H2>
              <button
                onClick={handleCloseIntro}
                aria-label="Close Introduction"
              >
                <RiCloseLine size={24} />
              </button>
            </div>
            <div>
              <p className="pb-4">
                <span className="text-blue-500 font-semibold">Sierra</span> is
                an intermediate language built as a stable layer between{' '}
                <span className="text-blue-500 font-semibold">Cairo</span>, a
                high-level language, and{' '}
                <span className="text-blue-500 font-semibold">CASM</span>, the
                instruction set of the Cairo VM.
              </p>
              <p className="pb-4">
                Sierra statements are constructed using a fixed set of functions
                called{' '}
                <span className="text-blue-500 font-semibold">Libfuncs</span>.
                These functions follow a specific format:{' '}
                <code>{`<libfunc>(<invoke refs>) -> (<output refs>)`}</code>
              </p>
              <p>
                The input parameters are referred to as{' '}
                <span className="text-blue-500 font-semibold">Invoke Refs</span>{' '}
                while the output parameters are referred to as{' '}
                <span className="text-blue-500 font-semibold">Output Refs</span>
                . Both are{' '}
                <span className="text-blue-500 font-semibold">references</span>,
                represented by a numeric value in brackets, such as{' '}
                <code>[140]</code>.
              </p>
              <p className="pb-4">
                A single reference always refers to the same variable throughout
                the program's execution. Each variable's value associated with a
                reference is a set of one or more <code>felt252</code> values.
              </p>
              <p>
                Sierra also employs a specific syntax for handling output
                branches: the{' '}
                <span className="text-blue-500 font-semibold">falltrough</span>{' '}
                branch is used when the function execution is successful while a
                failure branch can be specified using a{' '}
                <code className="text-blue-500 font-semibold">
                  StatementIdx
                </code>{' '}
                which is the numerical index of the statement to jump to in case
                of failure.
              </p>
              <p className="py-2">
                The complete format for this type of libfunc is:
              </p>
              <pre className="py-2 ml-8">
                {`<libfunc>(<invoke refs>) {
  fallthrough(<output refs>)
  StatementIdx(<output refs>)
}`}
              </pre>
              <p className="pb-4 italic">
                Note that in the following documentation, an integer value is
                represented by a numeric value like <code>10</code> while an
                address is represented using a <code>@</code> like{' '}
                <code>@10</code>.
              </p>
            </div>
          </>
        )}
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
            fallthroughBranch: metadata['fallthroughBranch'] || null,
            statementBranch: metadata['statementBranch'] || null,
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
