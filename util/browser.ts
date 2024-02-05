export const isMac =
  typeof window !== 'undefined'
    ? navigator.userAgent.toUpperCase().indexOf('MAC') >= 0
    : false

export const getAbsoluteURL = (path = '') => {
  const baseURL =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000'
  return baseURL + path
}
