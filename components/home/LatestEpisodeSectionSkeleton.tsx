import { Card, CardBody } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import { Clock } from "lucide-react";

function EpisodeCardSkeleton() {
  return (
    <article>
      <Card fullWidth className="bg-zinc-900 border-none">
        <CardBody className="flex flex-row gap-3 p-3">
          {/* Thumbnail Skeleton */}
          <Skeleton className="w-32 h-20 flex-shrink-0 rounded">
            <div className="w-32 h-20 bg-default-300" />
          </Skeleton>

          {/* Info Skeleton */}
          <div className="flex-1 py-1 min-w-0 space-y-2">
            {/* Title */}
            <Skeleton className="w-3/4 rounded">
              <div className="h-4 w-3/4 bg-default-200" />
            </Skeleton>

            {/* Episode number */}
            <Skeleton className="w-1/2 rounded">
              <div className="h-3 w-1/2 bg-default-200" />
            </Skeleton>

            {/* Time */}
            <Skeleton className="w-1/3 rounded">
              <div className="h-3 w-1/3 bg-default-300" />
            </Skeleton>
          </div>
        </CardBody>
      </Card>
    </article>
  );
}

export default function LatestEpisodesSectionSkeleton() {
  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      aria-labelledby="latest-episodes-heading"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Section Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-yellow-500" aria-hidden="true" />
          <h2
            id="latest-episodes-heading"
            className="text-2xl md:text-3xl font-bold text-white"
          >
            Episod Terkini
          </h2>
        </div>
        <Skeleton className="w-24 h-8 rounded">
          <div className="w-24 h-8 bg-default-200" />
        </Skeleton>
      </header>

      {/* Episodes Grid Skeleton */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        role="list"
        aria-label="Memuatkan episod terkini"
      >
        {[...Array(6)].map((_, i) => (
          <div key={i} role="listitem">
            <EpisodeCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}
