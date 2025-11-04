// file: components/admin/TopDramasList.tsx
"use client";

import { Eye, TrendingUp } from "lucide-react";
import Image from "next/image";

type Drama = {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  episodes: number;
  views: number;
  trend: string;
};

type Props = {
  dramas: Drama[];
};

export default function TopDramasList({ dramas }: Props) {
  if (!dramas || dramas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Belum ada data drama</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dramas.map((drama, index) => (
        <div
          key={drama.id}
          className="flex items-center gap-4 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          {/* Rank */}
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-zinc-700 rounded-full">
            <span className="text-sm font-bold text-white">{index + 1}</span>
          </div>

          {/* Thumbnail */}
          <div className="flex-shrink-0 w-12 h-16 bg-zinc-700 rounded overflow-hidden relative">
            <Image
              src={drama.thumbnail}
              alt={drama.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {drama.title}
            </h3>
            <p className="text-xs text-gray-400">{drama.episodes} Episode</p>
          </div>

          {/* Stats */}
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-1 text-gray-300 mb-1">
              <Eye className="w-3 h-3" />
              <span className="text-sm font-medium">
                {drama.views.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1 text-green-500">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs">{drama.trend}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Note */}
      <p className="text-xs text-gray-500 text-center pt-2">
        📊 Data drama dari database (views & trend masih mock)
      </p>
    </div>
  );
}
