"use client";

import { Users, Clapperboard, Pencil, BookOpen } from "lucide-react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";

interface DramaCreditsProps {
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
}

export default function DramaCredits({
  casts = [],
  directors = [],
  writers = [],
  novelAuthors = [],
}: DramaCreditsProps) {
  // Don't render if no credits available
  const hasCredits =
    casts.length > 0 ||
    directors.length > 0 ||
    writers.length > 0 ||
    novelAuthors.length > 0;

  if (!hasCredits) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-white">
        Kredit & Pelakon
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cast Section */}
        {casts.length > 0 && (
          <Card className="bg-zinc-900/50 border border-zinc-800">
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-red-500" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-white">Pelakon</h3>
              </div>
              <div className="space-y-3">
                {casts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 py-2 border-b border-zinc-800 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {item.cast.name}
                      </p>
                      {item.character && (
                        <p className="text-sm text-gray-400 truncate">
                          sebagai {item.character}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Directors Section */}
        {directors.length > 0 && (
          <Card className="bg-zinc-900/50 border border-zinc-800">
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clapperboard
                  className="w-5 h-5 text-red-500"
                  aria-hidden="true"
                />
                <h3 className="text-lg font-semibold text-white">Pengarah</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {directors.map((item) => (
                  <Chip
                    key={item.id}
                    variant="flat"
                    className="bg-zinc-800 text-white"
                  >
                    {item.director.name}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Writers Section */}
        {writers.length > 0 && (
          <Card className="bg-zinc-900/50 border border-zinc-800">
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Pencil className="w-5 h-5 text-red-500" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-white">Penulis</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {writers.map((item) => (
                  <Chip
                    key={item.id}
                    variant="flat"
                    className="bg-zinc-800 text-white"
                  >
                    {item.writer.name}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Novel Authors Section */}
        {novelAuthors.length > 0 && (
          <Card className="bg-zinc-900/50 border border-zinc-800">
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-red-500" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-white">Novel Asal</h3>
              </div>
              <div className="space-y-3">
                {novelAuthors.map((item) => (
                  <div
                    key={item.id}
                    className="py-2 border-b border-zinc-800 last:border-0"
                  >
                    <p className="font-medium text-white">
                      {item.novelAuthor.name}
                    </p>
                    {item.novelTitle && (
                      <p className="text-sm text-gray-400 italic">
                        "{item.novelTitle}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
