"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowLeft, Hash, ImageOff, Tv2 } from "lucide-react";
import { getDramaUrl, formatDate, getStatusLabel } from "@/lib/utils";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";

interface EpisodeInfoProps {
  episode: {
    episodeNum: number;
    releaseDate: Date;
    slug: string;
    drama: {
      title: string;
      slug: string;
      description: string;
      status: "ONGOING" | "TAMAT";
      totalEpisode: number | null;
      thumbnail: string;
    };
  };
}

export default function EpisodeInfo({ episode }: EpisodeInfoProps) {
  const [imageError, setImageError] = useState(false);
  const statusLabel = getStatusLabel(episode.drama.status);
  const dramaUrl = getDramaUrl(episode.drama.slug);

  return (
    <div className="relative w-full bg-black">
      {/* Background Blur Effect */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {!imageError && (
          <>
            <div className="absolute inset-0 scale-110 blur-2xl opacity-20">
              <Image
                src={episode.drama.thumbnail}
                alt=""
                fill
                className="object-cover"
                priority
                onError={() => setImageError(true)}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <figure className="relative w-64 h-96 rounded-lg overflow-hidden shadow-2xl bg-zinc-900">
              {!imageError ? (
                <Image
                  src={episode.drama.thumbnail}
                  alt={`Poster ${episode.drama.title} Episod ${episode.episodeNum}`}
                  title={`Tonton ${episode.drama.title} Episod ${episode.episodeNum} Online`}
                  fill
                  priority
                  fetchPriority="high"
                  className="object-cover"
                  sizes="256px"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800"
                  role="img"
                  aria-label={`Poster ${episode.drama.title} tidak tersedia`}
                >
                  <ImageOff
                    className="w-16 h-16 text-zinc-600 mb-2"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-zinc-500 text-center px-4">
                    {episode.drama.title}
                  </span>
                </div>
              )}
            </figure>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            {/* Back Button */}
            <nav aria-label="Kembali ke halaman drama">
              <Button
                as={Link}
                href={dramaUrl}
                variant="light"
                size="sm"
                startContent={
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                }
                className="text-gray-400 hover:text-white"
                aria-label={`Kembali ke halaman ${episode.drama.title}`}
              >
                Kembali ke Drama
              </Button>
            </nav>

            {/* Title & Episode Number */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                {episode.drama.title} - Episod {episode.episodeNum}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  size="md"
                  color="danger"
                  variant="solid"
                  aria-label={`Episod ${episode.episodeNum}`}
                >
                  Episod {episode.episodeNum}
                </Chip>
                <Chip
                  size="md"
                  color={
                    episode.drama.status === "ONGOING" ? "success" : "primary"
                  }
                  variant="flat"
                  aria-label={`Status: ${statusLabel}`}
                >
                  {statusLabel}
                </Chip>
              </div>
            </div>

            {/* Meta Information */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Release Date */}
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-5 h-5 text-red-500" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-gray-500">Tarikh Tayangan</dt>
                  <dd className="text-sm font-medium">
                    <time
                      dateTime={new Date(episode.releaseDate).toISOString()}
                    >
                      {formatDate(episode.releaseDate)}
                    </time>
                  </dd>
                </div>
              </div>

              {/* Total Episodes */}
              {episode.drama.totalEpisode && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Tv2 className="w-5 h-5 text-red-500" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-gray-500">Jumlah Episod</dt>
                    <dd className="text-sm font-medium">
                      {episode.episodeNum} daripada {episode.drama.totalEpisode}{" "}
                      Episod
                    </dd>
                  </div>
                </div>
              )}
            </dl>

            {/* Description */}
            <article className="pt-2 border-t border-zinc-800">
              <h2 className="text-sm font-semibold text-white mb-2">
                Tentang Drama
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                {episode.drama.description}
              </p>
            </article>

            {/* Tags - SEO Keywords */}
            <nav aria-label="Kata kunci berkaitan">
              <div className="flex flex-wrap gap-2">
                <Chip
                  size="sm"
                  variant="flat"
                  startContent={<Hash className="w-3 h-3" aria-hidden="true" />}
                  aria-label={`Tag: ${episode.drama.title}`}
                >
                  {episode.drama.title}
                </Chip>
                <Chip
                  size="sm"
                  variant="flat"
                  startContent={<Hash className="w-3 h-3" aria-hidden="true" />}
                  aria-label={`Tag: episod ${episode.episodeNum}`}
                >
                  Episod {episode.episodeNum}
                </Chip>
                <Chip
                  size="sm"
                  variant="flat"
                  startContent={<Hash className="w-3 h-3" aria-hidden="true" />}
                  aria-label="Tag: drama melayu"
                >
                  Drama Melayu
                </Chip>
                <Chip
                  size="sm"
                  variant="flat"
                  startContent={<Hash className="w-3 h-3" aria-hidden="true" />}
                  aria-label={`Tag: ${statusLabel.toLowerCase()}`}
                >
                  {statusLabel}
                </Chip>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
