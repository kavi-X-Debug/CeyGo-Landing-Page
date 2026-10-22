/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: '#04201D',
        panel: '#0B2E2B',
        hover: '#134E4A',
        teal: { DEFAULT: '#0F766E', deep: '#0D5F59' },
        mint: '#5EEAD4',
        paper: '#F5F7F6',
        line: '#E3E8E6',
        ink: '#0F1A19',
        muted: '#5B6B68',
        ok: '#15803D',
        warn: '#B45309',
        bad: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
      maxWidth: {
        site: '1280px',
      },
    },
  },
  plugins: [],
};
