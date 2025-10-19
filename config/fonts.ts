import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // ✅ Prevent FOIT (Flash of Invisible Text)
  preload: true,
  // Only load weights you actually use
  weight: ["400", "500", "600", "700"],
  fallback: ["system-ui", "arial"],
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap", // ✅ Add display swap
  preload: true,
  weight: ["400", "500", "700"],
  fallback: ["monospace"],
});
