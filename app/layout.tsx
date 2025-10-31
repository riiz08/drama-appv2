import "@/styles/globals.css";
import clsx from "clsx";
import { Providers } from "./providers";
import { fontSans } from "@/config/fonts";
import { ToastProvider } from "@heroui/toast";
import { BaseSchema } from "@/components/schema/BaseSchema";
import { GoogleAnalytics } from "@next/third-parties/google";
import RouteLoadingIndicator from "@/components/RouteLoadingIndicator";
import Script from "next/script";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms-MY" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <script
          async
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4287822627580434"
        />

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
        </Providers>
        <GoogleAnalytics gaId="G-MG1B3ZG1YZ" />
        {/* Force full page reload for all internal links */}
        <Script id="force-reload" strategy="beforeInteractive">
          {`
            window.addEventListener('click', function(e) {
              const link = e.target.closest('a');
              if (link && link.href && link.href.startsWith(window.location.origin) && !link.target) {
                e.preventDefault();
                window.location.href = link.href;
              }
            }, true);
          `}
        </Script>
      </body>
    </html>
  );
}
