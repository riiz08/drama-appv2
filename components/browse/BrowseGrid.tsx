import DramaCard from "@/components/shared/DramaCard";
import { Search } from "lucide-react";

interface DramaCardType {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  status: "ONGOING" | "TAMAT";
  totalEpisode?: number | null;
  description?: string;
}

interface BrowseGridProps {
  dramas: DramaCardType[];
  query?: string;
}

export default function BrowseGrid({ dramas, query }: BrowseGridProps) {
  // Empty State
  if (dramas.length === 0) {
    return (
      <div
        className="bg-zinc-900 rounded-lg p-12 text-center"
        role="status"
        aria-live="polite"
      >
        <Search
          className="w-16 h-16 text-zinc-600 mx-auto mb-4"
          aria-hidden="true"
        />
        <h2 className="text-xl font-semibold text-white mb-2">
          Tiada Hasil Dijumpai
        </h2>
        <p className="text-gray-400">
          {query
            ? `Tiada drama dijumpai dengan kata kunci "${query}". Cuba cari dengan kata kunci lain.`
            : "Tiada drama yang sepadan dengan penapis anda. Cuba ubah penapis."}
        </p>
      </div>
    );
  }

  // Drama Grid
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
      role="list"
      aria-label={`${dramas.length} drama dijumpai`}
    >
      {dramas.map((drama) => (
        <div key={drama.id} role="listitem">
          <DramaCard drama={drama} />
        </div>
      ))}
    </div>
  );
}
