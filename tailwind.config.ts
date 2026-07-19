import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          page: "#F4F5F7",
          card: "#FFFFFF",
        },
        border: {
          DEFAULT: "#E4E6EA",
          strong: "#D8DAE0",
        },
        text: {
          primary: "#20242B",
          secondary: "#69707C",
          muted: "#9AA0AA",
        },
        brand: {
          amber: "#FF9F1C",
          amberDark: "#C9741A",
        },
        dark: {
          surface0: "#14161B",
          surface1: "#1E2128",
          textPrimary: "#F5F6F7",
          textSecondary: "#9AA0AA",
          border: "#2C3038",
        },
        medal: {
          gold: "#F2B807",
          silver: "#9AA3AE",
          bronze: "#C0703C",
        },
        state: {
          success: "#2FAE66",
          successBg: "#E4F7EC",
          danger: "#E0483D",
          dangerBg: "#FBE7E6",
          warningBg: "#FFF0D6",
          warningText: "#B9700A",
        },
      },
      fontSize: {
        display: ["28px", { lineHeight: "1.3", fontWeight: "800" }],
        title: ["20px", { lineHeight: "1.3", fontWeight: "800" }],
        subtitle: ["15px", { lineHeight: "1.4", fontWeight: "700" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.5", fontWeight: "400" }],
        micro: ["11px", { lineHeight: "1.4", fontWeight: "600" }],
      },
      borderRadius: {
        card: "12px",
        sheet: "22px",
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};

export default config;
