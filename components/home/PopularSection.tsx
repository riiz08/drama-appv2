import Link from "next/link";
import { TrendingUp, ChevronRight } from "lucide-react";
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

interface PopularSectionProps {
  dramas: DramaCardType[];
}

export default function PopularSection({ dramas }: PopularSectionProps) {
  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      aria-labelledby="popular-heading"
    >
      {/* Section Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-red-500" aria-hidden="true" />
          <h2
            id="popular-heading"
            className="text-2xl md:text-3xl font-bold text-white"
          >
            Drama Melayu Popular
          </h2>
        </div>
        <Button
          as={Link}
          prefetch={false}
          href="/drama?sort=popular"
          variant="light"
          size="sm"
          endContent={<ChevronRight className="w-4 h-4" aria-hidden="true" />}
          className="text-gray-400 hover:text-white"
          aria-label="Lihat semua drama popular"
        >
          Lihat Semua
        </Button>
      </header>

      {/* Drama Grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
        role="list"
        aria-label="Senarai drama popular"
      >
        {dramas.map((drama) => (
          <div key={drama.id} role="listitem">
            <DramaCard drama={drama} />
          </div>
        ))}
      </div>
    </section>
  );
}
