"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, ImageOff } from "lucide-react";
import {
  getDramaUrl,
  getStatusLabel,
  truncate,
  getPlaceholderImage,
} from "@/lib/utils";
import { Chip } from "@heroui/chip";

interface DramaCardProps {
  drama: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    status: "ONGOING" | "TAMAT";
    totalEpisode?: number | null;
    description?: string;
  };
  showDescription?: boolean;
}

export default function DramaCard({
  drama,
  showDescription = false,
}: DramaCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={getDramaUrl(drama.slug)} className="block w-full">
      <div className="group relative block rounded-lg overflow-hidden bg-zinc-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 h-full">
        {/* Image Container - Fixed aspect ratio 2:3 (poster style) */}
        <div className="relative w-full pb-[150%] overflow-hidden bg-zinc-800">
          <div className="absolute inset-0">
            {!imageError ? (
              <Image
                src={drama.thumbnail}
                alt={drama.title}
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800">
                <ImageOff className="w-12 h-12 text-zinc-600 mb-2" />
                <span className="text-xs text-zinc-500 text-center px-2 line-clamp-2">
                  {drama.title}
                </span>
              </div>
            )}
          </div>

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play Icon on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border-2 border-white/50">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 right-2 z-10">
            <Chip
              size="sm"
              color={drama.status === "ONGOING" ? "success" : "primary"}
              variant="solid"
            >
              {getStatusLabel(drama.status)}
            </Chip>
          </div>

          {/* Episode Count Badge */}
          {drama.totalEpisode && (
            <div className="absolute bottom-2 left-2 z-10">
              <Chip
                size="sm"
                className="bg-black/60 backdrop-blur-sm text-white"
              >
                {drama.totalEpisode} EP
              </Chip>
            </div>
          )}
        </div>

        {/* Info Section - Fixed height */}
        <div className="p-3 min-h-[60px]">
          <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight group-hover:text-red-500 transition-colors">
            {drama.title}
          </h3>

          {showDescription && drama.description && (
            <p className="text-xs text-gray-400 line-clamp-1 mt-1">
              {truncate(drama.description, 50)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
