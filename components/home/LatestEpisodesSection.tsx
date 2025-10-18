"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, ChevronRight, Play, ImageOff } from "lucide-react";
import { getEpisodeUrl, formatRelativeTime } from "@/lib/utils";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";

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

interface LatestEpisodesSectionProps {
  episodes: EpisodeCardType[];
}

function EpisodeCard({ episode }: { episode: EpisodeCardType }) {
  const [imageError, setImageError] = useState(false);
  const episodeUrl = getEpisodeUrl(episode.slug);
  const releaseDate = new Date(episode.releaseDate);
  const relativeTime = formatRelativeTime(episode.releaseDate);

  return (
    <article>
      <Link
        href={episodeUrl}
        aria-label={`Tonton ${episode.drama.title} Episod ${episode.episodeNum} - ${relativeTime}`}
      >
        <Card
          isPressable
          fullWidth
          isHoverable
          className="group bg-zinc-900 border-none hover:bg-zinc-800 transition-all duration-300"
        >
          <CardBody className="flex flex-row gap-3 p-3">
            {/* Thumbnail */}
            <div className="relative w-32 h-20 flex-shrink-0 rounded overflow-hidden bg-zinc-800">
              {!imageError ? (
                <>
                  <Image
                    src={episode.drama.thumbnail}
                    alt={`${episode.drama.title} Episod ${episode.episodeNum} - Tonton Online`}
                    title={`Tonton ${episode.drama.title} Episod ${episode.episodeNum} Percuma`}
                    fill
                    className="object-cover"
                    sizes="128px"
                    loading="lazy"
                    onError={() => setImageError(true)}
                  />
                  <div
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  >
                    <Play
                      className="w-8 h-8 text-white fill-white"
                      aria-hidden="true"
                    />
                  </div>
                </>
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-zinc-800"
                  role="img"
                  aria-label={`Poster ${episode.drama.title} tidak tersedia`}
                >
                  <ImageOff
                    className="w-6 h-6 text-zinc-600"
                    aria-hidden="true"
                  />
                </div>
              )}
              {/* Episode Number Badge */}
              <div className="absolute bottom-1 right-1">
                <Chip
                  size="sm"
                  color="danger"
                  variant="solid"
                  className="text-xs font-bold"
                  aria-label={`Episod ${episode.episodeNum}`}
                >
                  EP {episode.episodeNum}
                </Chip>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 py-1 min-w-0">
              <h3 className="text-white font-semibold text-sm line-clamp-1 group-hover:text-red-500 transition-colors">
                {episode.drama.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Episod {episode.episodeNum}
              </p>
              <time
                className="text-xs text-gray-500 mt-1 block"
                dateTime={new Date(episode.releaseDate).toISOString()}
                title={new Date(episode.releaseDate).toLocaleDateString(
                  "ms-MY",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              >
                {relativeTime}
              </time>
            </div>
          </CardBody>
        </Card>
      </Link>
    </article>
  );
}

export default function LatestEpisodesSection({
  episodes,
}: LatestEpisodesSectionProps) {
  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      aria-labelledby="latest-episodes-heading"
    >
      {/* Section Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-yellow-500" aria-hidden="true" />
          <h2
            id="latest-episodes-heading"
            className="text-2xl md:text-3xl font-bold text-white"
          >
            Episod Terkini
          </h2>
        </div>
        <Button
          as={Link}
          href="/drama?sort=latest"
          variant="light"
          size="sm"
          endContent={<ChevronRight className="w-4 h-4" aria-hidden="true" />}
          className="text-gray-400 hover:text-white"
          aria-label="Lihat semua episod terkini"
        >
          Lihat Semua
        </Button>
      </header>

      {/* Episodes Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        role="list"
        aria-label="Senarai episod terkini"
      >
        {episodes.map((episode) => (
          <div key={episode.id} role="listitem">
            <EpisodeCard episode={episode} />
          </div>
        ))}
      </div>
    </section>
  );
}
