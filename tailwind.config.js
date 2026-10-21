/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          ink: "#0a0a0c",       // Deep abyss black
          surface: "#121216",   // Slate card surface
          elevated: "#18181f",  // Raised component surface
          border: "#27272a",    // Subtle hairline border
          chalk: "#f4f4f5",     // Pure stark text
          muted: "#71717a",     // De-emphasized secondary text
          dim: "#3f3f46",       // Disabled/grid lines
        },
        hazard: {
          DEFAULT: "#facc15",   // Phosphorus Yellow / Amber Accent
          dim: "#ca8a04",       // Amber secondary
          glow: "rgba(250, 204, 21, 0.15)", // Diegetic backlight
        },
        crisis: {
          DEFAULT: "#ef4444",   // Interrupt consequence red
          glow: "rgba(239, 68, 68, 0.2)",
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'Courier New', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'hazard-glow': '0 0 15px rgba(250, 204, 21, 0.25)',
        'slate-bevel': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 20px 40px rgba(0, 0, 0, 0.8)',
      }
    },
  },
  plugins: [],
}
