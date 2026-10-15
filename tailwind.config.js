/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcd9ff',
          300: '#8ec2ff',
          400: '#58a0ff',
          500: '#317cf9',
          600: '#1b5eed',
          700: '#1548db',
          800: '#173bb2',
          900: '#19368c',
          950: '#122255',
        },
        slate: {
          850: '#151d2e',
          925: '#0b1120',
          975: '#060a12',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        emerald: {
          450: '#10b981',
          550: '#059669',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(49, 124, 249, 0.3)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
      }
    },
  },
  plugins: [],
}
