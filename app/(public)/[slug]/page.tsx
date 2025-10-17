// FILE: app/[slug]/page.tsx (UPDATED)

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEpisodeBySlug, getAdjacentEpisodes } from "@/app/actions/episode";
import { getEpisodesByDramaId } from "@/app/actions/episode";
import { generateEpisodeTitle, generateMetaDescription } from "@/lib/utils";
import VideoPlayer from "@/components/episode/VideoPlayer";
import EpisodeInfo from "@/components/episode/EpisodeInfo";
import EpisodeNavigation from "@/components/episode/EpisodeNavigation";
import EpisodeListPlayer from "@/components/episode/EpisodeListPlayer";
import AdUnit from "@/components/ads/AdUnit";
import { ADSENSE_CONFIG } from "@/lib/adsense-config";
import { getHomepageData } from "@/app/actions";
import OngoingSection from "@/components/home/OnGoingSection";
import CompletedSection from "@/components/home/CompletedSection";

// Generate static params for all episodes
export async function generateStaticParams() {
  return [];
}

export const revalidate = 259200;

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { success, episode } = await getEpisodeBySlug(slug);

  if (!success || !episode) {
    return {
      title: "Episode Tidak Ditemukan",
    };
  }

  const title = generateEpisodeTitle(episode.drama.title, episode.episodeNum);
  const description = generateMetaDescription(episode.drama.description);

  return {
    title,
    description,
    keywords: [
      `${episode.drama.title} episode ${episode.episodeNum}`,
      `nonton ${episode.drama.title}`,
      `streaming ${episode.drama.title}`,
      "drama malaysia sub indo",
      "nonton drama malaysia",
    ],
    openGraph: {
      title,
      description,
      type: "video.episode",
      images: [
        {
          url: episode.drama.thumbnail,
          width: 1200,
          height: 630,
          alt: `${episode.drama.title} Episode ${episode.episodeNum}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [episode.drama.thumbnail],
    },
    alternates: {
      canonical: `https://mangeakkk.my.id/${episode.slug}`,
    },
  };
}

export default async function EpisodePlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { success, episode } = await getEpisodeBySlug(slug);
  const { data } = await getHomepageData();

  if (!success || !episode) {
    notFound();
  }

  // Get adjacent episodes (prev/next)
  const adjacentResult = await getAdjacentEpisodes(
    episode.dramaId,
    episode.episodeNum
  );
  const { prev, next } = adjacentResult.success
    ? adjacentResult
    : { prev: null, next: null };

  // Get all episodes from this drama
  const episodesResult = await getEpisodesByDramaId(episode.dramaId);
  const allEpisodes = episodesResult.success ? episodesResult.episodes : [];

  return (
    <main className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Episode Info */}
        <EpisodeInfo episode={episode} />

        {/* Ad 1: Above Video Player */}
        <div className="max-w-5xl mx-auto">
          <AdUnit
            slot={ADSENSE_CONFIG.slots.playerAboveVideo}
            format="auto"
            responsive={true}
          />
        </div>

        {/* Video Player */}
        <VideoPlayer
          videoUrl={episode.videoUrl}
          title={`${episode.drama.title} - Episode ${episode.episodeNum}`}
        />

        {/* Navigation (Prev/Next) */}
        <EpisodeNavigation
          prev={prev}
          next={next}
          dramaSlug={episode.drama.slug}
        />

        {/* Ad 3: After Navigation */}
        <div className="max-w-3xl mx-auto">
          <AdUnit
            slot={ADSENSE_CONFIG.slots.playerAfterNav}
            format="auto"
            responsive={true}
          />
        </div>

        {/* Episode List */}
        {allEpisodes.length > 0 && (
          <EpisodeListPlayer
            episodes={allEpisodes}
            currentEpisodeNum={episode.episodeNum}
            dramaTitle={episode.drama.title}
          />
        )}

        {/* Ad 4: After Episode List */}
        <div className="max-w-3xl mx-auto">
          <AdUnit
            slot={ADSENSE_CONFIG.slots.playerAfterEpisodeList}
            format="auto"
            responsive={true}
          />
        </div>

        {/* Ongoing Dramas */}
        {data.ongoing.length > 0 && <OngoingSection dramas={data.ongoing} />}

        {/* Ad 5: Bottom Banner */}
        <div className="max-w-5xl mx-auto py-4">
          <AdUnit
            slot={ADSENSE_CONFIG.slots.playerBottomBanner}
            format="auto"
            responsive={true}
          />
        </div>

        {/* Completed Dramas */}
        {data.completed.length > 0 && (
          <CompletedSection dramas={data.completed} />
        )}

        {/* Ad 5: After Completed Dramas */}
        <div className="max-w-3xl mx-auto">
          <AdUnit
            slot={ADSENSE_CONFIG.slots.playerBelowVideo}
            format="auto"
            responsive={true}
          />
        </div>
      </div>
    </main>
  );
}
