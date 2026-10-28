/** @type {import('tailwindcss').Config} */
// Channel-based tokens defined in src/styles/index.css (light + .dark) so opacity modifiers work.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: token('primary'),
          hover: token('primary-hover'),
          active: token('primary-active'),
          light: token('primary-light'),
          subtle: token('primary-subtle'),
          foreground: token('primary-foreground')
        },
        success: { DEFAULT: token('success'), bg: token('success-bg') },
        warning: { DEFAULT: token('warning'), bg: token('warning-bg') },
        error: { DEFAULT: token('error'), bg: token('error-bg') },
        info: { DEFAULT: token('info'), bg: token('info-bg') }
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
