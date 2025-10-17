//file app/(public)/layout.tsx

import "@/styles/globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
        url: "/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "Mangeakkk Drama",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mangeakkk Drama - Nonton Drama Malaysia Full Epsiod",
    description: "Platform streaming drama Malaysia terlengkap tanpa iklan.",
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
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 md:pt-20">
        {children}
        <SpeedInsights />
      </main>
      <Footer />
    </div>
  );
}
