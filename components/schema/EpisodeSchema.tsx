// components/schema/EpisodeSchema.tsx
import { TVEpisode, WithContext } from "schema-dts";

interface EpisodeSchemaProps {
  episode: {
    episodeNum: number;
    slug: string;
    releaseDate: Date | string;
    videoUrl: string;
    drama: {
      title: string;
      slug: string;
      description: string;
      thumbnail: string;
      totalEpisode?: number | null;
      production?: {
        name: string;
      } | null;
      dramaCasts?: Array<{
        cast: {
          name: string;
        };
        character?: string | null;
      }>;
      dramaDirectors?: Array<{
        director: {
          name: string;
        };
      }>;
      dramaWriters?: Array<{
        writer: {
          name: string;
        };
      }>;
      dramaNetworks?: Array<{
        network: {
          name: string;
        };
      }>;
    };
  };
}

export function EpisodeSchema({ episode }: EpisodeSchemaProps) {
  const releaseDate =
    episode.releaseDate instanceof Date
      ? episode.releaseDate.toISOString().split("T")[0]
      : new Date(episode.releaseDate).toISOString().split("T")[0];

  // Build actors array
  const actors =
    episode.drama.dramaCasts?.map((item) => ({
      "@type": "Person" as const,
      name: item.cast.name,
      ...(item.character && { characterName: item.character }),
    })) || [];

  // Build directors array
  const directors =
    episode.drama.dramaDirectors?.map((item) => ({
      "@type": "Person" as const,
      name: item.director.name,
    })) || [];

  // Build writers array (for series level)
  const writers =
    episode.drama.dramaWriters?.map((item) => ({
      "@type": "Person" as const,
      name: item.writer.name,
    })) || [];

  // Build production company
  const productionCompany = episode.drama.production
    ? {
        "@type": "Organization" as const,
        name: episode.drama.production.name,
      }
    : undefined;

  // Build broadcast networks
  const broadcastNetworks =
    episode.drama.dramaNetworks?.map((item) => ({
      "@type": "BroadcastService" as const,
      name: item.network.name,
      broadcastDisplayName: item.network.name,
    })) || [];

  const schema: WithContext<TVEpisode> = {
    "@context": "https://schema.org",
    "@type": "TVEpisode",
    name: `${episode.drama.title} - Episod ${episode.episodeNum}`,
    episodeNumber: episode.episodeNum,
    description: `Tonton ${episode.drama.title} Episod ${episode.episodeNum} online percuma dalam kualiti HD. ${episode.drama.description}`,
    datePublished: releaseDate,
    url: `https://mangeakkk.my.id/${episode.slug}`,
    image: episode.drama.thumbnail,
    inLanguage: "ms-MY",

    // ✅ Add actors if available
    ...(actors.length > 0 && { actor: actors }),

    // ✅ Add directors if available
    ...(directors.length > 0 && { director: directors }),

    // ✅ Add video object for better SEO
    video: {
      "@type": "VideoObject",
      name: `${episode.drama.title} Episod ${episode.episodeNum}`,
      description: `Streaming ${episode.drama.title} Episod ${episode.episodeNum}`,
      thumbnailUrl: episode.drama.thumbnail,
      uploadDate: releaseDate,
      contentUrl: episode.videoUrl,
      embedUrl: `https://mangeakkk.my.id/${episode.slug}`,
    },

    partOfSeries: {
      "@type": "TVSeries",
      name: episode.drama.title,
      url: `https://mangeakkk.my.id/drama/${episode.drama.slug}`,
      description: episode.drama.description,
      image: episode.drama.thumbnail,
      inLanguage: "ms-MY",

      // ✅ Add production company
      ...(productionCompany && { productionCompany }),

      // ✅ Add creators/writers
      ...(writers.length > 0 && { creator: writers }),

      // ✅ Add actors to series level too
      ...(actors.length > 0 && { actor: actors }),

      // ✅ Add directors to series level
      ...(directors.length > 0 && { director: directors }),

      // ✅ Add broadcast networks
      ...(broadcastNetworks.length > 0 && {
        containedInPlace: broadcastNetworks,
      }),

      ...(episode.drama.totalEpisode && {
        numberOfEpisodes: episode.drama.totalEpisode,
      }),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
