/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#F7F9FC',
        foreground: '#14213D',
        muted: '#4F5D75',
        accent: '#0F6EFD',
      },
    },
  },
};
