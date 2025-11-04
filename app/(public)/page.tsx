import { Metadata } from "next";
import { getHomepageData } from "@/app/actions";
import HeroSection from "@/components/home/HeroSection";
import PopularSection from "@/components/home/PopularSection";
import CompletedSection from "@/components/home/CompletedSection";
import LatestEpisodesSection from "@/components/home/LatestEpisodesSection";
import OngoingSection from "@/components/home/OnGoingSection";
import { ADSENSE_CONFIG } from "@/lib/adsense-config";
import { unstable_cache } from "next/cache";
import SEOContentSection from "@/components/home/SeoContentSections";
import AdSlot from "@/components/ads/AdSlot";

export const runtime = "edge";

export const metadata: Metadata = {
  metadataBase: new URL("https://mangeakkk.my.id"),

  // OPTIMIZED: No template, manual control for optimal length
  title: "Mangeakkk Drama - Tonton Drama Melayu HD Percuma Terkini",

  // OPTIMIZED: More keyword variations + clearer value prop
  description:
    "Tonton drama melayu terkini di Mangeakkk Drama. Streaming percuma full episod HD drama Malaysia, Astro & telefilem terbaru. Kemaskini setiap hari!",

  keywords: [
    // Primary keywords (high priority)
    "tonton drama melayu online",
    "drama melayu terkini",
    "streaming drama melayu percuma",
    "tonton drama online percuma",
    "mangeakkk drama",

    // Secondary keywords
    "drama melayu online percuma",
    "drama malaysia terkini",
    "full episod drama melayu",
    "drama melayu 2025",

    // Network-specific
    "drama astro online",
    "drama tv3 online",
    "drama tv9 terkini",

    // Long-tail keywords
    "tonton drama melayu full episod",
    "streaming drama malaysia percuma",
    "drama sedang tayang",
    "drama melayu popular",
    "telefilem melayu terbaru",

    // Genre-specific
    "drama romantis melayu",
    "drama keluarga malaysia",

    // Action keywords
    "tonton drama percuma",
    "download drama melayu", // Even if not supported, captures intent
    "streaming drama hd",
  ],

  authors: [{ name: "Mangeakkk" }],
  creator: "Mangeakkk",
  publisher: "Mangeakkk",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // OPTIMIZED: Clearer messaging
  openGraph: {
    type: "website",
    locale: "ms_MY",
    alternateLocale: ["en_SG", "id_ID"], // Changed en_SG to en_MY (more relevant)
    url: "https://mangeakkk.my.id",
    siteName: "Mangeakkk",

    // OPTIMIZED: Keyword-rich title
    title: "Tonton Drama Melayu Online Percuma - Full Episod HD | Mangeakkk",

    // OPTIMIZED: More compelling description
    description:
      "Platform streaming drama melayu terkini. Tonton full episod drama Malaysia, drama Astro, dan telefilem dalam kualiti HD secara percuma. Kemaskini setiap hari!",

    images: [
      {
        url: "/logo/logo.png", // Make sure this is 1200x630 OG image
        width: 1200,
        height: 630,
        alt: "Mangeakkk - Streaming Drama Melayu Terkini Online Percuma",
      },
    ],
  },

  // OPTIMIZED: Twitter metadata
  twitter: {
    card: "summary_large_image",
    title: "Tonton Drama Melayu Online Percuma - Full Episod HD",
    description:
      "Streaming drama melayu terkini dalam HD. Full episod percuma, kemaskini setiap hari!",
    images: ["/logo/logo.png"],
    creator: "@mangeakkk",
    site: "@mangeakkk",
  },

  // OPTIMIZED: More specific robots directives
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
      "en-MY": "https://mangeakkk.my.id", // Keep same URL, different locale
    },
  },

  category: "entertainment",

  verification: {
    google: "h32myJ_wYVqSb9E1wTlcWEX3wIzR3mazjJrZ1s8bfUU",
  },

  // ADDED: Additional metadata for better discovery
  applicationName: "Mangeakkk",
  referrer: "origin-when-cross-origin",

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
    { revalidate: 600 }
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
      <AdSlot
        slot={ADSENSE_CONFIG.slots.homepageHeroBanner}
        format="auto"
        responsive={true}
      />

      {/* Content Sections */}
      <div className="space-y-12 pb-20">
        {/* Popular Dramas */}
        {homepageData.data.popular.length > 0 && (
          <PopularSection dramas={homepageData.data.popular} />
        )}

        {/* Ad 2: After Popular Section */}
        <AdSlot
          slot={ADSENSE_CONFIG.slots.homepageAfterPopular}
          format="autorelaxed"
          responsive={true}
        />

        {/* Latest Episodes */}
        {homepageData.data.latestEpisodes.length > 0 && (
          <LatestEpisodesSection episodes={homepageData.data.latestEpisodes} />
        )}

        {/* Ad 3: After Latest Episodes */}
        <AdSlot
          slot={ADSENSE_CONFIG.slots.homepageAfterEpisodes}
          format="auto"
          responsive={true}
        />

        {/* Ongoing Dramas */}
        {homepageData.data.ongoing.length > 0 && (
          <OngoingSection dramas={homepageData.data.ongoing} />
        )}

        {/* Ad 4: After Ongoing Section */}
        <AdSlot
          slot={ADSENSE_CONFIG.slots.homepageAfterOngoing}
          format="auto"
          responsive={true}
        />

        {/* Completed Dramas */}
        {homepageData.data.completed.length > 0 && (
          <CompletedSection dramas={homepageData.data.completed} />
        )}

        {/* Ad 5: Bottom Banner (Before Footer) */}
        <AdSlot
          slot={ADSENSE_CONFIG.slots.homepageBottomBanner}
          format="auto"
          responsive={true}
        />
        <SEOContentSection />
      </div>
    </div>
  );
}
