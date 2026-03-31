/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── TheDoctors.Ai Brand Colors ──
        primary: {
          DEFAULT: '#5CE1E6',
          dark:    '#3ABFC4',
          darker:  '#2A9EA3',
          light:   '#F0FEFF',
          mid:     '#A8F0F2',
        },
        accent: {
          DEFAULT: '#F54858',
          dark:    '#D93344',
          light:   '#FFF0F1',
        },
        // ── Neutral ──
        surface: {
          DEFAULT: '#FFFFFF',
          2:       '#F8FAFB',
        },
        border: {
          DEFAULT: '#E4EAF0',
          2:       '#CBD5E1',
        },
        // ── Status ──
        success: {
          DEFAULT: '#059669',
          light:   '#ECFDF5',
        },
        warning: {
          DEFAULT: '#D97706',
          light:   '#FFFBEB',
        },
        danger: {
          DEFAULT: '#DC2626',
          light:   '#FEF2F2',
        },
        info: {
          DEFAULT: '#2563EB',
          light:   '#EFF6FF',
        },
        purple: {
          DEFAULT: '#7C3AED',
          light:   '#F5F3FF',
        },
      },
      fontFamily: {
        sans: ['League Spartan', 'sans-serif'],
        display: ['League Spartan', 'sans-serif'],
      },
      fontSize: {
        'xs':  ['11px', { lineHeight: '1.4' }],
        'sm':  ['12px', { lineHeight: '1.5' }],
        'base':['13px', { lineHeight: '1.5' }],
        'md':  ['14px', { lineHeight: '1.6' }],
        'lg':  ['16px', { lineHeight: '1.5' }],
        'xl':  ['18px', { lineHeight: '1.4' }],
        '2xl': ['22px', { lineHeight: '1.3' }],
        '3xl': ['28px', { lineHeight: '1.2' }],
      },
      boxShadow: {
        'xs':  '0 1px 2px rgba(0,0,0,0.05)',
        'sm':  '0 2px 8px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
        'md':  '0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
        'lg':  '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
      },
      animation: {
        'fade-up':     'fadeUp 0.25s ease both',
        'pulse-ring':  'pulseRing 1.4s ease-out infinite',
        'blink':       'blink 1s ease-in-out infinite',
        'slide-in':    'slideIn 0.3s ease',
        'spin-slow':   'spin 0.8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(8px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%':   { boxShadow: '0 0 0 0 rgba(92,225,230,0.4)' },
          '70%':  { boxShadow: '0 0 0 10px rgba(92,225,230,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(92,225,230,0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.2' },
        },
        slideIn: {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to':   { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
