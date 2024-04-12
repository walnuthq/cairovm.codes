import clsx, { ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

import { theme } from '../tailwind.config'

const { fontSize } = theme.extend

// Reference: https://github.com/dcastil/tailwind-merge/blob/v2.2.0/docs/configuration.md
// extendTailwindMerge to avoid removing ambiguous classNames
// For example: font-size `text-tiny` and color `text-white`
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': Object.keys(fontSize).map((key) => `text-${key}`),
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
