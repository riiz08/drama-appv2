import { Chip } from "@heroui/chip";
import { Search, Tv, CheckCircle } from "lucide-react";

interface BrowseHeaderProps {
  query?: string;
  status?: string;
  total: number;
}

export default function BrowseHeader({
  query,
  status,
  total,
}: BrowseHeaderProps) {
  // Determine title and icon based on filters
  const getHeaderContent = () => {
    if (query) {
      return {
        icon: <Search className="w-8 h-8 text-red-500" aria-hidden="true" />,
        title: `Hasil Carian: "${query}"`,
        description: `Menunjukkan ${total} drama untuk carian "${query}"`,
      };
    }

    if (status === "ONGOING") {
      return {
        icon: <Tv className="w-8 h-8 text-green-500" aria-hidden="true" />,
        title: "Drama Sedang Tayangan",
        description: `${total} drama yang sedang ditayangkan dengan episod terkini`,
      };
    }

    if (status === "TAMAT") {
      return {
        icon: (
          <CheckCircle className="w-8 h-8 text-blue-500" aria-hidden="true" />
        ),
        title: "Drama Sudah Tamat",
        description: `${total} drama lengkap dengan semua episod`,
      };
    }

    return {
      icon: <Search className="w-8 h-8 text-red-500" aria-hidden="true" />,
      title: "Senarai Drama Melayu Terkini",
      description: `Terokai ${total} drama Melayu terlengkap`,
    };
  };

  const { icon, title, description } = getHeaderContent();

  return (
    <div className="space-y-3">
      {/* Title with Icon */}
      <div className="flex items-center gap-4">
        {icon}
        <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
      </div>

      {/* Description - Better for SEO */}
      <p className="text-gray-400 text-base">{description}</p>

      {/* Result Count */}
      <div className="flex items-center gap-3">
        <Chip
          size="md"
          variant="flat"
          color="default"
          aria-label={`${total} drama dijumpai`}
        >
          {total} Drama Dijumpai
        </Chip>
      </div>
    </div>
  );
}
