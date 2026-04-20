import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#09090b',
        dark: '#0f0f12',
        panel: '#151518',
        'panel-light': '#1c1c21',
        border: '#2a2a32',
        gold: {
          DEFAULT: '#c8922a',
          light: '#e8aa40',
          dim: '#7a5618',
        },
        green: {
          DEFAULT: '#3eb85a',
          dim: '#1e5c2c',
        },
        blue: {
          DEFAULT: '#4a9de0',
          dim: '#1e3f5c',
        },
        red: {
          DEFAULT: '#b83232',
          dim: '#5c1818',
        },
        amber: {
          DEFAULT: '#d4880a',
          dim: '#6b4405',
        },
        text: {
          primary: '#e8e8ee',
          secondary: '#9090a0',
          muted: '#606070',
        },
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        nav: ['Barlow Condensed', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      animation: {
        'pulse-dot': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
