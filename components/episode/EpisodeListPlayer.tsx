import Link from "next/link";
import { Play, CheckCircle } from "lucide-react";
import { getEpisodeUrl } from "@/lib/utils";
import { Chip } from "@heroui/chip";
import { Card, CardBody } from "@heroui/card";

interface Episode {
  id: string;
  slug: string;
  episodeNum: number;
  releaseDate: Date;
}

interface EpisodeListPlayerProps {
  episodes: Episode[];
  currentEpisodeNum: number;
  dramaTitle: string;
}

export default function EpisodeListPlayer({
  episodes,
  currentEpisodeNum,
  dramaTitle,
}: EpisodeListPlayerProps) {
  // Sort episodes by episode number
  const sortedEpisodes = [...episodes].sort(
    (a, b) => a.episodeNum - b.episodeNum
  );

  return (
    <section className="space-y-4">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Semua Episode</h2>
        <Chip size="sm" variant="flat" color="default">
          {episodes.length} Episode
        </Chip>
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        {sortedEpisodes.map((episode) => {
          const isCurrent = episode.episodeNum === currentEpisodeNum;

          return (
            <Link
              key={episode.id}
              href={getEpisodeUrl(episode.slug)}
              prefetch={false}
            >
              <Card
                fullWidth
                isPressable={!isCurrent}
                className={`border-none transition-all duration-300 ${
                  isCurrent
                    ? "bg-red-600 cursor-default"
                    : "bg-zinc-900 hover:bg-zinc-800 hover:scale-105"
                }`}
              >
                <CardBody className="p-3 flex flex-col items-center justify-center gap-2">
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCurrent ? "bg-white/20" : "bg-zinc-800"
                    }`}
                  >
                    {isCurrent ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white fill-white" />
                    )}
                  </div>

                  {/* Episode Number */}
                  <p
                    className={`text-xs font-bold ${
                      isCurrent ? "text-white" : "text-gray-300"
                    }`}
                  >
                    EP {episode.episodeNum}
                  </p>

                  {/* Current Badge */}
                  {isCurrent && (
                    <span className="text-[10px] text-center text-white/80">
                      Sedang Ditonton
                    </span>
                  )}
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
