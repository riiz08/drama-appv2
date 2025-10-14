import { Metadata } from "next";
import { getHomepageData } from "@/app/actions";
import HeroSection from "@/components/home/HeroSection";
import PopularSection from "@/components/home/PopularSection";
import CompletedSection from "@/components/home/CompletedSection";
import LatestEpisodesSection from "@/components/home/LatestEpisodesSection";
import OngoingSection from "@/components/home/OnGoingSection";
import { ADSENSE_CONFIG } from "@/lib/adsense-config";
import AdUnit from "@/components/ads/AdUnit";

// SEO Metadata
export const metadata: Metadata = {
  title: "Mangeakkk Drama - Nonton Drama Malaysia Subtitle Indonesia Terbaru",
  description:
    "Nonton drama Malaysia terbaru dan terlengkap dengan subtitle Indonesia. Streaming drama Malaysia gratis dengan kualitas HD. Update episode terbaru setiap hari!",
  keywords: [
    "nonton drama malaysia",
    "drama malaysia sub indo",
    "streaming drama malaysia",
    "drama malaysia terbaru",
    "nonton drama melayu",
    "drama melayu subtitle indonesia",
  ],
  openGraph: {
    title: "Mangeakkk Drama - Nonton Drama Malaysia Sub Indo",
    description:
      "Nonton drama Malaysia terbaru dengan subtitle Indonesia. Update setiap hari!",
    type: "website",
    locale: "id_ID",
    siteName: "Mangeakkk Drama",
  },
  alternates: {
    canonical: "https://mangeakkk.my.id",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function HomePage() {
  const { success, data } = await getHomepageData();

  if (!success || !data) {
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
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      {data.featured && <HeroSection drama={data.featured} />}

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
        {data.popular.length > 0 && <PopularSection dramas={data.popular} />}

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
        {data.latestEpisodes.length > 0 && (
          <LatestEpisodesSection episodes={data.latestEpisodes} />
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
        {data.ongoing.length > 0 && <OngoingSection dramas={data.ongoing} />}

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
        {data.completed.length > 0 && (
          <CompletedSection dramas={data.completed} />
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
    </main>
  );
}
