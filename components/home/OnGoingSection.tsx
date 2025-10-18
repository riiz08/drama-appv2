import Link from "next/link";
import { Tv, ChevronRight } from "lucide-react";
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
  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      aria-labelledby="ongoing-heading"
    >
      {/* Section Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Tv className="w-6 h-6 text-green-500" aria-hidden="true" />
          <h2
            id="ongoing-heading"
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
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
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
  );
}
