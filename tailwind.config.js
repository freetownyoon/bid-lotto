/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lotto: {
          yellow: '#f1c40f',
          blue: '#3498db',
          red: '#e74c3c',
          gray: '#95a5a6',
          green: '#2ecc71',
        }
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
