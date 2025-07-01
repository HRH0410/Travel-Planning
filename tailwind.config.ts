/** @type {import('tailwindcss').Config} */
import { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 老人模式专用字体大小
      fontSize: {
        'elder-sm': ['16px', '24px'],
        'elder-base': ['20px', '30px'],
        'elder-lg': ['24px', '36px'],
        'elder-xl': ['28px', '42px'],
        'elder-2xl': ['32px', '48px'],
        'elder-3xl': ['36px', '54px'],
      },
      // 老人模式专用间距
      spacing: {
        'elder-1': '6px',
        'elder-2': '12px',
        'elder-3': '18px',
        'elder-4': '24px',
        'elder-5': '30px',
        'elder-6': '36px',
        'elder-8': '48px',
        'elder-10': '60px',
        'elder-12': '72px',
      },
      // 老人模式专用颜色（高对比度）
      colors: {
        elder: {
          primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#2563eb',
            600: '#1d4ed8',
            700: '#1e40af',
            800: '#1e3a8a',
            900: '#1e2e7b',
          },
          gray: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#a3a3a3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
          },
          success: {
            50: '#f0fdf4',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
          },
          warning: {
            50: '#fffbeb',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
          },
          error: {
            50: '#fef2f2',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
          }
        }
      },
      // 老人模式专用动画
      animation: {
        'elder-pulse': 'elder-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'elder-bounce': 'elder-bounce 1s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        'elder-pulse': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '.7',
          },
        },
        'elder-bounce': {
          '0%, 100%': {
            transform: 'translateY(0)',
            'animation-timing-function': 'cubic-bezier(0.8,0,1,1)',
          },
          '50%': {
            transform: 'translateY(-5px)',
            'animation-timing-function': 'cubic-bezier(0,0,0.2,1)',
          },
        },
      },
      // 老人模式专用阴影
      boxShadow: {
        'elder-sm': '0 2px 4px 0 rgba(0, 0, 0, 0.15)',
        'elder': '0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        'elder-md': '0 6px 12px -2px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        'elder-lg': '0 12px 24px -4px rgba(0, 0, 0, 0.15), 0 6px 12px -4px rgba(0, 0, 0, 0.1)',
      },
    },
  },
} satisfies Config
