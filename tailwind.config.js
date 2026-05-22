/** @type {import('tailwindcss').Config} */
const colorTokens = require('./src/presentation/theme/color-tokens.js');

module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: colorTokens,
    },
  },
};
