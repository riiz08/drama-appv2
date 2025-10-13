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
    <section className="space-y-4">
      {/* Section Title */}
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-white">Drama Terkait</h2>
      </div>

      {/* Drama Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {dramas.map((drama) => (
          <DramaCard key={drama.id} drama={drama} />
        ))}
      </div>
    </section>
  );
}
