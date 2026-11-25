/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nl-bg': '#0F1117',
        'nl-card': '#1A1D27',
        'nl-primary': '#3B82F6',
        'nl-success': '#10B981',
        'nl-danger': '#EF4444',
        'nl-warning': '#F59E0B',
        'nl-border': '#2D3748',
        'nl-text': '#E5E7EB',
        'nl-muted': '#9CA3AF',
        'nl-input': '#252830',
      },
    },
  },
  plugins: [],
};
