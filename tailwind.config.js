module.exports = {
  content: [
    './public/**/*.html',
    './public/assets/js/**/*.js',
    './admin/**/*.html',
    './admin/assets/js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3f0050',
        accent: '#ff9de6',
        bg: '#1a0d20'
      },
      fontFamily: {
        display: ['Changa', 'system-ui', 'sans-serif'],
        sans: ['Noto Sans Arabic', 'system-ui', 'sans-serif'],
        brand: ['Changa', 'serif']
      },
      boxShadow: {
        'soft': '0 4px 24px -4px rgba(255,157,230,0.25)'
      }
    }
  },
  plugins: []
};
