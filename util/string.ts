import hljs from 'highlight.js/lib/core'
// @ts-ignore - Cairo is not part of the official highlightjs package
import hljsDefineCairo from 'highlightjs-cairo'

import hljsDefineBytecode from '../bytecode.js'
import hljsDefineMnemonic from '../mnemonic.js'

const reHex = /^[0-9a-fA-F]+$/
const reFullHex = /^(0x|0X)([0-9a-fA-F][0-9a-fA-F])+$/

// Add Cairo to Highlight
hljsDefineCairo(hljs)
hljs.registerLanguage('mnemonic', hljsDefineMnemonic)
hljs.registerLanguage('bytecode', hljsDefineBytecode)

/**
 * Checks whether text is empty.
 */
export const isEmpty = (text: string) => {
  return !text || text.length === 0
}

/**
 * Converts number to a hex representation with double-digit formatting.
 */
export const toHex = (text: string | number) => {
  let hex = Number(text).toString(16)
  if (hex.length < 2) {
    hex = '0' + hex
  }
  return hex
}

/**
 * Checks whether text is in hex format.
 */
export const isHex = (text: string) => {
  return reHex.test(text)
}

/**
 * Checks whether text is in full hex format, starting with 0x
 */
export const isFullHex = (text: string) => {
  return reFullHex.test(text)
}

/**
 * Formats the code with Highlight.js for a given language extension.
 *
 * @param text The text to be highlighted.
 * @param extension One of the supported highlight.js language extensions w/o dot.
 * @returns Highlighted text.
 */
export const codeHighlight = (text: string, extension: string) => {
  return hljs.highlight(text, {
    language: extension,
    ignoreIllegals: true,
  })
}

/**
 * Converts buffer to string.
 */
export const fromBuffer = (buf: Buffer) => {
  let result = ''
  buf.forEach((value) => {
    result += value.toString(16).padStart(2, '0')
  })
  return result
}

/**
 * Creates a RC key from string prefix and index.
 */
export const toKeyIndex = (prefix: string, index: number) => {
  return [prefix, index].join('-')
}

/**
 * Creates a query string from an object.
 */
export const objToQueryString = (params: any) => {
  return Object.keys(params)
    .map((key) => (!isEmpty(params[key]) ? key + '=' + params[key] : null))
    .filter((param) => param !== null)
    .join('&')
}

/**
 * Transforms a time value in milliseconds into a formatted string.
 * - If the value is greater than 1000ms, converts it to seconds,
 *   rounds to 3 decimal places, and removes any trailing zeros.
 * - Otherwise, returns the input in milliseconds.
 *
 * @param milliseconds - The time value in milliseconds.
 * @returns A formatted string with the appropriate unit.
 */
export function formatTime(milliseconds: number): string {
  if (milliseconds > 1000) {
    const seconds = milliseconds / 1000
    // Use toFixed(3) to round to 3 decimals and then parseFloat to remove trailing zeros.
    return `${parseFloat(seconds.toFixed(3))}s`
  } else {
    return `${milliseconds}ms`
  }
}
