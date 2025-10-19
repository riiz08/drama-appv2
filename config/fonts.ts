import { Inter as FontSans } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // ✅ Prevent FOIT (Flash of Invisible Text)
  preload: true,
  // Only load weights you actually use
  weight: ["400", "500", "600", "700"],
  fallback: ["system-ui", "arial"],
});
