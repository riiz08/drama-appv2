import { Metadata } from "next";
import { getHomepageData } from "@/app/actions";
import HeroSection from "@/components/home/HeroSection";
import PopularSection from "@/components/home/PopularSection";
import LatestEpisodesSection from "@/components/home/LatestEpisodesSection";
import { ADSENSE_CONFIG } from "@/lib/adsense-config";
import AdWrapper from "@/components/ads/AdWrapper";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tonton Drama Melayu HD Percuma Terkini - Mangeakkk Drama",
  description:
    "Tonton drama melayu terkini di Mangeakkk Drama. Streaming percuma full episod HD drama Malaysia, Astro & telefilem terbaru. Kemaskini setiap hari!",
  keywords: [
    "tonton drama melayu online",
    "drama melayu terkini",
    "streaming drama melayu percuma",
    "tonton drama online percuma",
    "mangeakkk drama",
    "drama melayu online percuma",
    "drama malaysia terkini",
    "full episod drama melayu",
    "drama melayu 2025",
    "drama astro online",
    "drama tv3 online",
    "drama tv9 terkini",
    "tonton drama melayu full episod",
    "streaming drama malaysia percuma",
    "drama sedang tayang",
    "drama melayu popular",
    "telefilem melayu terbaru",
    "drama romantis melayu",
    "drama keluarga malaysia",
    "tonton drama percuma",
    "download drama melayu",
    "streaming drama hd",
  ],
  openGraph: {
    type: "website",
    locale: "ms_MY",
    alternateLocale: ["en_SG", "id_ID"],
    url: "https://mangeakkk.my.id",
    siteName: "Mangeakkk",
    title: "Tonton Drama Melayu Online Percuma - Full Episod HD | Mangeakkk",
    description:
      "Platform streaming drama melayu terkini. Tonton full episod drama Malaysia, drama Astro, dan telefilem dalam kualiti HD secara percuma. Kemaskini setiap hari!",
    images: [
      {
        url: "/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "Mangeakkk - Streaming Drama Melayu Terkini Online Percuma",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tonton Drama Melayu Online Percuma - Full Episod HD",
    description:
      "Streaming drama melayu terkini dalam HD. Full episod percuma, kemaskini setiap hari!",
    images: ["/logo/logo.png"],
    creator: "@mangeakkk",
    site: "@mangeakkk",
  },
  alternates: {
    canonical: "https://mangeakkk.my.id",
  },
};

export default async function HomePage() {
  const homepageData = await getHomepageData();

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
    <div className="space-y-6">
      {/* Hero Section */}
      {homepageData.data.featured && (
        <HeroSection drama={homepageData.data.featured} />
      )}

      <AdWrapper slot={ADSENSE_CONFIG.slots.hads1} format="auto" />

      {/* Popular Dramas */}
      {homepageData.data.popular.length > 0 && (
        <PopularSection dramas={homepageData.data.popular} />
      )}

      <AdWrapper slot={ADSENSE_CONFIG.slots.hads2} format="auto" />

      {/* Latest Episodes */}
      {homepageData.data.latestEpisodes.length > 0 && (
        <LatestEpisodesSection episodes={homepageData.data.latestEpisodes} />
      )}
    </div>
  );
}
