const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './docs/**/*.{js,ts,jsx,tsx,mdx}', 
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Added src directory
  ],
  darkMode: 'media', // 'media' or 'class'
  theme: {
    // https://fonts.google.com/specimen/Source+Sans+Pro?query=Source&sidebar.open=true&selection.family=Montserrat:wght@700;900|Source+Sans+Pro
    fontFamily: {
      display: ['Montserrat', 'sans-serif'],
      body: ['Source Sans Pro', 'sans-serif'],
    },
    extend: {
      colors: {
        gray: colors.slate,
        hero: {
          DEFAULT: '#592340',
          lighter: '#FC9CC3',
        },
      },
      ringOffsetColor: {
        'rsbs-bg': 'var(--rsbs-bg)',
      },
      transitionDuration: {
        0: '0ms',
      },
    },
  },
  // Removed deprecated variants section - JIT mode handles this automatically in Tailwind 3.x
  plugins: [require('@tailwindcss/forms')],
}
