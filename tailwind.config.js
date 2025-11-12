/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'slide-slow': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'slide-normal': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'slide-fast': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'fade-slow': {
          '0%': { opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'fade-normal': {
          '0%': { opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'fade-fast': {
          '0%': { opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '1' },
          '50%': { transform: 'translateY(-20px)', opacity: '1' },
        },
        'bounce-normal': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '1' },
          '50%': { transform: 'translateY(-20px)', opacity: '1' },
        },
        'bounce-fast': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '1' },
          '50%': { transform: 'translateY(-20px)', opacity: '1' },
        },
      },
      animation: {
        'slide-slow': 'slide-slow 3s ease-in-out infinite',
        'slide-normal': 'slide-normal 2s ease-in-out infinite',
        'slide-fast': 'slide-fast 1s ease-in-out infinite',
        'fade-slow': 'fade-slow 3s ease-in-out infinite',
        'fade-normal': 'fade-normal 2s ease-in-out infinite',
        'fade-fast': 'fade-fast 1s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
        'bounce-normal': 'bounce-normal 2s ease-in-out infinite',
        'bounce-fast': 'bounce-fast 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
