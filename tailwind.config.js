/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f9a8d4',
          light: '#fbcfe8',
          dark: '#f472b6',
        },
        secondary: {
          DEFAULT: '#a5f3fc',
          light: '#cffafe',
          dark: '#38bdf8',
        },
        success: '#5eead4',
        warning: '#fcd34d',
        info: '#7dd3fc',
        danger: '#fb7185',
      },
    },
  },
  plugins: [],
}
