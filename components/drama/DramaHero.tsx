"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, Tv2, Clock, ImageOff } from "lucide-react";
import { formatDate, getStatusLabel } from "@/lib/utils";
import { Chip } from "@heroui/chip";

interface DramaHeroProps {
  drama: {
    title: string;
    thumbnail: string;
    description: string;
    releaseDate: Date;
    status: "ONGOING" | "TAMAT";
    totalEpisode: number | null;
    airTime: string | null;
  };
}

export default function DramaHero({ drama }: DramaHeroProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="relative w-full bg-black">
      {/* Background Blur Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {!imageError && (
          <>
            <div className="absolute inset-0 scale-110 blur-2xl opacity-20">
              <Image
                src={drama.thumbnail}
                alt=""
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="relative w-64 h-96 rounded-lg overflow-hidden shadow-2xl bg-zinc-900">
              {!imageError ? (
                <Image
                  src={drama.thumbnail}
                  alt={drama.title}
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
                    {drama.title}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            {/* Title & Status */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                {drama.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  size="md"
                  color={drama.status === "ONGOING" ? "success" : "primary"}
                  variant="flat"
                >
                  {getStatusLabel(drama.status)}
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
                    {formatDate(drama.releaseDate)}
                  </p>
                </div>
              </div>

              {/* Total Episodes */}
              {drama.totalEpisode && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Tv2 className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-xs text-gray-500">Total Episode</p>
                    <p className="text-sm font-medium">
                      {drama.totalEpisode} Episode
                    </p>
                  </div>
                </div>
              )}

              {/* Air Time */}
              {drama.airTime && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Clock className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-xs text-gray-500">Jadwal Tayang</p>
                    <p className="text-sm font-medium">{drama.airTime}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
