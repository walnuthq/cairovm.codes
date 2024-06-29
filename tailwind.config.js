module.exports = {
  darkMode: 'class', // or 'media' or 'class'
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      serif: ['Inter', 'sans-serif'],
      sans: ['Inter', 'sans-serif'],
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;',
      'ibm-plex-sans': ['IBM Plex Sans', 'sans-serif'],
    },
    extend: {
      fontSize: {
        '2xs': '10px',
        tiny: '13px',
        '2base': '16px',
      },
      colors: {
        black: {
          900: '#000000',
          800: '#080808',
          700: '#101111',
          600: '#141515',
          500: '#1B1B1B',
          400: '#2F2F2F',
        },
        icons: '#E85733',
        darkMode: {
          primary: '#0F0E0F',
          secondary: '#1C1E22',
          icons: '#CACBD4',
          text: '#EEEEEE',
        },
      },
    },
  },
  plugins: [],
}
