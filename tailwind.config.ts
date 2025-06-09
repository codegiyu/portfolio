/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './layout/**/*.{ts,tsx}',
    './sections/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    screens: {
      xs: '450px',
      sm: '625px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    container: {
      padding: {
        DEFAULT: '1.125rem',
        xs: '1.5rem',
        sm: '2rem',
        md: '3rem',
        lg: '2rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      center: true,
    },
    extend: {
      colors: {
        darkBg: '#15161B',
        dark: '#1E1F23',
        darkOpaque: '#00000099',
        light: '#fafafa',
        red: '#C81313',
        ash: '#666874',
        darkAsh: '#66687442',
      },
      boxShadow: {
        profile: '0 4px 20px rgba(255, 252, 252, 0.25)',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        lobster: ['Lobster', 'cursive'],
      },
      animation: {
        rebound: 'spring 10s ease-in-out infinite',
      },
      keyframes: {
        spring: {
          '0%, 100%': {
            transform: 'translateX(-95%)',
          },
          '50%': {
            transform: 'translateX(245%)',
          },
        },
      },
      spacing: {
        textarea: 'calc(100% - 24px)',
        projectHalf: 'calc(50% - 2rem)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide'), require('tailwindcss-animate')],
} satisfies Config;

export default config;
