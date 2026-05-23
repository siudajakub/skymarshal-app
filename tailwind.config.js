/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          bg: "#0B0F19",
          card: "rgba(15, 23, 42, 0.5)",
          border: "#1E293B",
          cyan: "#00F0FF",
          orange: "#FFB800",
          red: "#FF2E93",
          green: "#00E676",
        }
      }
    },
  },
  plugins: [],
}
