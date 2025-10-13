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

  return (
    <section className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        {!imageError ? (
          <>
            <Image
              src={drama.thumbnail}
              alt={drama.title}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
              onError={() => setImageError(true)}
            />
            {/* Multi-layer gradient for better readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black flex items-center justify-center">
            <ImageOff className="w-24 h-24 text-zinc-700" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end h-full pb-20 md:pb-24">
          <div className="max-w-2xl space-y-4 md:space-y-6">
            {/* Status Badges */}
            <div className="flex items-center gap-3">
              <Chip
                color="danger"
                variant="solid"
                size="sm"
                className="font-semibold"
              >
                FEATURED
              </Chip>
              <Chip
                color={drama.status === "ONGOING" ? "success" : "primary"}
                variant="flat"
                size="sm"
              >
                {getStatusLabel(drama.status)}
              </Chip>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
              {drama.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 text-sm md:text-base text-gray-300">
              <span className="font-semibold">
                {formatYear(drama.releaseDate)}
              </span>
              {drama.totalEpisode && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-400" />
                  <span>{drama.totalEpisode} Episode</span>
                </>
              )}
              {drama.airTime && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-400" />
                  <span>{drama.airTime}</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-base md:text-lg text-gray-200 line-clamp-3 max-w-xl drop-shadow-lg">
              {drama.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                as={Link}
                href={getDramaUrl(drama.slug)}
                color="default"
                size="lg"
                startContent={<Play className="w-5 h-5 fill-current" />}
                className="bg-white text-black font-semibold hover:bg-gray-200"
              >
                Tonton Sekarang
              </Button>

              <Button
                as={Link}
                href={getDramaUrl(drama.slug)}
                variant="bordered"
                size="lg"
                startContent={<Info className="w-5 h-5" />}
                className="border-white/30 text-white hover:bg-white/10"
              >
                Info Lengkap
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade to blend with content */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}
