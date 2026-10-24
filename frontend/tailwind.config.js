/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#e83f63',
          600: '#d72d52',
          700: '#b91f43'
        }
      },
      borderRadius: {
        lg: '8px',
        xl: '8px',
        '2xl': '10px'
      }
    }
  },
  plugins: []
};
