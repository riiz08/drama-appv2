"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  ArrowLeft,
  Hash,
  ImageOff,
  Tv2,
  Users,
  Clapperboard,
  Pencil,
  BookOpen,
  Building2,
  Tv as TvIcon,
} from "lucide-react";
import { getDramaUrl, formatDate, getStatusLabel } from "@/lib/utils";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Accordion, AccordionItem } from "@heroui/accordion";
import AdWrapper from "../ads/AdWrapper";
import { ADSENSE_CONFIG } from "@/lib/adsense-config";

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
      airTime?: string | null;
      production?: {
        id: string;
        name: string;
      } | null;
      casts?: Array<{
        id: string;
        character: string | null;
        cast: {
          id: string;
          name: string;
        };
      }>;
      directors?: Array<{
        id: string;
        director: {
          id: string;
          name: string;
        };
      }>;
      writers?: Array<{
        id: string;
        writer: {
          id: string;
          name: string;
        };
      }>;
      novelAuthors?: Array<{
        id: string;
        novelTitle: string | null;
        novelAuthor: {
          id: string;
          name: string;
        };
      }>;
      networks?: Array<{
        id: string;
        network: {
          id: string;
          name: string;
        };
      }>;
    };
  };
}

export default function EpisodeInfo({ episode }: EpisodeInfoProps) {
  const [imageError, setImageError] = useState(false);
  const statusLabel = getStatusLabel(episode.drama.status);
  const dramaUrl = getDramaUrl(episode.drama.slug);

  // Check if has credits
  const hasCredits =
    (episode.drama.casts && episode.drama.casts.length > 0) ||
    (episode.drama.directors && episode.drama.directors.length > 0) ||
    (episode.drama.writers && episode.drama.writers.length > 0) ||
    (episode.drama.novelAuthors && episode.drama.novelAuthors.length > 0) ||
    episode.drama.production ||
    (episode.drama.networks && episode.drama.networks.length > 0);

  return (
    <div className="relative w-full bg-black">
      {/* Background Blur Effect */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {!imageError && (
          <>
            <div className="absolute inset-0 scale-110 blur-2xl opacity-20">
              <Image
                src={episode.drama.thumbnail}
                alt=""
                fill
                className="object-cover"
                priority
                onError={() => setImageError(true)}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <figure className="relative w-64 h-96 rounded-lg overflow-hidden shadow-2xl bg-zinc-900">
              {!imageError ? (
                <Image
                  src={episode.drama.thumbnail}
                  alt={`Poster ${episode.drama.title} Episod ${episode.episodeNum}`}
                  title={`Tonton ${episode.drama.title} Episod ${episode.episodeNum} Online`}
                  fill
                  priority
                  fetchPriority="high"
                  className="object-cover"
                  sizes="256px"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800"
                  role="img"
                  aria-label={`Poster ${episode.drama.title} tidak tersedia`}
                >
                  <ImageOff
                    className="w-16 h-16 text-zinc-600 mb-2"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-zinc-500 text-center px-4">
                    {episode.drama.title}
                  </span>
                </div>
              )}
            </figure>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            {/* Back Button */}
            <nav aria-label="Kembali ke halaman drama">
              <Button
                as={Link}
                prefetch={false}
                href={dramaUrl}
                variant="light"
                size="sm"
                startContent={
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                }
                className="text-gray-400 hover:text-white"
                aria-label={`Kembali ke halaman ${episode.drama.title}`}
              >
                Kembali ke Drama
              </Button>
            </nav>

            {/* Title & Episode Number */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                {episode.drama.title} full episod {episode.episodeNum} tonton
                drama video
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  size="md"
                  color="danger"
                  variant="solid"
                  aria-label={`Episod ${episode.episodeNum}`}
                >
                  Episod {episode.episodeNum}
                </Chip>
                <Chip
                  size="md"
                  color={
                    episode.drama.status === "ONGOING" ? "success" : "primary"
                  }
                  variant="flat"
                  aria-label={`Status: ${statusLabel}`}
                >
                  {statusLabel}
                </Chip>
              </div>
            </div>

            {/* Meta Information */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Release Date */}
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-5 h-5 text-red-500" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-gray-500">Tarikh Tayangan</dt>
                  <dd className="text-sm font-medium">
                    <time
                      dateTime={new Date(episode.releaseDate).toISOString()}
                    >
                      {formatDate(episode.releaseDate)}
                    </time>
                  </dd>
                </div>
              </div>

              {/* Total Episodes */}
              {episode.drama.totalEpisode && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Tv2 className="w-5 h-5 text-red-500" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-gray-500">Jumlah Episod</dt>
                    <dd className="text-sm font-medium">
                      {episode.episodeNum} daripada {episode.drama.totalEpisode}{" "}
                      Episod
                    </dd>
                  </div>
                </div>
              )}

              {/* Production */}
              {episode.drama.production && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Building2
                    className="w-5 h-5 text-red-500"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-xs text-gray-500">Produksi</dt>
                    <dd className="text-sm font-medium">
                      {episode.drama.production.name}
                    </dd>
                  </div>
                </div>
              )}

              {/* Networks */}
              {episode.drama.networks && episode.drama.networks.length > 0 && (
                <div className="flex items-center gap-3 text-gray-300">
                  <TvIcon className="w-5 h-5 text-red-500" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-gray-500">Rangkaian</dt>
                    <dd className="text-sm font-medium">
                      {episode.drama.networks
                        .map((n) => n.network.name)
                        .join(", ")}
                    </dd>
                  </div>
                </div>
              )}
            </dl>

            <AdWrapper slot={ADSENSE_CONFIG.slots.hads1} format="auto" />

            {/* Description */}
            <article className="pt-2 border-t border-zinc-800">
              <h2 className="text-sm font-semibold text-white mb-2">
                Tentang Drama
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                {episode.drama.description}
              </p>
            </article>

            {/* Credits Accordion */}
            {hasCredits && (
              <div className="pt-2 border-t border-zinc-800">
                <Accordion
                  variant="bordered"
                  className="px-0"
                  itemClasses={{
                    base: "bg-zinc-900/50 border-zinc-800",
                    title: "text-white font-semibold text-sm",
                    trigger: "py-3 px-4",
                    content: "px-4 pb-4 text-sm",
                  }}
                >
                  <AccordionItem
                    key="credits"
                    aria-label="Kredit & Pelakon"
                    title="Kredit & Pelakon"
                    startContent={<Users className="w-4 h-4 text-red-500" />}
                  >
                    <div className="space-y-4">
                      {/* Cast */}
                      {episode.drama.casts &&
                        episode.drama.casts.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Users
                                className="w-4 h-4 text-red-500"
                                aria-hidden="true"
                              />
                              <h3 className="font-semibold text-white">
                                Pelakon
                              </h3>
                            </div>
                            <div className="space-y-1 text-gray-400">
                              {episode.drama.casts.map((item) => (
                                <p key={item.id}>
                                  <span className="text-white">
                                    {item.cast.name}
                                  </span>
                                  {item.character && (
                                    <span className="text-gray-500">
                                      {" "}
                                      sebagai {item.character}
                                    </span>
                                  )}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Directors */}
                      {episode.drama.directors &&
                        episode.drama.directors.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Clapperboard
                                className="w-4 h-4 text-red-500"
                                aria-hidden="true"
                              />
                              <h3 className="font-semibold text-white">
                                Pengarah
                              </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {episode.drama.directors.map((item) => (
                                <Chip
                                  key={item.id}
                                  size="sm"
                                  variant="flat"
                                  className="bg-zinc-800 text-white"
                                >
                                  {item.director.name}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Writers */}
                      {episode.drama.writers &&
                        episode.drama.writers.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Pencil
                                className="w-4 h-4 text-red-500"
                                aria-hidden="true"
                              />
                              <h3 className="font-semibold text-white">
                                Penulis
                              </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {episode.drama.writers.map((item) => (
                                <Chip
                                  key={item.id}
                                  size="sm"
                                  variant="flat"
                                  className="bg-zinc-800 text-white"
                                >
                                  {item.writer.name}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Novel Authors */}
                      {episode.drama.novelAuthors &&
                        episode.drama.novelAuthors.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen
                                className="w-4 h-4 text-red-500"
                                aria-hidden="true"
                              />
                              <h3 className="font-semibold text-white">
                                Penulis Novel
                              </h3>
                            </div>
                            <div className="space-y-1 text-gray-400">
                              {episode.drama.novelAuthors.map((item) => (
                                <p key={item.id}>
                                  <span className="text-white">
                                    {item.novelAuthor.name}
                                  </span>
                                  {item.novelTitle && (
                                    <span className="text-gray-500 italic">
                                      {" "}
                                      - "{item.novelTitle}"
                                    </span>
                                  )}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

            {/* Tags - SEO Keywords */}
            <nav aria-label="Kata kunci berkaitan">
              <div className="flex flex-wrap gap-2">
                <Chip
                  size="sm"
                  variant="flat"
                  startContent={<Hash className="w-3 h-3" aria-hidden="true" />}
                  aria-label={`Tag: ${episode.drama.title}`}
                >
                  {episode.drama.title}
                </Chip>
                <Chip
                  size="sm"
                  variant="flat"
                  startContent={<Hash className="w-3 h-3" aria-hidden="true" />}
                  aria-label={`Tag: episod ${episode.episodeNum}`}
                >
                  Episod {episode.episodeNum}
                </Chip>
                <Chip
                  size="sm"
                  variant="flat"
                  startContent={<Hash className="w-3 h-3" aria-hidden="true" />}
                  aria-label="Tag: drama melayu"
                >
                  Drama Melayu
                </Chip>
                <Chip
                  size="sm"
                  variant="flat"
                  startContent={<Hash className="w-3 h-3" aria-hidden="true" />}
                  aria-label={`Tag: ${statusLabel.toLowerCase()}`}
                >
                  {statusLabel}
                </Chip>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
