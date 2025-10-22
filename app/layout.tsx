import "@/styles/globals.css";
import type { Metadata } from "next";
import clsx from "clsx";
import { Providers } from "./providers";
import { fontSans } from "@/config/fonts";
import { ToastProvider } from "@heroui/toast";
import AdSenseScript from "@/components/ads/AdsenseScript";
import { BaseSchema } from "@/components/schema/BaseSchema";
import { GoogleAnalytics } from "@next/third-parties/google";
import RouteLoadingIndicator from "@/components/RouteLoadingIndicator";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://mangeakkk.my.id"),
  title: {
    default: "Tonton Drama Melayu Terkini 2025 - Episod Penuh HD Percuma",
    template: "%s | Mangeakkk Drama",
  },
  description:
    "Tonton drama Melayu terkini dan terlengkap secara percuma. Streaming drama Malaysia HD dengan episod penuh. Kemaskini setiap hari tanpa iklan.",
  keywords: [
    "tonton drama melayu",
    "drama melayu terkini",
    "drama malaysia episod penuh",
    "streaming drama melayu percuma",
    "tonton drama online",
    "drama melayu 2025",
    "drama tv3 online",
    "drama astro online",
    "drama melayu best",
    "tonton drama percuma",
  ],
  authors: [{ name: "Mangeakkk Drama" }],
  creator: "Mangeakkk Drama",
  publisher: "Mangeakkk Drama",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ms_MY",
    alternateLocale: ["en_SG", "id_ID"],
    url: "https://mangeakkk.my.id",
    siteName: "Mangeakkk Drama",
    title: "Mangeakkk Drama - Tonton Drama Melayu Episod Penuh Percuma",
    description:
      "Platform streaming drama Melayu terlengkap tanpa iklan. Kualiti HD, kemaskini setiap hari. Tonton sekarang!",
    images: [
      {
        url: "/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "Mangeakkk Drama - Tonton Drama Melayu Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mangeakkk Drama - Tonton Drama Melayu Terkini",
    description:
      "Platform streaming drama Melayu terlengkap. Episod penuh HD percuma.",
    images: ["/logo/logo.png"],
    creator: "@mangeakkk",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  alternates: {
    canonical: "https://mangeakkk.my.id",
    languages: {
      "ms-MY": "https://mangeakkk.my.id",
    },
  },
  category: "entertainment",
  verification: {
    google: "h32myJ_wYVqSb9E1wTlcWEX3wIzR3mazjJrZ1s8bfUU",
  },
};

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
