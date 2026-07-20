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
          page: "#000000",
          card: "#17191F",
          raised: "#20232B",
        },
        border: {
          DEFAULT: "#2A2D35",
          strong: "#383C46",
        },
        text: {
          primary: "#F5F6F7",
          secondary: "#9AA0AA",
          muted: "#6E7480",
        },
        brand: {
          amber: "#FF9F1C",
        },
        medal: {
          gold: "#F2B807",
          silver: "#9AA3AE",
          bronze: "#C0703C",
        },
        state: {
          success: "#3DBE75",
          successBg: "#14301F",
          danger: "#FF6B61",
          dangerBg: "#3A1B18",
          warningBg: "#3A2A12",
          warningText: "#FFC670",
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
