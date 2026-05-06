/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 廟宇色系（仿承天禪寺風格：深綠 + 金色 + 淡米白）
        temple: {
          green: '#2E6B1A',
          'green-dark': '#1F4D10',
          'green-light': '#4A8A2F',
          gold: '#C8A014',
          'gold-light': '#D4B830',
          'gold-dark': '#A88810',
          cream: '#F9F7F4',
          'cream-dark': '#EFEBE4',
          dark: '#1A2E0E',
          brown: '#3D5E28',
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
