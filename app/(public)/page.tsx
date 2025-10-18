import { Metadata } from "next";
import { getHomepageData } from "@/app/actions";
import HeroSection from "@/components/home/HeroSection";
import PopularSection from "@/components/home/PopularSection";
import CompletedSection from "@/components/home/CompletedSection";
import LatestEpisodesSection from "@/components/home/LatestEpisodesSection";
import OngoingSection from "@/components/home/OnGoingSection";
import { ADSENSE_CONFIG } from "@/lib/adsense-config";
import AdUnit from "@/components/ads/AdUnit";
import { unstable_cache } from "next/cache";

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
  other: {
    "google-site-verification": "h32myJ_wYVqSb9E1wTlcWEX3wIzR3mazjJrZ1s8bfUU",
  },
};
export default async function HomePage() {
  const getCachedHomePageData = unstable_cache(
    async () => {
      const { success, data } = await getHomepageData();
      return { success, data };
    },
    ["HomepageData"],
    { revalidate: 60 }
  );

  const homepageData = await getCachedHomePageData();

  if (!homepageData.success || !homepageData.data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Oops! Terjadi Kesalahan</h1>
          <p className="text-gray-400">
            Gagal memuat data. Silakan refresh halaman.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      {homepageData.data.featured && (
        <HeroSection drama={homepageData.data.featured} />
      )}

      {/* Ad 1: Hero Banner (After Hero) */}
      <div className="container mx-auto px-4 py-6">
        <AdUnit
          slot={ADSENSE_CONFIG.slots.homepageHeroBanner}
          format="auto"
          responsive={true}
          className="max-w-5xl mx-auto"
        />
      </div>

      {/* Content Sections */}
      <div className="space-y-12 pb-20">
        {/* Popular Dramas */}
        {homepageData.data.popular.length > 0 && (
          <PopularSection dramas={homepageData.data.popular} />
        )}

        {/* Ad 2: After Popular Section */}
        <div className="container mx-auto px-4">
          <AdUnit
            slot={ADSENSE_CONFIG.slots.homepageAfterPopular}
            format="auto"
            responsive={true}
            className="max-w-3xl mx-auto"
          />
        </div>

        {/* Latest Episodes */}
        {homepageData.data.latestEpisodes.length > 0 && (
          <LatestEpisodesSection episodes={homepageData.data.latestEpisodes} />
        )}

        {/* Ad 3: After Latest Episodes */}
        <div className="container mx-auto px-4">
          <AdUnit
            slot={ADSENSE_CONFIG.slots.homepageAfterEpisodes}
            format="auto"
            responsive={true}
            className="max-w-3xl mx-auto"
          />
        </div>

        {/* Ongoing Dramas */}
        {homepageData.data.ongoing.length > 0 && (
          <OngoingSection dramas={homepageData.data.ongoing} />
        )}

        {/* Ad 4: After Ongoing Section */}
        <div className="container mx-auto px-4">
          <AdUnit
            slot={ADSENSE_CONFIG.slots.homepageAfterOngoing}
            format="auto"
            responsive={true}
            className="max-w-3xl mx-auto"
          />
        </div>

        {/* Completed Dramas */}
        {homepageData.data.completed.length > 0 && (
          <CompletedSection dramas={homepageData.data.completed} />
        )}

        {/* Ad 5: Bottom Banner (Before Footer) */}
        <div className="container mx-auto px-4 py-6">
          <AdUnit
            slot={ADSENSE_CONFIG.slots.homepageBottomBanner}
            format="auto"
            responsive={true}
            className="max-w-3xl mx-auto"
          />
        </div>
      </div>
    </div>
  );
}
