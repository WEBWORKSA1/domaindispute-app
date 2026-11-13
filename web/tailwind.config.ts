import type { Config } from 'tailwindcss';

/**
 * Design tokens - "docket & registry".
 * Token names are kept from v1 so every existing page re-skins consistently:
 *   ink      = registry navy (text, dark bands)
 *   paper    = page surface
 *   bone     = quiet panel surface
 *   oxblood  = docket-seal red (primary action, filing stamp) - used sparingly
 *   gold     = registry teal (links, data accents)
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#12233b',
          soft: '#2c3e57',
        },
        bone: {
          DEFAULT: '#eef2f6',
          2: '#d9e1ea',
        },
        paper: '#ffffff',
        oxblood: {
          DEFAULT: '#b42318',
          deep: '#8f1b12',
          light: '#d9483b',
        },
        gold: {
          DEFAULT: '#1f6f8b',
          bright: '#6cc1dc',
        },
        'legal-pad': '#fff6d5',
        muted: {
          DEFAULT: '#556477',
          2: '#7b8a9c',
        },
        green: {
          DEFAULT: '#1d6b40',
          bright: '#3fa66b',
        },
        amber: '#b7791f',
        red: '#c4372b',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(42px, 6vw, 84px)', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(36px, 5vw, 64px)', { lineHeight: '1.04', letterSpacing: '-0.018em' }],
        'display-md': ['clamp(30px, 3.6vw, 46px)', { lineHeight: '1.08', letterSpacing: '-0.012em' }],
        'display-sm': ['clamp(26px, 3vw, 36px)', { lineHeight: '1.12', letterSpacing: '-0.01em' }],
      },
      maxWidth: {
        site: '1200px',
        prose: '68ch',
      },
      animation: {
        'pulse-slow': 'pulse 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
