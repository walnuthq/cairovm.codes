import { BN } from 'bn.js'
import { IInstruction, IReferenceItem } from 'types'

// Version here: https://github.com/ethereum/solc-bin/blob/gh-pages/bin/list.txt
export const compilerSemVer = 'v0.8.19'
export const compilerVersion = `soljson-${compilerSemVer}+commit.7dd6d404`

/**
 * Gets target EVM version from a hardfork name
 *
 * @param forkName The String harffork name
 * @returns The String matching target EVM version
 * @see https://docs.soliditylang.org/en/v0.8.15/using-the-compiler.html#target-options
 */
export const getTargetEvmVersion = (forkName: string | undefined) => {
  if (forkName === 'dao') {
    return 'homestead'
  }
  if (forkName === 'muirGlacier') {
    return 'berlin'
  }
  if (
    forkName &&
    ['arrowGlacier', 'grayGlacier', 'merge', 'shanghai'].includes(forkName)
  ) {
    return 'london'
  }
  return forkName
}

function toHexString(number: string, byteSize: number): string {
  let parsedNumber = null

  if (number.startsWith('0x') || number.startsWith('0X')) {
    if (!/^(0x|0X)[0-9a-fA-F]+$/.test(number)) {
      throw new Error('Not a valid hexadecimal number: ' + number)
    }

    parsedNumber = new BN(number.substring(2), 'hex')
  } else {
    if (!/^[0-9]+$/.test(number)) {
      throw new Error('Not a valid decimal number: ' + number)
    }

    parsedNumber = new BN(number)
  }

  if (parsedNumber.byteLength() > byteSize) {
    throw new Error('Value is too big for ' + byteSize + ' byte(s): ' + number)
  }

  return parsedNumber.toString('hex', byteSize * 2)
}

/**
 * Gets bytecode from mnemonic
 *
 * @param code The string code
 * @param opcodes The IReferenceItem array of opcodes
 * @returns The string bytecode
 */
export const getBytecodeFromMnemonic = (
  code: string,
  opcodes: IReferenceItem[],
) => {
  let bytecode = ''
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i]
      .replace(/\/\/.*/, '')
      .trim()
      .toUpperCase()

    if (line.length === 0) {
      continue
    }

    if (line !== 'PUSH0' && line.startsWith('PUSH')) {
      const parts = line.split(/\s+/)

      if (parts.length !== 2) {
        throw new Error('Expect PUSH instruction followed by a number: ' + line)
      }

      const code = opcodes.find((opcode: IReferenceItem) => {
        return opcode.name === parts[0]
      })

      if (typeof code === 'undefined') {
        throw new Error('Unknown mnemonic: ' + parts[0])
      }

      const number = parseInt(parts[0].substring(4))
      bytecode += code.opcodeOrAddress + toHexString(parts[1], number)
    } else {
      const code = opcodes.find((opcode: IReferenceItem) => {
        return opcode.name === line
      })
      if (typeof code === 'undefined') {
        throw new Error('Unknown mnemonic: ' + line)
      }

      bytecode += code.opcodeOrAddress
    }
  }

  return bytecode
}

/**
 * Gets mnemonic from instructions
 * @param instructions The IInstruction array of current instructions
 * @param opcodes The IReferenceItem array of opcodes
 * @returns the mnemonic code
 */
export const getMnemonicFromBytecode = (
  instructions: IInstruction[],
  opcodes: IReferenceItem[],
): string => {
  if (instructions.length === 0) {
    return ''
  }

  const opcodeMap: Record<string, string> = {}
  opcodes.forEach((c) => {
    opcodeMap[c.name as string] = c.opcodeOrAddress
  })

  return instructions
    .map((i) => `${opcodeMap[i.name]}${i.value || ''}`)
    .join('')
}

/**
 * Get the editable bytecode lines from the instructions
 * @param instructions The IInstruction array of current instructions
 * @returns the editable bytecode lines
 */
export const getBytecodeLinesFromInstructions = (
  instructions: IInstruction[],
): string => {
  if (instructions.length === 0) {
    return ''
  }

  return instructions
    .map((i) => `${i.name}${i.value ? ' 0x' + i.value : ''}`)
    .join('\n')
}

export const isPositiveInteger = (value: string): boolean =>
  /^[0-9]+$/.test(value)

// on the back-end side, a felt252 is decoded from a decimal value stored in the string.
// That means, short string or hexadecimal value are not supported.
export const isValidFelt252 = (value: string): boolean => {
  if (!isPositiveInteger(value)) {
    return false
  }

  const bnValue = new BN(value)
  const minFeltValue = new BN('0')
  const maxFeltValue = new BN(
    '3618502788666131213697322783095070105623107215331596699973092056135872020480',
  )

  return bnValue.gte(minFeltValue) && bnValue.lte(maxFeltValue)
}

// check if a program arguments string is valid.
// this string should contain a list of arguments separated by a space.
// an argument could be:
//  - a felt252 decimal value
//  - an array of felt252 where every values are separated by a space.
export const isArgumentStringValid = (value: string) => {
  if (value.length === 0) {
    return true
  }

  const items = value.split(' ')
  let index = 0

  while (index < items.length) {
    if (items[index].startsWith('[')) {
      // special case of empty or one-element array
      if (items[index].endsWith(']')) {
        const x = items[index].slice(1, -1)
        if (x.length > 0 && !isValidFelt252(x)) {
          return false
        }
      } else {
        // multi-element array
        let endOfArray = index + 1
        while (endOfArray < items.length && !items[endOfArray].endsWith(']')) {
          endOfArray += 1
        }
        if (endOfArray >= items.length) {
          return false
        }

        const arrayValues = [
          items[index].slice(1), // the first value without the [
          ...items.slice(index + 1, endOfArray),
          items[endOfArray].slice(0, -1), // the last value without the ]
        ]
        if (!arrayValues.every((x) => isValidFelt252(x))) {
          return false
        }

        index = endOfArray + 1
        continue
      }
    } else if (!isValidFelt252(items[index])) {
      return false
    }

    index += 1
  }

  return true
}
