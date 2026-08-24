/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Charte DABA officielle — utilisée comme ACCENTS uniquement
        // (jamais en fond de carte, jamais en block massif)
        brand: {
          // Couleurs principales (conservées pour rétro-compatibilité)
          green: "#42B649",
          blue: "#244A9B",
          red: "#E11D2E",
          // Nuances DABA précisées dans la refonte UI
          'green-daba': "#3CAF50",
          'blue-daba': "#036EB1",
          'red-daba': "#AE151E",
          // Surfaces neutres
          white: "#FFFFFF",
          text: "#1F2937",
          light: "#F8F8F8",
        },
        // Tokens sémantiques pour le mode clair ERP premium
        surface: {
          page: "#F5F7FA",        // fond de page
          card: "#FFFFFF",        // cartes
          subtle: "#F8FAFC",      // fonds secondaires (headers de tableau, etc.)
          border: "#E5E7EB",      // bordures fines
          hover: "#F1F5F9",       // hover discret
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Ombres discrètes — premium ERP, pas de halos colorés massifs
      boxShadow: {
        'card': '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.06)',
        'card-hover': '0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.05)',
        'sidebar': '1px 0 0 0 #E5E7EB',
        'header': '0 1px 0 0 #E5E7EB',
      },
      // Animations subtiles
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'slide-in': 'slide-in 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
