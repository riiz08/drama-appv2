"use client";

import Link from "next/link";
import { Clock, ChevronRight, Play } from "lucide-react";
import { getEpisodeUrl, formatRelativeTime } from "@/lib/utils";
import { Chip } from "@heroui/chip";

interface EpisodeCardType {
  id: string;
  slug: string;
  episodeNum: number;
  releaseDate: Date;
  drama: {
    title: string;
    slug: string;
    thumbnail: string;
    status: "ONGOING" | "TAMAT";
  };
}

interface LatestEpisodesListSidebarProps {
  episodes: EpisodeCardType[];
}

function EpisodeListItem({ episode }: { episode: EpisodeCardType }) {
  const episodeUrl = getEpisodeUrl(episode.slug);

  return (
    <Link
      href={episodeUrl}
      className="group flex items-center justify-between px-4 py-3 hover:bg-zinc-800 transition-colors duration-200"
      aria-label={`Tonton ${episode.drama.title} Episod ${episode.episodeNum}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Play Icon */}
        <Play
          className="w-4 h-4 text-red-500 flex-shrink-0"
          aria-hidden="true"
        />

        {/* Drama Title */}
        <span className="text-white text-sm font-medium line-clamp-1 group-hover:text-red-500 transition-colors">
          {episode.drama.title}
        </span>
      </div>

      {/* Episode Badge */}
      <Chip
        size="sm"
        className="bg-red-600 text-white text-xs font-bold flex-shrink-0 ml-2"
        aria-label={`Episod ${episode.episodeNum}`}
      >
        Episode {episode.episodeNum}
      </Chip>
    </Link>
  );
}

export default function LatestEpisodesListSidebar({
  episodes,
}: LatestEpisodesListSidebarProps) {
  return (
    <section
      className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800"
      aria-labelledby="sidebar-latest-episodes-heading"
    >
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-white" aria-hidden="true" />
          <h2
            id="sidebar-latest-episodes-heading"
            className="text-lg font-bold text-white"
          >
            Episod Terkini
          </h2>
        </div>
        <Link
          href="/drama?sort=latest"
          className="text-white hover:text-red-200 transition-colors"
          aria-label="Lihat semua episod terkini"
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </Link>
      </header>

      {/* Episodes List */}
      <div
        className="divide-y divide-zinc-800"
        role="list"
        aria-label="Senarai episod terkini"
      >
        {episodes.slice(0, 12).map((episode) => (
          <div key={episode.id} role="listitem">
            <EpisodeListItem episode={episode} />
          </div>
        ))}
      </div>
    </section>
  );
}
