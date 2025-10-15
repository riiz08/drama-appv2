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

  return (
    <section className="relative w-full bg-black">
      {/* Background Blur Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {!imageError && (
          <>
            <div className="absolute inset-0 scale-110 blur-2xl opacity-20">
              <Image
                src={episode.drama.thumbnail}
                alt="Mangeakk Drama"
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
            <div className="relative w-64 h-96 rounded-lg overflow-hidden shadow-2xl bg-zinc-900">
              {!imageError ? (
                <Image
                  src={episode.drama.thumbnail}
                  alt={episode.drama.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="256px"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800">
                  <ImageOff className="w-16 h-16 text-zinc-600 mb-2" />
                  <span className="text-sm text-zinc-500 text-center px-4">
                    {episode.drama.title}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            {/* Back Button */}
            <div>
              <Button
                as={Link}
                href={getDramaUrl(episode.drama.slug)}
                variant="light"
                size="sm"
                startContent={<ArrowLeft className="w-4 h-4" />}
                className="text-gray-400 hover:text-white"
              >
                Kembali ke Drama
              </Button>
            </div>

            {/* Title & Episode Number */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                {episode.drama.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Chip size="md" color="danger" variant="solid">
                  Episode {episode.episodeNum}
                </Chip>
                <Chip
                  size="md"
                  color={
                    episode.drama.status === "ONGOING" ? "success" : "primary"
                  }
                  variant="flat"
                >
                  {getStatusLabel(episode.drama.status)}
                </Chip>
              </div>
            </div>

            {/* Meta Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Release Date */}
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-xs text-gray-500">Tanggal Rilis</p>
                  <p className="text-sm font-medium">
                    {formatDate(episode.releaseDate)}
                  </p>
                </div>
              </div>

              {/* Total Episodes */}
              {episode.drama.totalEpisode && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Tv2 className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-xs text-gray-500">Total Episode</p>
                    <p className="text-sm font-medium">
                      {episode.episodeNum} dari {episode.drama.totalEpisode}{" "}
                      Episode
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="pt-2 border-t border-zinc-800">
              <h3 className="text-sm font-semibold text-white mb-2">
                Tentang Drama
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {episode.drama.description}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Chip
                as={Link}
                href={`/drama/${episode.drama.slug}`}
                startContent={<Hash className="w-4 h-4" />}
              >
                {episode.drama.title}
              </Chip>
              <Chip
                as={Link}
                startContent={<Hash className="w-4 h-4" />}
                href={`/episode/${episode.slug}`}
              >
                {episode.drama.title} episod {episode.episodeNum}
              </Chip>
              <Chip
                as={Link}
                startContent={<Hash className="w-4 h-4" />}
                href={`/`}
              >
                Kepala Bergetar
              </Chip>
              <Chip
                as={Link}
                startContent={<Hash className="w-4 h-4" />}
                href={`/`}
              >
                Basah Jeruk
              </Chip>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
