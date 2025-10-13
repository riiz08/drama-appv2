import Link from "next/link";
import { Play } from "lucide-react";
import { getEpisodeUrl, formatDate } from "@/lib/utils";
import { Chip } from "@heroui/chip";
import { Card, CardBody } from "@heroui/card";

interface Episode {
  id: string;
  slug: string;
  episodeNum: number;
  releaseDate: Date;
}

interface EpisodeListProps {
  episodes: Episode[];
  dramaTitle: string;
}

export default function EpisodeList({
  episodes,
  dramaTitle,
}: EpisodeListProps) {
  if (episodes.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Daftar Episode</h2>
        <div className="bg-zinc-900 rounded-lg p-8 text-center">
          <p className="text-gray-400">Belum ada episode tersedia</p>
        </div>
      </section>
    );
  }

  // Sort episodes by episode number
  const sortedEpisodes = [...episodes].sort(
    (a, b) => a.episodeNum - b.episodeNum
  );

  return (
    <section className="space-y-4">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Daftar Episode</h2>
        <Chip size="sm" variant="flat" color="default">
          {episodes.length} Episode
        </Chip>
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {sortedEpisodes.map((episode) => (
          <Link key={episode.id} href={getEpisodeUrl(episode.slug)}>
            <Card
              isPressable
              isHoverable
              fullWidth
              className="group bg-zinc-900 border-none hover:bg-red-600 transition-all duration-300 hover:scale-105"
            >
              <CardBody className="p-4 flex flex-col items-center justify-center gap-2">
                {/* Play Icon */}
                <div className="w-12 h-12 rounded-full bg-zinc-800 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>

                {/* Episode Number */}
                <div className="text-center">
                  <p className="text-white font-bold text-sm">
                    Episode {episode.episodeNum}
                  </p>
                  <p className="text-xs text-gray-400 group-hover:text-white/80 mt-1">
                    {formatDate(episode.releaseDate, "id-ID")}
                  </p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
