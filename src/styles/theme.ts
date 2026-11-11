// src/styles/theme.ts
export const theme = {
  colors: {
    // Primarios
    primary: "#adc6ff",
    primaryContainer: "#4d8eff",
    onPrimary: "#002e6a",

    // Secundarios
    secondary: "#ffb690",
    secondaryContainer: "#ec6a06",
    onSecondary: "#552100",

    // Superficies
    surface: "#0e1321",
    surfaceContainer: "#1a1f2e",
    surfaceContainerLow: "#161b2a",
    surfaceContainerLowest: "#090e1c",
    surfaceContainerHigh: "#252a39",
    surfaceVariant: "#303444",

    // Textos
    onSurface: "#dee2f6",
    onSurfaceVariant: "#c2c6d6",
    outline: "#8c909f",
    outlineVariant: "#424754",

    // Estados
    error: "#ffb4ab",
    errorContainer: "#93000a",
  },

  shadows: {
    glowPrimary: "0 0 16px rgba(77, 142, 255, 0.25)",
    glowSecondary: "0 0 8px rgba(236, 106, 6, 0.6)",
    card: "0 4px 6px rgba(0, 0, 0, 0.3)",
  },

  fonts: {
    display: "'Plus Jakarta Sans', sans-serif",
    body: "'Inter', sans-serif",
  },
} as const;
