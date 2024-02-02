import fs from 'fs'
import path from 'path'

import { useContext } from 'react'

import matter from 'gray-matter'
import type { NextPage } from 'next'
import getConfig from 'next/config'
import Head from 'next/head'
import { serialize } from 'next-mdx-remote/serialize'
import { IItemDocs, IGasDocs, IDocMeta } from 'types'

import { AppUiContext } from 'context/appUiContext'

import ContributeBox from 'components/ContributeBox'
import Editor from 'components/Editor'
import AboutCairoVMBanner from 'components/AboutCairoVMBanner'
import HomeLayout from 'components/layouts/Home'
import ReferenceTable from 'components/Reference'
import { H1, Container } from 'components/ui'

const { serverRuntimeConfig } = getConfig()

const HomePage = ({
  opcodeDocs,
  gasDocs,
}: {
  opcodeDocs: IItemDocs
  gasDocs: IGasDocs
}) => {
  const { isFullScreen } = useContext(AppUiContext)

  return (
    <>
      <Head>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="EVM Codes - Opcodes" />
        <meta
          name="description"
          content="An Ethereum Virtual Machine Opcodes Interactive Reference"
        />
      </Head>
      <AboutCairoVMBanner />
      {/* <Container>
        <H1>
          An Ethereum Virtual Machine <br></br> Opcodes Interactive Reference
        </H1>
      </Container> */}

      <Container fullWidth={isFullScreen}>
        <Editor />
      </Container>

      <section className="pt-20 pb-10 text-center">
        <ContributeBox />
      </section>
    </>
  )
}

HomePage.getLayout = function getLayout(page: NextPage) {
  return <HomeLayout>{page}</HomeLayout>
}

export const getStaticProps = async () => {
  const docsPath = path.join(serverRuntimeConfig.APP_ROOT, 'docs/opcodes')
  const docs = fs.readdirSync(docsPath)

  const opcodeDocs: IItemDocs = {}
  const gasDocs: IGasDocs = {}

  await Promise.all(
    docs.map(async (doc) => {
      const stat = fs.statSync(path.join(docsPath, doc))
      const opcode = path.parse(doc).name.toLowerCase()

      try {
        if (stat?.isDirectory()) {
          fs.readdirSync(path.join(docsPath, doc)).map((fileName) => {
            const markdown = fs.readFileSync(
              path.join(docsPath, doc, fileName),
              'utf-8',
            )
            const forkName = path.parse(fileName).name
            if (!(opcode in gasDocs)) {
              gasDocs[opcode] = {}
            }
            gasDocs[opcode][forkName] = markdown
          })
        } else {
          const markdownWithMeta = fs.readFileSync(
            path.join(docsPath, doc),
            'utf-8',
          )
          const { data, content } = matter(markdownWithMeta)
          const meta = data as IDocMeta
          const mdxSource = await serialize(content)

          opcodeDocs[opcode] = {
            meta,
            mdxSource,
          }
        }
      } catch (error) {
        console.debug("Couldn't read the Markdown doc for the opcode", error)
      }
    }),
  )
  return {
    props: {
      opcodeDocs,
      gasDocs,
    },
  }
}

export default HomePage
