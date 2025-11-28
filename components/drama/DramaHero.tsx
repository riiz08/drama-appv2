"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Tv2,
  Clock,
  ImageOff,
  Hash,
  Building2,
  Tv,
  Users,
  Clapperboard,
  Pencil,
  BookOpen,
} from "lucide-react";
import { formatDate, getStatusLabel } from "@/lib/utils";
import { Chip } from "@heroui/chip";
import { Accordion, AccordionItem } from "@heroui/accordion";
import AdWrapper from "../ads/AdWrapper";
import { ADSENSE_CONFIG } from "@/lib/adsense-config";

interface DramaHeroProps {
  drama: {
    title: string;
    thumbnail: string;
    description: string;
    releaseDate: Date;
    status: "ONGOING" | "TAMAT";
    totalEpisode: number | null;
    airTime: string | null;
    slug: string;
    production?: {
      id: string;
      name: string;
    } | null;
    dramaNetworks?: Array<{
      id: string;
      network: {
        id: string;
        name: string;
      };
    }>;
    // ✅ Added cast, director, writer, novel author
    dramaCasts?: Array<{
      id: string;
      character: string | null;
      cast: {
        id: string;
        name: string;
      };
    }>;
    dramaDirectors?: Array<{
      id: string;
      director: {
        id: string;
        name: string;
      };
    }>;
    dramaWriters?: Array<{
      id: string;
      writer: {
        id: string;
        name: string;
      };
    }>;
    dramaNovelAuthor?: Array<{
      id: string;
      novelTitle: string | null;
      novelAuthor: {
        id: string;
        name: string;
      };
    }>;
  };
}

export default function DramaHero({ drama }: DramaHeroProps) {
  const [imageError, setImageError] = useState(false);
  const statusLabel = getStatusLabel(drama.status);

  // ✅ Check if has credits
  const hasCredits =
    (drama.dramaCasts && drama.dramaCasts.length > 0) ||
    (drama.dramaDirectors && drama.dramaDirectors.length > 0) ||
    (drama.dramaWriters && drama.dramaWriters.length > 0) ||
    (drama.dramaNovelAuthor && drama.dramaNovelAuthor.length > 0);

  return (
    <div className="relative w-full bg-black">
      {/* Background Blur Effect */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {!imageError && (
          <>
            <div className="absolute inset-0 scale-110 blur-2xl opacity-20">
              <Image
                src={drama.thumbnail}
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <figure className="relative w-64 h-96 rounded-lg overflow-hidden shadow-2xl bg-zinc-900">
              {!imageError ? (
                <Image
                  src={drama.thumbnail}
                  alt={`Poster ${drama.title} - Drama Melayu ${statusLabel}`}
                  title={`Tonton ${drama.title} Online Percuma`}
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
                  aria-label={`Poster ${drama.title} tidak tersedia`}
                >
                  <ImageOff
                    className="w-16 h-16 text-zinc-600 mb-2"
                    aria-hidden="true"
                  />

                  <span className="text-sm text-zinc-500 text-center px-4">
                    {drama.title}
                  </span>
                </div>
              )}
            </figure>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            {/* Title & Status */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                Drama melayu {drama.title} - Tonton full episod HD
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  size="md"
                  color={drama.status === "ONGOING" ? "success" : "primary"}
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
                    <time dateTime={new Date(drama.releaseDate).toISOString()}>
                      {formatDate(drama.releaseDate)}
                    </time>
                  </dd>
                </div>
              </div>

              {/* Total Episodes */}
              {drama.totalEpisode && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Tv2 className="w-5 h-5 text-red-500" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-gray-500">Jumlah Episod</dt>
                    <dd className="text-sm font-medium">
                      {drama.totalEpisode} Episod
                    </dd>
                  </div>
                </div>
              )}

              {/* Air Time */}
              {drama.airTime && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Clock className="w-5 h-5 text-red-500" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-gray-500">Jadual Tayangan</dt>
                    <dd className="text-sm font-medium">{drama.airTime}</dd>
                  </div>
                </div>
              )}

              {/* Production */}
              {drama.production && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Building2
                    className="w-5 h-5 text-red-500"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-xs text-gray-500">Produksi</dt>
                    <dd className="text-sm font-medium">
                      {drama.production.name}
                    </dd>
                  </div>
                </div>
              )}

              {/* Networks */}
              {drama.dramaNetworks && drama.dramaNetworks.length > 0 && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Tv className="w-5 h-5 text-red-500" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-gray-500">Rangkaian</dt>
                    <dd className="text-sm font-medium">
                      {drama.dramaNetworks
                        .map((n) => n.network.name)
                        .join(", ")}
                    </dd>
                  </div>
                </div>
              )}
            </dl>

            {/* ✅ Description */}
            <article className="pt-2 border-t border-zinc-800">
              <h2 className="text-sm font-semibold text-white mb-2">
                Sinopsis
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                {drama.description}
              </p>
            </article>

            {/* ✅ Credits Accordion */}
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
                      {drama.dramaCasts && drama.dramaCasts.length > 0 && (
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
                            {drama.dramaCasts.map((item) => (
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
                      {drama.dramaDirectors &&
                        drama.dramaDirectors.length > 0 && (
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
                              {drama.dramaDirectors.map((item) => (
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
                      {drama.dramaWriters && drama.dramaWriters.length > 0 && (
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
                            {drama.dramaWriters.map((item) => (
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
                      {drama.dramaNovelAuthor &&
                        drama.dramaNovelAuthor.length > 0 && (
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
                              {drama.dramaNovelAuthor.map((item) => (
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
                  aria-label={`Tag: ${drama.title}`}
                >
                  {drama.title}
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
                  aria-label="Tag: episod penuh"
                >
                  Episod Penuh
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
