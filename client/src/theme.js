// color design tokens export
export const tokens = {
  grey: {
    0: "#ffffff",
    10: "#f6f6f6",
    50: "#f0f0f0",
    100: "#e0e0e0",
    200: "#c2c2c2",
    300: "#a3a3a3",
    400: "#858585",
    500: "#666666",
    600: "#525252",
    700: "#3d3d3d",
    800: "#1a2233",
    900: "#0f172a",
    1000: "#000000",
  },
  primary: {
    // green from-green-400
    100: "#e0fff0",
    200: "#c6ffe4",
    300: "#a7f3d0",
    400: "#4ade80", // green-400 from tailwind
    500: "#34d399", // main primary
    600: "#10b981",
    700: "#059669",
    800: "#047857",
    900: "#064e3b",
  },
  secondary: {
    // blue to-blue-400
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa", // blue-400 from tailwind
    500: "#3b82f6", // main secondary
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  error: {
    // error red
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444", // main error
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
  // Adding accent colors for additional visual elements
  accent: {
    100: "#f0fdfa",
    200: "#ccfbf1",
    300: "#99f6e4",
    400: "#5eead4",
    500: "#2dd4bf", // main accent
    600: "#14b8a6",
    700: "#0d9488",
    800: "#0f766e",
    900: "#115e59",
  }
};

// mui theme settings
export const themeSettings = () => {
  return {
    palette: {
      mode: "light",
      primary: {
        ...tokens.primary,
        main: tokens.primary[500],
        light: tokens.primary[400],
      },
      secondary: {
        ...tokens.secondary,
        main: tokens.secondary[500],
      },
      error: {
        ...tokens.error,
        main: tokens.error[500],
      },
      neutral: {
        ...tokens.grey,
        main: tokens.grey[500],
      },
      background: {
        default: tokens.grey[0],
        alt: tokens.grey[50],
        gradient: "linear-gradient(to right, #4ade80, #60a5fa)", // green-400 to blue-400
        hoverGradient: "linear-gradient(to right, #34d399, #3b82f6)", // slightly darker on hover
      },
      text: {
        primary: tokens.grey[900],
        secondary: tokens.grey[800],
        accent: tokens.accent[700],
        light: "#ffffff",
        dark: "#121212",
        muted: tokens.grey[600],
      },
      divider: tokens.secondary[200],
      action: {
        hover: "rgba(94, 234, 212, 0.08)", // accent-400 with transparency
        selected: "rgba(94, 234, 212, 0.16)", // accent-400 with more opacity
        active: tokens.accent[400],
      },
    },
    typography: {
      fontFamily: ["Inter", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 40,
        fontWeight: 600,
      },
      h2: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 32,
        fontWeight: 600,
      },
      h3: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 24,
        fontWeight: 500,
      },
      h4: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 20,
        fontWeight: 500,
      },
      h5: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 16,
        fontWeight: 500,
      },
      h6: {
        fontFamily: ["Inter", "sans-serif"].join(","),
        fontSize: 14,
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            backgroundImage: "linear-gradient(to right, #4ade80, #60a5fa)",
            color: "#ffffff",
            fontWeight: 500,
            margin: "8px",
            borderRadius: 8,
            textTransform: "none",
            '&:hover': {
              backgroundImage: "linear-gradient(to right, #34d399, #3b82f6)",
              boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.1)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.05)",
            '&:hover': {
              boxShadow: "0 8px 30px 0 rgba(0, 0, 0, 0.1)",
              transition: "box-shadow 0.3s ease-in-out",
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            color: tokens.grey[900], // Ensure table text is dark and visible
          },
          head: {
            fontWeight: 600,
            backgroundColor: tokens.grey[50],
            color: tokens.grey[900],
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: "none",
            "& .MuiDataGrid-cell": {
              color: tokens.grey[900], // Make grid text dark
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: tokens.grey[50],
              color: tokens.grey[900],
              fontWeight: 600,
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              color: tokens.grey[900],
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            color: tokens.grey[900],
            backgroundColor: tokens.grey[0],
          },
        },
      },
    },
  };
};
