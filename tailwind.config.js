// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
   safelist: [
    'bg-sage-400','bg-sage-500','hover:bg-sage-700','shadow-sage-600/40'
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F5F7F5',   // Light background
          100: '#F0F2F0',
          200: '#C8D5C8',  // Muted sage
          300: '#A8B9A8',
          400: '#8A9A8B',  // Primary sage
          500: '#7A8A7B',
          600: '#6B7D6B',  // Dark sage
          700: '#5A6A5B',
          900: '#3A4A3B'   // Very dark sage
        },
        gray: {
          700: '#4A5568',  // Dark mode secondary text
          800: '#2D3748',  // Dark mode background
          900: '#1A202C'   // Dark mode surface
        },
        blue: {
          500: '#4299E1',  // Primary blue
          600: '#3182CE',  // Darker blue for hover states
          700: '#2B6CB0'   // Even darker blue for active states
        }

      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'] // Your preferred font
      },
      animation: {
        'typing': 'typing 3.5s steps(40, end), blink .75s step-end infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' }
        },
        blink: {
          'from, to': { 'border-color': 'transparent' },
          '50%': { 'border-color': 'currentColor' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [
    // Add any plugins you need (e.g., forms, typography)
    require('@tailwindcss/forms'),
  ],
  darkMode: 'class', // Enables class-based dark mode
}