export const isMac =
  typeof window !== 'undefined'
    ? navigator.userAgent.toUpperCase().indexOf('MAC') >= 0
    : false

export const getAbsoluteURL = (path = '') => {
  const baseURL =
    process.env.NODE_ENV === 'production'
      ? 'https://cairovm.codes'
      : 'http://localhost:3000'
  return baseURL + path
}
