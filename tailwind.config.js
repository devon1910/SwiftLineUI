export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      ground: { DEFAULT: '#F5F4F0', dark: '#14161A' },
      surface: { DEFAULT: '#FFFFFF', dark: '#1C1F24' },
      ink: { DEFAULT: '#191A17', dark: '#F2F1EC' },
      'ink-soft': { DEFAULT: '#5C605A', dark: '#A8ACA4' },
      rule: { DEFAULT: '#D9D7CF', dark: '#2D3138' },
      live: { DEFAULT: '#698474', dark: '#8FAE98' },
      'live-ink': { DEFAULT: '#2E4636', dark: '#C3D8C9' },
      turn: { DEFAULT: '#C4571F', dark: '#E27A3E' },
    },
    fontFamily: {
      sans: ['IBM Plex Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
    },
  },
  plugins: [],
  darkMode: 'class',
};
