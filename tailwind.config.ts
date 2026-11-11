import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primarios (Azul tecnológico)
        primary: "#adc6ff",
        "primary-container": "#4d8eff",
        "on-primary": "#002e6a",

        // Secundarios (Naranja energético)
        secondary: "#ffb690",
        "secondary-container": "#ec6a06",
        "on-secondary": "#552100",

        // Superficies (Fondos oscuros)
        surface: "#0e1321",
        "surface-container": "#1a1f2e",
        "surface-container-low": "#161b2a",
        "surface-container-lowest": "#090e1c",
        "surface-container-high": "#252a39",
        "surface-variant": "#303444",

        // Textos y Bordes
        "on-surface": "#dee2f6",
        "on-surface-variant": "#c2c6d6",
        outline: "#8c909f",
        "outline-variant": "#424754",

        // Estados
        error: "#ffb4ab",
        "error-container": "#93000a",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["Inter", "monospace"], // Para datos numéricos (precios, IDs)
      },
      boxShadow: {
        "glow-primary": "0 0 16px rgba(77, 142, 255, 0.25)",
        "glow-secondary": "0 0 8px rgba(236, 106, 6, 0.6)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
