/** @type {import('tailwindcss').Config} */

const ink = {
  25: '#fcfcfc',
  50: '#fafaf9',
  100: '#f5f5f4',
  200: '#e7e5e4',
  300: '#d6d3d1',
  400: '#a8a29e',
  500: '#78716c',
  600: '#57534e',
  700: '#44403c',
  800: '#292524',
  900: '#1c1917',
  950: '#0c0a09',
};

const electric = {
  50: '#fff8f5',
  100: '#ffefe8',
  200: '#ffdcd1',
  300: '#ffbfab',
  400: '#ff9470',
  500: '#ff6233',
  600: '#f04113',
  700: '#c72e0b',
  800: '#9e260e',
  900: '#7f2311',
};

const emerald = {
  50: '#e6fff4',
  100: '#c0ffe3',
  200: '#8bf9cc',
  300: '#55eeb1',
  400: '#24d694',
  500: '#12b97a',
  600: '#0a955f',
  700: '#067048',
  800: '#034c32',
  900: '#012b1d',
};

const amber = {
  50: '#fff7e8',
  100: '#ffeac2',
  200: '#ffd08a',
  300: '#ffb451',
  400: '#ff9724',
  500: '#f07408',
  600: '#c65803',
  700: '#964002',
  800: '#642a02',
  900: '#341501',
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Work Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Work Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.2' }],
        sm: ['0.85rem', { lineHeight: '1.35' }],
        base: ['1rem', { lineHeight: '1.5' }],
        lg: ['1.15rem', { lineHeight: '1.5' }],
        xl: ['1.35rem', { lineHeight: '1.3' }],
        '2xl': ['1.65rem', { lineHeight: '1.25' }],
        '3xl': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        '4xl': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        '5xl': ['3.25rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
      colors: {
        ink,
        electric,
        emerald,
        amber,
        brand: {
          DEFAULT: electric[500],
          subtle: electric[100],
          soft: electric[100],
          strong: electric[700],
        },
        surface: {
          DEFAULT: '#ffffff',
          alt: ink[50],
          raised: '#f9fbff',
          soft: '#f4f6fb',
        },
        border: {
          subtle: ink[100],
          muted: ink[200],
          bold: ink[400],
        },
        text: {
          primary: ink[900],
          muted: ink[600],
          faint: ink[400],
        },
        accent: {
          cyan: electric[500],
          lime: '#b5ff57',
          violet: '#9b8bff',
        },
        success: emerald[500],
        warning: amber[400],
        danger: '#f5576c',
      },
      spacing: {
        13: '3.25rem',
        15: '3.75rem',
        18: '4.5rem',
        22: '5.5rem',
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      boxShadow: {
        card: '0 20px 60px rgba(15, 23, 42, 0.08)',
        popover: '0 12px 40px rgba(15, 23, 42, 0.18)',
        elevated: '0 25px 80px rgba(15, 23, 42, 0.12)',
      },
      backgroundImage: {
        'grid-lines':
          'linear-gradient(90deg, rgba(23,26,39,0.04) 1px, transparent 1px), linear-gradient(180deg, rgba(23,26,39,0.04) 1px, transparent 1px)',
        'glow-radial':
          'radial-gradient(circle at 20% 20%, rgba(24,149,255,0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(155,139,255,0.25), transparent 40%)',
      },
      maxWidth: {
        shell: '78rem',
        prose: '60ch',
      },
      dropShadow: {
        glow: '0 15px 45px rgba(24,149,255,0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseBorder: {
          '0%': { boxShadow: '0 0 0 0 rgba(24,149,255,0.45)' },
          '70%': { boxShadow: '0 0 0 12px rgba(24,149,255,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(24,149,255,0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 300ms ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
        'pulse-border': 'pulseBorder 2.2s ease-out infinite',
      },
    },
  },
  plugins: [],
};
