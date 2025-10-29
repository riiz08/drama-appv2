import "@/styles/globals.css";
import clsx from "clsx";
import { Providers } from "./providers";
import { fontSans } from "@/config/fonts";
import { ToastProvider } from "@heroui/toast";
import AdSenseScript from "@/components/ads/AdsenseScript";
import { BaseSchema } from "@/components/schema/BaseSchema";
import { GoogleAnalytics } from "@next/third-parties/google";
import RouteLoadingIndicator from "@/components/RouteLoadingIndicator";
import { Analytics } from "@vercel/analytics/next";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms-MY" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />

        {/* ✅ Preconnect to external domains */}
        <link rel="preconnect" href="https://cdn.mangeakkk.my.id" />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-black text-white font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers
          themeProps={{
            attribute: "class",
            defaultTheme: "dark",
            forcedTheme: "dark",
          }}
        >
          <RouteLoadingIndicator />
          <ToastProvider />
          <BaseSchema />
          {children}
          <AdSenseScript />
        </Providers>

        <GoogleAnalytics gaId="G-MG1B3ZG1YZ" />
        <Analytics />
      </body>
    </html>
  );
}
