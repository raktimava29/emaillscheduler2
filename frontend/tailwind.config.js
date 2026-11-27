export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101A4D",
        cobalt: { DEFAULT: "#2B45E0", dark: "#1D31B5" },
        sky: "#EAF0FF",
        sun: "#FFC933",
        coral: { DEFAULT: "#D92D3F", light: "#FDECEE" },
        mint: { DEFAULT: "#0B7A59", light: "#DDF5EC" },
        slate2: "#55608A",
        line: "#CBD6F5",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ["Figtree", "system-ui", "sans-serif"],
      },
      keyframes: {
        rise: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "none" } },
        stamp: { "0%": { opacity: "0", transform: "scale(2) rotate(-30deg)" }, "100%": { opacity: "1", transform: "scale(1) rotate(-12deg)" } },
        fly: { "0%": { transform: "translate(-30vw, 15vh) rotate(0deg) scale(.8)", opacity: "0" }, "20%": { opacity: "1" }, "100%": { transform: "translate(60vw, -55vh) rotate(8deg) scale(1.2)", opacity: "0" } },
        hover: { "0%,100%": { transform: "translateY(0) rotate(-4deg)" }, "50%": { transform: "translateY(-10px) rotate(4deg)" } },
      },
      animation: {
        rise: "rise .35s ease-out both",
        stamp: "stamp .45s cubic-bezier(.2,1.4,.4,1) .2s both",
        fly: "fly 1.1s cubic-bezier(.4,0,.6,1) both",
        hover: "hover 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
