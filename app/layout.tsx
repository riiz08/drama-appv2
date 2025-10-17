//file app/layout.tsx

import "@/styles/globals.css";
import type { Metadata } from "next";
import clsx from "clsx";
import { Providers } from "./providers";
import { fontSans } from "@/config/fonts";
import { ToastProvider } from "@heroui/toast";
import AdSenseScript from "@/components/ads/AdsenseScript";
import { BaseSchema } from "@/components/schema/BaseSchema";

export const metadata: Metadata = {
  metadataBase: new URL("https://mangeakkk.my.id"),
  title: {
    default: "Mangeakkk Drama - Nonton Drama Malaysia Full Episod",
    template: "%s Mangeakkk Drama",
  },
  description:
    "Nonton drama Malaysia terbaru dan terlengkap full episod. Streaming drama Malaysia gratis dengan kualitas HD. Update episode terbaru setiap hari.",
  keywords: [
    "nonton drama malaysia",
    "drama malaysia full episod",
    "streaming drama malaysia",
    "drama malaysia terbaru",
    "nonton drama melayu",
    "drama melayu free",
    "drama malaysia online",
    "tonton drama malaysia",
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
    locale: "id_ID",
    alternateLocale: ["ms_MY", "en_SG"],
    url: "https://mangeakkk.my.id",
    siteName: "Mangeakkk Drama",
    title: "Mangeakkk Drama - Nonton Drama Malaysia full episod",
    description:
      "Platform streaming drama Malaysia terlengkap tanpa iklan full HD. Update setiap hari",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mangeakkk Drama",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mangeakkk Drama - Nonton Drama Malaysia Sub Indo",
    description:
      "Platform streaming drama Malaysia terlengkap dengan subtitle Indonesia.",
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
  },
  category: "entertainment",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="my" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
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
          <ToastProvider />
          <BaseSchema />
          {children}
          <AdSenseScript />
        </Providers>
      </body>
    </html>
  );
}
