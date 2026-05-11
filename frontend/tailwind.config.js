/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 廟宇色系（亮金色主調）
        temple: {
          green: '#EFBF04',
          'green-dark': '#C09600',
          'green-light': '#F5D040',
          gold: '#EFBF04',
          'gold-light': '#F5D040',
          'gold-dark': '#C09600',
          cream: '#F9F7F4',
          'cream-dark': '#EFEBE4',
          dark: '#1A1400',
          brown: '#907300',
        },
      },
      fontFamily: {
        // 使用 Google Fonts 的繁體中文字型
        sans: ['"Noto Sans TC"', 'sans-serif'],
        serif: ['"Noto Serif TC"', 'serif'],
      },
    },
  },
  plugins: [],
};
