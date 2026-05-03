import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1a1410',
          soft: '#2d2520',
        },
        bone: {
          DEFAULT: '#f4eee2',
          2: '#ebe2ce',
        },
        paper: '#fbf7ee',
        oxblood: {
          DEFAULT: '#6b1a1a',
          deep: '#4a0f0f',
          light: '#a82e2e',
        },
        gold: {
          DEFAULT: '#a87a3c',
          bright: '#d4a13c',
        },
        'legal-pad': '#fff8c5',
        muted: {
          DEFAULT: '#6b5e52',
          2: '#8a7d6f',
        },
        green: {
          DEFAULT: '#2d4a2b',
          bright: '#5fbf60',
        },
        amber: '#e3b85f',
        red: '#e07b6a',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter Tight', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(48px, 7vw, 108px)', { lineHeight: '0.93', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(44px, 6.2vw, 82px)', { lineHeight: '0.97', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(36px, 4.5vw, 58px)', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(32px, 4.2vw, 48px)', { lineHeight: '1.05', letterSpacing: '-0.015em' }],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'legal-rules': 'repeating-linear-gradient(0deg, transparent 0, transparent 31px, rgba(168, 122, 60, 0.07) 31px, rgba(168, 122, 60, 0.07) 32px)',
      },
    },
  },
  plugins: [],
};

export default config;
