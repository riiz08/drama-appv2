import "@/styles/globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  metadataBase: new URL("https://mangeakkk.my.id"),
  title: {
    default: "Tonton Drama Melayu HD Percuma Terkini - Mangeakkk Drama",
    template: "",
  },
  description:
    "Tonton drama melayu terkini di Mangeakkk Drama. Streaming percuma full episod HD drama Malaysia, Astro & telefilem terbaru. Kemaskini setiap hari!",
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
  other: {
    "google-site-verification": "h32myJ_wYVqSb9E1wTlcWEX3wIzR3mazjJrZ1s8bfUU",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Detect if current page is homepage
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto px-2 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content - 70% */}
            <div className="flex-1 lg:w-[70%]">{children}</div>

            {/* Sidebar - 30% */}
            <aside className="lg:w-[30%]">
              {/* showFAQ={true} hanya di homepage */}
              <Sidebar showFAQ={false} />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
