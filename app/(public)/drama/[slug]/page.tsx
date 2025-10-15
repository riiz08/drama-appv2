// FILE: app/drama/[slug]/page.tsx (UPDATED)

import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getDramaBySlug,
  getAllDramaSlugs,
  getRelatedDramas,
} from "@/app/actions/drama";
import { generateDramaTitle, generateMetaDescription } from "@/lib/utils";
import DramaHero from "@/components/drama/DramaHero";
import DramaSynopsis from "@/components/drama/DramaSynopsis";
import EpisodeList from "@/components/drama/EpisodeList";
import RelatedDramas from "@/components/drama/RelatedDramas";
import CompletedSection from "@/components/home/CompletedSection";
import { getHomepageData } from "@/app/actions";
import AdUnit from "@/components/ads/AdUnit";
import { ADSENSE_CONFIG } from "@/lib/adsense-config";

// Generate static params for all dramas
export async function generateStaticParams() {
  return [];
}

export const revalidate = 259200;

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<any>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { success, drama } = await getDramaBySlug(slug);

  if (!success || !drama) {
    return {
      title: "Drama Tidak Ditemukan",
    };
  }

  return {
    title: generateDramaTitle(drama.title),
    description: generateMetaDescription(drama.description),
    keywords: [
      `nonton ${drama.title}`,
      `${drama.title} sub indo`,
      `streaming ${drama.title}`,
      "drama malaysia",
      "drama malaysia sub indo",
    ],
    openGraph: {
      title: generateDramaTitle(drama.title),
      description: generateMetaDescription(drama.description),
      type: "video.tv_show",
      images: [
        {
          url: drama.thumbnail,
          width: 1200,
          height: 630,
          alt: drama.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: generateDramaTitle(drama.title),
      description: generateMetaDescription(drama.description),
      images: [drama.thumbnail],
    },
    alternates: {
      canonical: `https://mangeakkk.my.id/drama/${drama.slug}`,
    },
  };
}

export default async function DramaDetailPage({
  params,
}: {
  params: Promise<any>;
}) {
  const { slug } = await params;
  const { success, drama } = await getDramaBySlug(slug);

  if (!success || !drama) {
    notFound();
  }

  // Get related dramas
  const relatedResult = await getRelatedDramas(drama.id, 6);
  const relatedDramas = relatedResult.success ? relatedResult.dramas : [];
  const completedResult = await getHomepageData();

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <DramaHero drama={drama} />

      {/* Ad 1: After Hero */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <AdUnit
          slot={ADSENSE_CONFIG.slots.dramaAfterHero}
          format="auto"
          responsive={true}
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Synopsis */}
        <DramaSynopsis description={drama.description} />

        {/* Ad 2: After Synopsis */}
        <div className="max-w-3xl mx-auto">
          <AdUnit
            slot={ADSENSE_CONFIG.slots.dramaAfterSynopsis}
            format="auto"
            responsive={true}
          />
        </div>

        {/* Episode List */}
        <EpisodeList episodes={drama.episodes} dramaTitle={drama.title} />

        {/* Ad 3: After Episode List */}
        <div className="max-w-3xl mx-auto">
          <AdUnit
            slot={ADSENSE_CONFIG.slots.dramaAfterEpisodes}
            format="auto"
            responsive={true}
          />
        </div>

        {/* Related Dramas */}
        {relatedDramas.length > 0 && <RelatedDramas dramas={relatedDramas} />}

        {/* Ad 4: After Related Dramas */}
        {relatedDramas.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <AdUnit
              slot={ADSENSE_CONFIG.slots.dramaAfterRelated}
              format="auto"
              responsive={true}
            />
          </div>
        )}

        {/* Completed Dramas */}
        {completedResult.data.completed.length > 0 && (
          <CompletedSection dramas={completedResult.data.completed} />
        )}

        {/* Ad 5: Bottom Banner */}
        <div className="max-w-5xl mx-auto py-4">
          <AdUnit
            slot={ADSENSE_CONFIG.slots.dramaBottomBanner}
            format="auto"
            responsive={true}
          />
        </div>
      </div>
    </main>
  );
}
