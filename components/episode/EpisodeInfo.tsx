import Link from "next/link";
import { Calendar, ArrowLeft, Hash } from "lucide-react";
import { getDramaUrl, formatDate, getStatusLabel } from "@/lib/utils";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import Image from "next/image";

interface EpisodeInfoProps {
  episode: {
    episodeNum: number;
    releaseDate: Date;
    slug: string;
    drama: {
      title: string;
      slug: string;
      description: string;
      status: "ONGOING" | "TAMAT";
      totalEpisode: number | null;
      thumbnail: string;
    };
  };
}

export default function EpisodeInfo({ episode }: EpisodeInfoProps) {
  return (
    <Card className="bg-zinc-900 border-none">
      <CardBody className="p-6 space-y-4">
        {/* Back to Drama Button */}
        <div>
          <Button
            as={Link}
            href={getDramaUrl(episode.drama.slug)}
            variant="light"
            size="sm"
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="text-gray-400 hover:text-white"
          >
            Kembali ke Drama
          </Button>
        </div>

        {/* Title & Episode Number */}
        <div className="space-y-2">
          <Image
            src={episode.drama.thumbnail}
            alt="{episode.drama.title}"
            loading="lazy"
            width={300}
            height={250}
            className="mx-auto py-4 rounded-xl"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {episode.drama.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <Chip size="md" color="danger" variant="solid">
              Episode {episode.episodeNum}
            </Chip>
            <Chip
              size="md"
              color={episode.drama.status === "ONGOING" ? "success" : "primary"}
              variant="flat"
            >
              {getStatusLabel(episode.drama.status)}
            </Chip>
            {episode.drama.totalEpisode && (
              <span className="text-sm text-gray-400">
                dari {episode.drama.totalEpisode} Episode
              </span>
            )}
          </div>
        </div>

        {/* Release Date */}
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            Dirilis: {formatDate(episode.releaseDate)}
          </span>
        </div>

        {/* Tags */}
        <div>
          <Chip
            as={Link}
            href={`/drama/${episode.drama.slug}`}
            startContent={<Hash className="w-4 h-4" />}
          >
            {episode.drama.title}
          </Chip>
          <Chip
            as={Link}
            startContent={<Hash className="w-4 h-4" />}
            href={`/episode/${episode.slug}`}
          >
            {episode.drama.title} episod {episode.episodeNum}
          </Chip>
          <Chip
            as={Link}
            startContent={<Hash className="w-4 h-4" />}
            href={`/`}
          >
            Kepala Bergetar
          </Chip>
          <Chip
            as={Link}
            startContent={<Hash className="w-4 h-4" />}
            href={`/`}
          >
            Basah Jeruk
          </Chip>
        </div>

        {/* Description */}
        <div className="pt-2 border-t border-zinc-800">
          <h3 className="text-sm font-semibold text-white mb-2">
            Tentang Drama
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
            {episode.drama.description}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
