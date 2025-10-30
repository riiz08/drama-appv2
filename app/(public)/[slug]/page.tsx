// FILE: app/[slug]/page.tsx (OPTIMIZED)

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getEpisodeFullData,
  getPopularEpisodeSlugs,
} from "@/app/actions/episode/queries";
import { generateEpisodeTitle } from "@/lib/utils";
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
import VideoPlayerWrapper from "@/components/episode/VideoPlayerWrapper";
import { EpisodeSchema } from "@/components/schema/EpisodeSchema";

export const runtime = "edge";

// ============================================
// 3. OPTIMIZED METADATA GENERATION
// ============================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Use optimized single query
  const data = await getEpisodeFullData(slug);

  if (!data.success || !data.episode) {
    return {
      title: "Episod Tidak Dijumpai - Mangeakkk",
      description: "Episod yang anda cari tidak dijumpai.",
      robots: { index: false, follow: true },
    };
  }

  const { episode, prev, next } = data;
  const title = generateEpisodeTitle(episode.drama.title, episode.episodeNum);

  // Build description
  let description = `Tonton ${episode.drama.title} Episod ${episode.episodeNum} HD.`;

  if (episode.drama.casts?.[0]) {
    const topCast = episode.drama.casts
      .slice(0, 3)
      .map((c) => c.cast.name)
      .join(", ");
    description += ` Lakonan ${topCast}.`;
  }

  if (episode.drama.directors?.[0]) {
    description += ` Diarahkan oleh ${episode.drama.directors[0].director.name}.`;
  }

  const canonicalUrl = `https://mangeakkk.my.id/${episode.slug}`;

  // Minimal but effective keywords
  const keywords = [
    `${episode.drama.title} episod ${episode.episodeNum}`,
    `tonton ${episode.drama.title}`,
    "drama melayu online",
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
          alt: title,
        },
      ],
    },
    twitter: {
      card: "player",
      title,
      description,
      images: [episode.drama.thumbnail],
    },
    alternates: {
      canonical: canonicalUrl,
      ...(prev && { prev: `https://mangeakkk.my.id/${prev.slug}` }),
      ...(next && { next: `https://mangeakkk.my.id/${next.slug}` }),
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  };
}

// ============================================
// 4. OPTIMIZED PAGE COMPONENT
// ============================================
export default async function EpisodePlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // OPTIMIZATION: Single optimized query
  const data = await getEpisodeFullData(slug);

  if (!data.success || !data.episode) {
    notFound();
  }

  const { episode, prev, next, allEpisodes } = data;

  // OPTIMIZATION: Start fetching homepage data (don't await yet)
  const homeDataPromise = getHomepageData();

  return (
    <>
      {/* Schemas - minimal overhead */}
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
      <VideoObjectSchema episode={episode} />
      <EpisodeSchema episode={episode} />

      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* CRITICAL CONTENT - Render immediately */}

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
            <VideoPlayerWrapper
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

          {/* Ad 2: After Navigation */}
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

          {/* Ad 3: After Episode List */}
          <div className="max-w-3xl mx-auto">
            <AdUnit
              slot={ADSENSE_CONFIG.slots.playerAfterEpisodeList}
              format="auto"
              responsive={true}
            />
          </div>

          {/* NON-CRITICAL - Lazy load with Suspense */}
          <Suspense fallback={<LoadingSkeleton />}>
            <BelowFoldContent homeDataPromise={homeDataPromise} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

// ============================================
// 5. LAZY LOADED BELOW-THE-FOLD CONTENT
// ============================================
async function BelowFoldContent({
  homeDataPromise,
}: {
  homeDataPromise: Promise<any>;
}) {
  const { data } = await homeDataPromise;

  return (
    <>
      {/* Ongoing Dramas */}
      {data.ongoing.length > 0 && (
        <section aria-labelledby="ongoing-heading">
          <OngoingSection dramas={data.ongoing} />
        </section>
      )}

      {/* Ad 4: Bottom Banner */}
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

      {/* Ad 5: After Completed Dramas */}
      <div className="max-w-3xl mx-auto">
        <AdUnit
          slot={ADSENSE_CONFIG.slots.playerBelowVideo}
          format="auto"
          responsive={true}
        />
      </div>
    </>
  );
}

// ============================================
// 6. LOADING SKELETON
// ============================================
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-64 bg-zinc-900 animate-pulse rounded-lg" />
      <div className="h-64 bg-zinc-900 animate-pulse rounded-lg" />
    </div>
  );
}
