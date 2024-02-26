/* eslint-disable */
const fs = require('fs')
const path = require('path')

const libFuncDocDir = path.normalize(
  path.join(__dirname, '..', '..', 'docs', 'libfuncs'),
)
const libfuncList = require('./libfuncs.json')
const template = fs.readFileSync(path.join(__dirname, 'template.mdx'), 'utf8')

libfuncList.allowed_libfuncs.forEach((f) => {
  const filePath = path.join(libFuncDocDir, `${f}.mdx`)

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, template)
    console.log(`new file for [${f}]`)
  }
})
