/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        'light-green-50': '#F0FDF4',
        accent: {
          soft: '#E4EFD2',
          DEFAULT: '#2F6A3A',
          strong: '#24543A',
        },
      },
      fontFamily: {
        sans: ['Inter Tight', 'Roboto', 'Noto Nastaliq Urdu', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      keyframes: {
        'fade-slide': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-slide': 'fade-slide 0.4s ease-out both',
      },
    },
  },
}
