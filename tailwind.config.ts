import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // VMP Color Palette
        primary: '#22574A',      // Deep Forest Green
        secondary: '#E8DCCA',    // Warm Beige
        accent: '#D96E49',       // Terracotta Orange
        background: '#FCFBF9',   // Off White
        text: '#555555',         // Charcoal Gray
        // Design reference compatibility
        'design-primary': '#1173d4',
        'design-background-light': '#f6f7f8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
      }
    },
  },
  plugins: [],
}
export default config