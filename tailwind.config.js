/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        surface: {
          DEFAULT: "#f1f0ee",
          card:    "#ebebea",
          input:   "#e8e7e5",
          hover:   "#e3e2e0",
          border:  "#d5d3d0",
        },
        ink: {
          DEFAULT: "#1a1917",
          muted:   "#6b6963",
          faint:   "#9e9b97",
        },
        accent: {
          DEFAULT: "#d97706",
          hover:   "#b45309",
          light:   "#fef3c7",
        },
      },
      keyframes: {
        fadeUp:    { from: { opacity: 0, transform: "translateY(10px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        pulse_dot: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
        scan_line: { from: { transform: "translateY(-100%)" }, to: { transform: "translateY(100vh)" } },
      },
      animation: {
        fadeUp:    "fadeUp 0.35s ease-out both",
        fadeIn:    "fadeIn 0.25s ease-out both",
        pulse_dot: "pulse_dot 1.4s ease-in-out infinite",
        scan_line: "scan_line 3s linear infinite",
      },
    },
  },
  plugins: [],
}
