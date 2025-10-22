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
    };
  };
}

export function EpisodeSchema({ episode }: EpisodeSchemaProps) {
  const releaseDate =
    episode.releaseDate instanceof Date
      ? episode.releaseDate.toISOString().split("T")[0]
      : new Date(episode.releaseDate).toISOString().split("T")[0];

  const schema: WithContext<TVEpisode> = {
    "@context": "https://schema.org",
    "@type": "TVEpisode",
    name: `${episode.drama.title} - Episod ${episode.episodeNum}`,
    episodeNumber: episode.episodeNum,
    description: `Tonton ${episode.drama.title} Episod ${episode.episodeNum} online percuma dalam kualiti HD. ${episode.drama.description}`,
    datePublished: releaseDate,
    url: `https://mangeakkk.my.id/episode/${episode.slug}`,
    image: episode.drama.thumbnail,
    inLanguage: "ms-MY",
    partOfSeries: {
      "@type": "TVSeries",
      name: episode.drama.title,
      url: `https://mangeakkk.my.id/drama/${episode.drama.slug}`,
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
