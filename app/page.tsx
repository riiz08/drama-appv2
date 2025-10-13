import { Metadata } from "next";
import { getHomepageData } from "./actions";
import HeroSection from "@/components/home/HeroSection";
import PopularSection from "@/components/home/PopularSection";
import CompletedSection from "@/components/home/CompletedSection";
import LatestEpisodesSection from "@/components/home/LatestEpisodesSection";
import OngoingSection from "@/components/home/OnGoingSection";

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

      {/* Content Sections */}
      <div className="space-y-12 pb-20">
        {/* Popular Dramas */}
        {data.popular.length > 0 && <PopularSection dramas={data.popular} />}

        {/* Latest Episodes */}
        {data.latestEpisodes.length > 0 && (
          <LatestEpisodesSection episodes={data.latestEpisodes} />
        )}

        {/* Ongoing Dramas */}
        {data.ongoing.length > 0 && <OngoingSection dramas={data.ongoing} />}

        {/* Completed Dramas */}
        {data.completed.length > 0 && (
          <CompletedSection dramas={data.completed} />
        )}
      </div>
    </main>
  );
}
