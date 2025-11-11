import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getEpisodeUrl } from "@/lib/utils";
import { Button } from "@heroui/button";

interface EpisodeNavigationProps {
  prev: {
    slug: string;
    episodeNum: number;
  } | null;
  next: {
    slug: string;
    episodeNum: number;
  } | null;
  dramaSlug: string;
}

export default function EpisodeNavigation({
  prev,
  next,
  dramaSlug,
}: EpisodeNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Previous Episode Button */}
      {prev ? (
        <Button
          as={Link}
          href={getEpisodeUrl(prev.slug)}
          prefetch={false}
          variant="bordered"
          size="lg"
          startContent={<ChevronLeft className="w-5 h-5" />}
          className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
        >
          <div className="text-left">
            <p className="text-xs text-gray-400">Sebelumnya</p>
            <p className="text-sm font-semibold">Episode {prev.episodeNum}</p>
          </div>
        </Button>
      ) : (
        <Button
          isDisabled
          variant="bordered"
          size="lg"
          startContent={<ChevronLeft className="w-5 h-5" />}
          className="flex-1 border-zinc-800 text-gray-600"
        >
          <div className="text-left">
            <p className="text-xs">Tidak ada</p>
            <p className="text-sm font-semibold">Episode sebelumnya</p>
          </div>
        </Button>
      )}

      {/* Next Episode Button */}
      {next ? (
        <Button
          as={Link}
          href={getEpisodeUrl(next.slug)}
          prefetch={false}
          color="danger"
          size="lg"
          endContent={<ChevronRight className="w-5 h-5" />}
          className="flex-1"
        >
          <div className="text-right">
            <p className="text-xs text-white/80">Selanjutnya</p>
            <p className="text-sm font-semibold">Episode {next.episodeNum}</p>
          </div>
        </Button>
      ) : (
        <Button
          isDisabled
          variant="bordered"
          size="lg"
          endContent={<ChevronRight className="w-5 h-5" />}
          className="flex-1 border-zinc-800 text-gray-600"
        >
          <div className="text-right">
            <p className="text-xs">Tidak ada</p>
            <p className="text-sm font-semibold">Episode selanjutnya</p>
          </div>
        </Button>
      )}
    </div>
  );
}
