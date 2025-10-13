import { Chip } from "@heroui/chip";
import { Search, Tv, CheckCircle } from "lucide-react";

interface BrowseHeaderProps {
  query?: string;
  status?: "ONGOING" | "TAMAT";
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
        icon: <Search className="w-8 h-8 text-red-500" />,
        title: `Hasil Pencarian: "${query}"`,
      };
    }

    if (status === "ONGOING") {
      return {
        icon: <Tv className="w-8 h-8 text-green-500" />,
        title: "Drama Sedang Tayang",
      };
    }

    if (status === "TAMAT") {
      return {
        icon: <CheckCircle className="w-8 h-8 text-blue-500" />,
        title: "Drama Selesai",
      };
    }

    return {
      icon: <Search className="w-8 h-8 text-red-500" />,
      title: "Jelajahi Drama Malaysia",
    };
  };

  const { icon, title } = getHeaderContent();

  return (
    <div className="space-y-3">
      {/* Title with Icon */}
      <div className="flex items-center gap-4">
        {icon}
        <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
      </div>

      {/* Result Count */}
      <div className="flex items-center gap-3">
        <Chip size="md" variant="flat" color="default">
          {total} Drama Ditemukan
        </Chip>
      </div>
    </div>
  );
}
