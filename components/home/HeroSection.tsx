"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Info, ImageOff } from "lucide-react";
import { formatYear, getStatusLabel, getDramaUrl } from "@/lib/utils";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";

interface HeroSectionProps {
  drama: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    description: string;
    releaseDate: Date;
    status: "ONGOING" | "TAMAT";
    totalEpisode: number | null;
    airTime: string | null;
  };
}

export default function HeroSection({ drama }: HeroSectionProps) {
  const [imageError, setImageError] = useState(false);
  const dramaUrl = getDramaUrl(drama.slug);
  const statusLabel = getStatusLabel(drama.status);

  return (
    <section
      className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden rounded-lg md:rounded-xl"
      aria-label="Drama Pilihan Utama"
    >
      {/* Background Image with Enhanced Gradient Overlay */}
      <div
        className="absolute inset-0"
        role="img"
        aria-label={`Poster ${drama.title}`}
      >
        {!imageError ? (
          <>
            <Image
              src={drama.thumbnail}
              alt={`${drama.title} - Drama Melayu ${formatYear(drama.releaseDate)}`}
              title={`Tonton ${drama.title} Drama Melayu Terkini`}
              fill
              priority
              fetchPriority="high"
              className="object-cover object-center"
              sizes="100vw, 100vh"
              onError={() => setImageError(true)}
            />
            {/* Multi-layer gradient for better readability and smooth edges */}
            {/* Top gradient - subtle fade */}
            <div
              className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent"
              aria-hidden="true"
            />

            {/* Left gradient - untuk readability text */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"
              aria-hidden="true"
            />

            {/* Bottom gradient - strong fade */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"
              aria-hidden="true"
            />

            {/* HORIZONTAL EDGE GRADIENTS - Smooth transition ke samping kiri & kanan */}
            {/* Left Edge Gradient */}
            <div
              className="absolute top-0 bottom-0 left-0 w-32 md:w-48 lg:w-64 bg-gradient-to-r from-black via-black/80 to-transparent"
              aria-hidden="true"
            />

            {/* Right Edge Gradient */}
            <div
              className="absolute top-0 bottom-0 right-0 w-32 md:w-48 lg:w-64 bg-gradient-to-l from-black via-black/80 to-transparent"
              aria-hidden="true"
            />

            {/* Bottom Edge - Extra smooth */}
            <div
              className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/90 to-transparent"
              aria-hidden="true"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black flex items-center justify-center">
            <ImageOff className="w-24 h-24 text-zinc-700" aria-hidden="true" />
            <span className="sr-only">Gambar tidak tersedia</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end h-full pb-16 md:pb-20">
          <article className="max-w-2xl space-y-3 md:space-y-6">
            {/* Status Badges */}
            <div
              className="flex items-center gap-3"
              role="status"
              aria-label="Status drama"
            >
              <Chip
                color="danger"
                variant="solid"
                size="sm"
                className="font-semibold shadow-lg"
                aria-label="Drama pilihan"
              >
                PILIHAN
              </Chip>
              <Chip
                color={drama.status === "ONGOING" ? "success" : "primary"}
                variant="flat"
                size="sm"
                aria-label={`Status: ${statusLabel}`}
              >
                {statusLabel}
              </Chip>
            </div>

            {/* Title - H1 for SEO */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
              {drama.title}
            </h1>

            {/* Meta Info */}
            <div
              className="flex flex-wrap items-center gap-3 text-sm md:text-base text-gray-200"
              role="contentinfo"
              aria-label="Maklumat drama"
            >
              <span className="font-semibold">
                <time dateTime={new Date(drama.releaseDate).toISOString()}>
                  {formatYear(drama.releaseDate)}
                </time>
              </span>
              {drama.totalEpisode && (
                <>
                  <span
                    className="w-1 h-1 rounded-full bg-gray-400"
                    aria-hidden="true"
                  />
                  <span>{drama.totalEpisode} Episod</span>
                </>
              )}
              {drama.airTime && (
                <>
                  <span
                    className="w-1 h-1 rounded-full bg-gray-400"
                    aria-hidden="true"
                  />
                  <span aria-label={`Masa tayangan: ${drama.airTime}`}>
                    {drama.airTime}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p
              className="text-base md:text-lg text-gray-200 line-clamp-3 max-w-xl drop-shadow-lg"
              aria-label="Sinopsis drama"
            >
              {drama.description}
            </p>

            {/* Action Buttons */}
            <nav
              className="flex flex-wrap gap-3 pt-2"
              aria-label="Tindakan drama"
            >
              <Button
                as={Link}
                href={dramaUrl}
                color="default"
                size="lg"
                startContent={
                  <Play className="w-5 h-5 fill-current" aria-hidden="true" />
                }
                className="bg-white text-black font-semibold hover:bg-gray-200 shadow-xl"
                aria-label={`Tonton ${drama.title} sekarang`}
              >
                Tonton Sekarang
              </Button>

              <Button
                as={Link}
                href={dramaUrl}
                variant="bordered"
                size="lg"
                startContent={<Info className="w-5 h-5" aria-hidden="true" />}
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                aria-label={`Lihat maklumat lengkap ${drama.title}`}
              >
                Maklumat Lengkap
              </Button>
            </nav>
          </article>
        </div>
      </div>
    </section>
  );
}
