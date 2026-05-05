/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1A4D8F',
        navy:    '#0D2B5E',
        gold:    '#F5C518',
        bg:      '#F5F7FA',
        dark:    '#1A1A2E',
        muted:   '#6B7280',
        border:  '#E5E7EB',
      },
      fontFamily: { inter: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
}
