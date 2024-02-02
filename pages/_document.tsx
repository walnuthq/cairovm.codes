import Document, { Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          ></link>
        </Head>
        <body className="dark:bg-black-800 dark:text-gray-200">
          <Main />

          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
