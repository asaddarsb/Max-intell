module.exports = {
  content: ['./**/*.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        'brand-red': '#DC2626',
        'brand-dark': '#111827',
        'brand-gray': {
          '100': '#F3F4F6',
          '200': '#E5E7EB',
          '500': '#6B7280',
          '700': '#374151'
        },
        primary: '#DC2626',
        secondary: '#991B1B',
        dark: '#1F2937',
        light: '#F9FAFB'
      }
    }
  },
  plugins: []
}
