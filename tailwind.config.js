/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // Canvas & Surface Colors
        canvas: {
          DEFAULT: '#0D1117',
          light: '#161B22',
        },
        surface: {
          primary: '#161B22',
          secondary: '#21262D',
          tertiary: '#30363D',
        },
        
        // Accent Colors
        accent: {
          primary: '#58A6FF',
          secondary: '#8B949E',
          success: '#3FB950',
          error: '#F85149',
          warning: '#D29922',
          info: '#79C0FF',
        },
        
        // Typography Colors
        text: {
          primary: '#E6EDF3',
          secondary: '#8B949E',
          tertiary: '#6E7681',
          inverse: '#0D1117',
        },
        
        // Syntax Highlighting Colors
        syntax: {
          keys: '#79C0FF',
          strings: '#A5D6FF',
          numbers: '#79C0FF',
          booleans: '#FF7B72',
          null: '#FF7B72',
          brackets: '#E6EDF3',
          operators: '#8B949E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display': ['28px', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading-1': ['24px', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading-2': ['20px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-3': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['15px', { lineHeight: '1.6' }],
        'body': ['14px', { lineHeight: '1.5' }],
        'body-sm': ['13px', { lineHeight: '1.4' }],
        'caption': ['12px', { lineHeight: '1.3', letterSpacing: '0.02em' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },
      borderRadius: {
        'button': '6px',
        'card': '12px',
        'toggle': '12px',
        'input': '8px',
      },
      transitionDuration: {
        'fast': '100ms',
        'standard': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(88, 166, 255, 0.15)',
        'glow-error': '0 0 20px rgba(248, 81, 73, 0.15)',
        'glow-success': '0 0 20px rgba(63, 185, 80, 0.15)',
      },
    },
  },
  plugins: [],
};
