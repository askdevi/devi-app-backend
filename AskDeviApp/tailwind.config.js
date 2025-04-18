/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#220038',
        foreground: '#ffffff',
        primary: '#8b5cf6',
        secondary: '#e5e7eb',
        muted: '#6b7280',
      },
      animation: {
        twinkle: 'twinkle 3s infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: 0, transform: 'scale(0.5) rotate(0deg)' },
          '50%': { opacity: 1, transform: 'scale(1) rotate(180deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
