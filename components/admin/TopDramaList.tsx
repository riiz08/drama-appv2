// file: components/admin/TopDramasList.tsx
"use client";

import { Eye, TrendingUp } from "lucide-react";
import Image from "next/image";

// Mock data - nanti ganti dengan real data dari Supabase
const mockTopDramas = [
  {
    id: 1,
    title: "Toksik Cinta",
    thumbnail: "https://cdn.mangeakkk.my.id/toksik-cinta/toksik-cinta.webp",
    views: 12450,
    trend: "+15%",
    episodes: 30,
  },
  {
    id: 2,
    title: "Cinta Dalam Diam",
    thumbnail: "https://via.placeholder.com/80x120/1e293b/64748b?text=Drama+2",
    views: 10230,
    trend: "+12%",
    episodes: 25,
  },
  {
    id: 3,
    title: "Jejak Cinta",
    thumbnail: "https://via.placeholder.com/80x120/1e293b/64748b?text=Drama+3",
    views: 8900,
    trend: "+8%",
    episodes: 20,
  },
  {
    id: 4,
    title: "Senyuman Terindah",
    thumbnail: "https://via.placeholder.com/80x120/1e293b/64748b?text=Drama+4",
    views: 7650,
    trend: "+5%",
    episodes: 18,
  },
  {
    id: 5,
    title: "Cinta di Ujung Senja",
    thumbnail: "https://via.placeholder.com/80x120/1e293b/64748b?text=Drama+5",
    views: 6890,
    trend: "+3%",
    episodes: 16,
  },
];

export default function TopDramasList() {
  return (
    <div className="space-y-4">
      {mockTopDramas.map((drama, index) => (
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
        📊 Data mock - akan diganti dengan real data dari database
      </p>
    </div>
  );
}
