export const GITHUB_REPO_URL = 'https://github.com/walnuthq/cairovm.codes'

// Currently active hardfork from the ones available:
// See: https://github.com/ethereumjs/ethereumjs-monorepo/tree/master/packages/common/src/hardforks
export const CURRENT_FORK = 'shanghai'

export const FORKS_WITH_TIMESTAMPS: { [name: string]: number } = {
  shanghai: 1681338455,
}

export const CAIRO_VM_API_URL =
  process.env.NEXT_PUBLIC_CAIRO_VM_API_URL || 'ws://api2.cairovm.codes/ws'
