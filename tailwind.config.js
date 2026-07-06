/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#D9668E',
          pinkDark: '#B94F76',
          pinkLight: '#F3D9E2',
          dark: '#1B1917',
          cream: '#FBF5EC',
          card: '#FFFFFF',
          ink: '#2B2420',
        },
        success: '#3F8A5D',
        danger: '#C0392B',
      },
      fontFamily: {
        sans: ['"Rubik"', 'system-ui', 'sans-serif'],
        display: ['"Rubik"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(43, 36, 32, 0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
