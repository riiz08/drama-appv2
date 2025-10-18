import { Sparkles } from "lucide-react";
import DramaCard from "@/components/shared/DramaCard";

interface DramaCardType {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  status: "ONGOING" | "TAMAT";
  totalEpisode?: number | null;
}

interface RelatedDramasProps {
  dramas: DramaCardType[];
}

export default function RelatedDramas({ dramas }: RelatedDramasProps) {
  if (dramas.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <header className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-yellow-500" aria-hidden="true" />
        <h2 id="related-heading" className="text-2xl font-bold text-white">
          Drama Berkaitan
        </h2>
      </header>

      {/* Drama Grid */}
      <nav
        aria-label="Drama yang mungkin anda suka"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        role="list"
      >
        {dramas.map((drama) => (
          <div key={drama.id} role="listitem">
            <DramaCard drama={drama} />
          </div>
        ))}
      </nav>
    </div>
  );
}
