/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#F8F6EF',
          cream: '#F8F6EF',
          linen: '#FFFDF8',
        },
        primary: {
          DEFAULT: '#124B3A', // Deep Pine Forest
          hover: '#0E3C2E',
          dark: '#0A2D22',
          light: '#1B5D49',
        },
        secondary: {
          DEFAULT: '#1F7A5A', // Rich Emerald / Sage Teal
          hover: '#18644A',
          light: '#2CA077',
          subtle: '#E8F3EE',
        },
        accent: {
          DEFAULT: '#E76F51', // Warm Terracotta / Coral
          hover: '#D45B3D',
          light: '#F48C71',
          subtle: '#FDF0EC',
        },
        highlight: {
          DEFAULT: '#E9A23B', // Warm Amber / Ochre Gold
          hover: '#D48E28',
          light: '#F3B964',
          subtle: '#FCF5E9',
        },
        text: {
          DEFAULT: '#17221C', // Deep charcoal green
          dark: '#17221C',
          muted: '#65736B', // Muted sage grey
          light: '#8E9E95',
        },
        card: {
          DEFAULT: '#FFFFFF',
          soft: '#FDFCFA',
        },
        border: {
          DEFAULT: '#DDE5DC',
          muted: '#E7EEE6',
          strong: '#C8D4C7',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(18, 75, 58, 0.05), 0 1px 2px rgba(18, 75, 58, 0.03)',
        'warm-md': '0 4px 12px rgba(18, 75, 58, 0.06), 0 2px 4px rgba(18, 75, 58, 0.03)',
        'warm-lg': '0 12px 28px rgba(18, 75, 58, 0.08), 0 4px 10px rgba(18, 75, 58, 0.04)',
        'warm-xl': '0 20px 40px rgba(18, 75, 58, 0.1), 0 6px 16px rgba(18, 75, 58, 0.05)',
        'accent-glow': '0 0 20px rgba(231, 111, 81, 0.25)',
        'emerald-glow': '0 0 24px rgba(31, 122, 90, 0.22)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
