/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 廟宇色系
        temple: {
          red: '#C0392B',
          'red-dark': '#922B21',
          'red-light': '#E74C3C',
          gold: '#D4AC0D',
          'gold-light': '#F1C40F',
          'gold-dark': '#B7950B',
          cream: '#FFF8E7',
          'cream-dark': '#FAF0D7',
          dark: '#2C1810',
          brown: '#6E2F1A',
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
