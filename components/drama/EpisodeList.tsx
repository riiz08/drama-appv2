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
      <div className="space-y-4">
        <h2 id="episodes-heading" className="text-2xl font-bold text-white">
          Senarai Episod
        </h2>
        <div className="bg-zinc-900 rounded-lg p-8 text-center" role="status">
          <p className="text-gray-400">Belum ada episod tersedia</p>
        </div>
      </div>
    );
  }

  // Sort episodes by episode number (descending - latest first)
  // const sortedEpisodes = [...episodes].sort(
  //   (a, b) => b.episodeNum - a.episodeNum
  // );

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <header className="flex items-center justify-between">
        <h2 id="episodes-heading" className="text-2xl font-bold text-white">
          Senarai Episod
        </h2>
        <Chip
          size="sm"
          variant="flat"
          color="default"
          aria-label={`${episodes.length} episod tersedia`}
        >
          {episodes.length} Episod
        </Chip>
      </header>

      {/* Episodes Grid */}
      <nav
        aria-label="Pilih episod untuk ditonton"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
        role="list"
      >
        {episodes.map((episode) => {
          const episodeUrl = getEpisodeUrl(episode.slug);
          const releaseDate = new Date(episode.releaseDate);

          return (
            <article key={episode.id} role="listitem">
              <Link
                href={episodeUrl}
                aria-label={`Tonton ${dramaTitle} Episod ${episode.episodeNum} - ${formatDate(episode.releaseDate, "ms-MY")}`}
              >
                <Card
                  isPressable
                  isHoverable
                  fullWidth
                  className="group bg-zinc-900 border-none hover:bg-red-600 transition-all duration-300 hover:scale-105"
                >
                  <CardBody className="p-4 flex flex-col items-center justify-center gap-2">
                    {/* Play Icon */}
                    <div
                      className="w-12 h-12 rounded-full bg-zinc-800 group-hover:bg-white/20 flex items-center justify-center transition-colors"
                      aria-hidden="true"
                    >
                      <Play
                        className="w-6 h-6 text-white fill-white"
                        aria-hidden="true"
                      />
                    </div>

                    {/* Episode Number */}
                    <div className="text-center">
                      <p className="text-white font-bold text-sm">
                        Episod {episode.episodeNum}
                      </p>
                      <time
                        className="text-xs text-gray-400 group-hover:text-white/80 mt-1 block"
                        dateTime={releaseDate.toISOString()}
                      >
                        {formatDate(episode.releaseDate, "ms-MY")}
                      </time>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </article>
          );
        })}
      </nav>
    </div>
  );
}
