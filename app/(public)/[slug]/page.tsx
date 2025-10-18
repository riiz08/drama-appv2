// FILE: app/[slug]/page.tsx (SEO-OPTIMIZED)

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
import { BreadcrumbSchema } from "@/components/schema/BreadcrumbSchema";
import { VideoObjectSchema } from "@/components/schema/VideoObjectSchema";

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
      title: "Episod Tidak Dijumpai | Mangeakkk Drama",
      description:
        "Episod yang anda cari tidak dijumpai. Kembali ke halaman drama untuk melihat senarai episod.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  // Get adjacent episodes (prev/next)
  const adjacentResult = await getAdjacentEpisodes(
    episode.dramaId,
    episode.episodeNum
  );
  const { prev, next } = adjacentResult.success
    ? adjacentResult
    : { prev: null, next: null };

  const title = generateEpisodeTitle(episode.drama.title, episode.episodeNum);
  const description = episode.drama.description
    ? generateMetaDescription(episode.drama.description)
    : `Tonton ${episode.drama.title} Episod ${episode.episodeNum} secara percuma dalam kualiti HD. Streaming tanpa iklan.`;

  const canonicalUrl = `https://mangeakkk.my.id/${episode.slug}`;

  // Generate dynamic keywords
  const keywords = [
    `${episode.drama.title} episod ${episode.episodeNum}`,
    `tonton ${episode.drama.title} ep ${episode.episodeNum}`,
    `${episode.drama.title} episod ${episode.episodeNum} HD`,
    `streaming ${episode.drama.title} episod ${episode.episodeNum}`,
    `${episode.drama.title} episod ${episode.episodeNum} percuma`,
    "drama melayu episod penuh",
    "tonton drama online",
  ];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: "video.episode",
      url: canonicalUrl,
      siteName: "Mangeakkk Drama",
      images: [
        {
          url: episode.drama.thumbnail,
          width: 1200,
          height: 630,
          alt: `${episode.drama.title} Episod ${episode.episodeNum} - Tonton Online`,
        },
      ],
      ...(episode.drama.title && {
        videoSeries: episode.drama.title,
      }),
      ...(episode.releaseDate && {
        releaseDate: episode.releaseDate,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [episode.drama.thumbnail],
      creator: "@mangeakkk",
    },
    alternates: {
      canonical: canonicalUrl,
      // Add prev/next episode links if available
      ...(prev && {
        prev: `https://mangeakkk.my.id/${prev?.slug}`,
      }),
      ...(next && {
        next: `https://mangeakkk.my.id/${next.slug}`,
      }),
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
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
    <>
      {/* Breadcrumb Schema */}
      <BreadcrumbSchema
        items={[
          { name: "Laman Utama", url: "https://mangeakkk.my.id" },
          { name: "Drama", url: "https://mangeakkk.my.id/drama" },
          {
            name: episode.drama.title,
            url: `https://mangeakkk.my.id/drama/${episode.drama.slug}`,
          },
          {
            name: `Episod ${episode.episodeNum}`,
            url: `https://mangeakkk.my.id/${episode.slug}`,
          },
        ]}
      />

      {/* VideoObject Schema */}
      <VideoObjectSchema episode={episode} />

      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Episode Info Header */}
          <header>
            <EpisodeInfo episode={episode} />
          </header>

          {/* Ad 1: Above Video Player */}
          <div className="max-w-5xl mx-auto">
            <AdUnit
              slot={ADSENSE_CONFIG.slots.playerAboveVideo}
              format="auto"
              responsive={true}
            />
          </div>

          {/* Video Player - Main Content */}
          <article aria-label="Video player">
            <VideoPlayer
              videoUrl={episode.videoUrl}
              title={`${episode.drama.title} - Episod ${episode.episodeNum}`}
            />
          </article>

          {/* Navigation (Prev/Next) */}
          <nav aria-label="Navigasi episod">
            <EpisodeNavigation
              prev={prev}
              next={next}
              dramaSlug={episode.drama.slug}
            />
          </nav>

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
            <section aria-labelledby="episode-list-heading">
              <EpisodeListPlayer
                episodes={allEpisodes}
                currentEpisodeNum={episode.episodeNum}
                dramaTitle={episode.drama.title}
              />
            </section>
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
          {data.ongoing.length > 0 && (
            <section aria-labelledby="ongoing-heading">
              <OngoingSection dramas={data.ongoing} />
            </section>
          )}

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
            <section aria-labelledby="completed-heading">
              <CompletedSection dramas={data.completed} />
            </section>
          )}

          {/* Ad 6: After Completed Dramas */}
          <div className="max-w-3xl mx-auto">
            <AdUnit
              slot={ADSENSE_CONFIG.slots.playerBelowVideo}
              format="auto"
              responsive={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}
