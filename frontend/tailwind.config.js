/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080B12",
        surface: "#111722",
        surfaceHover: "#151B27",
        primary: "#3B82F6", // electric blue
        positive: "#10B981", // green
        negative: "#EF4444", // red
        warning: "#F59E0B", // amber
        muted: "#94A3B8", // gray-blue
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
