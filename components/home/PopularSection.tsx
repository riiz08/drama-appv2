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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Drama Popular
          </h2>
        </div>
        <Button
          as={Link}
          href="/browse?sort=popular"
          variant="light"
          size="sm"
          endContent={<ChevronRight className="w-4 h-4" />}
          className="text-gray-400 hover:text-white"
        >
          Lihat Semua
        </Button>
      </div>

      {/* Drama Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {dramas.map((drama) => (
          <DramaCard key={drama.id} drama={drama} />
        ))}
      </div>
    </section>
  );
}
