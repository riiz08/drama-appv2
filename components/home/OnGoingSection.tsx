import Link from "next/link";
import { Tv, ChevronRight, Play, Clock } from "lucide-react";
import DramaCard from "@/components/shared/DramaCard";
import { Button } from "@heroui/button";

interface DramaCardType {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  status: "ONGOING" | "TAMAT";
  totalEpisode?: number | null;
  description?: string;
}

interface OngoingSectionProps {
  dramas: DramaCardType[];
}

export default function OngoingSection({ dramas }: OngoingSectionProps) {
  // Limit to 10 items for sidebar
  const displayDramas = dramas.slice(0, 10);

  return (
    <>
      {/* DESKTOP VERSION - List Only (Sidebar) */}
      <section
        className="hidden lg:block"
        aria-labelledby="ongoing-heading-desktop"
      >
        {/* Red Header */}
        <header className="flex items-center justify-between bg-red-600 rounded-t-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-white" aria-hidden="true" />
            <h2
              id="ongoing-heading-desktop"
              className="text-xl font-bold text-white"
            >
              Drama Sedang Tayangan
            </h2>
          </div>
          <button
            className="text-white hover:text-white/80 transition-colors"
            aria-label="Lihat semua drama sedang tayangan"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </header>

        {/* Black Background List */}
        <div
          className="bg-zinc-950 rounded-b-xl px-3 py-2"
          role="list"
          aria-label="Senarai drama sedang tayangan"
        >
          {displayDramas.map((drama) => (
            <Link
              key={drama.id}
              prefetch={false}
              href={`/drama/${drama.slug}`}
              className="flex items-center justify-between py-3 px-2 border-b border-zinc-800 last:border-b-0 hover:bg-zinc-900 transition-colors group"
              role="listitem"
            >
              {/* Left - Play icon and title */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Play
                  className="w-5 h-5 text-red-500 shrink-0"
                  aria-hidden="true"
                />
                <h3 className="text-white font-medium text-base truncate">
                  {drama.title}
                </h3>
              </div>

              {/* Right - Episode badge */}
              <span className="bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full whitespace-nowrap ml-3 shrink-0">
                {drama.totalEpisode
                  ? `Episode ${drama.totalEpisode}`
                  : "TAYANG"}
              </span>
            </Link>
          ))}
        </div>

        {/* View All Link (optional) */}
        {dramas.length > 10 && (
          <Link
            href="/drama?status=ONGOING"
            prefetch={false}
            className="block mt-3 text-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            Lihat {dramas.length - 10} lagi →
          </Link>
        )}
      </section>

      {/* MOBILE VERSION - Card Grid */}
      <section
        className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6"
        aria-labelledby="ongoing-heading-mobile"
      >
        {/* Section Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Tv className="w-6 h-6 text-green-500" aria-hidden="true" />
            <h2
              id="ongoing-heading-mobile"
              className="text-2xl md:text-3xl font-bold text-white"
            >
              Drama Sedang Tayangan
            </h2>
          </div>
          <Button
            as={Link}
            href="/drama?status=ONGOING"
            variant="light"
            size="sm"
            endContent={<ChevronRight className="w-4 h-4" aria-hidden="true" />}
            className="text-gray-400 hover:text-white"
            aria-label="Lihat semua drama sedang tayangan"
          >
            Lihat Semua
          </Button>
        </header>

        {/* Drama Grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6"
          role="list"
          aria-label="Senarai drama sedang tayangan"
        >
          {dramas.map((drama) => (
            <div key={drama.id} role="listitem">
              <DramaCard drama={drama} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
