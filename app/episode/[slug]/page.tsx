import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getEpisodeBySlug,
  getAllEpisodeSlugs,
  getAdjacentEpisodes,
} from "@/app/actions/episode";
import { getEpisodesByDramaId } from "@/app/actions/episode";
import { generateEpisodeTitle, generateMetaDescription } from "@/lib/utils";
import VideoPlayer from "@/components/episode/VideoPlayer";
import EpisodeInfo from "@/components/episode/EpisodeInfo";
import EpisodeNavigation from "@/components/episode/EpisodeNavigation";
import EpisodeListPlayer from "@/components/episode/EpisodeListPlayer";

// Generate static params for all episodes
export async function generateStaticParams() {
  const { success, slugs } = await getAllEpisodeSlugs();

  if (!success) return [];

  return slugs.map((slug) => ({
    slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { success, episode } = await getEpisodeBySlug(params.slug);

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
      canonical: `https://mangeakkk.my.id/episode/${episode.slug}`,
    },
  };
}

export default async function EpisodePlayerPage({
  params,
}: {
  params: { slug: string };
}) {
  const { success, episode } = await getEpisodeBySlug(params.slug);

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

        {/* Episode List */}
        {allEpisodes.length > 0 && (
          <EpisodeListPlayer
            episodes={allEpisodes}
            currentEpisodeNum={episode.episodeNum}
            dramaTitle={episode.drama.title}
          />
        )}
      </div>
    </main>
  );
}
