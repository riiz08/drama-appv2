// components/schema/TVSeriesSchema.tsx
import { TVSeries, WithContext } from "schema-dts";

interface TVSeriesSchemaProps {
  drama: {
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    status: "ONGOING" | "TAMAT";
    releaseDate: Date | string;
    totalEpisode?: number | null;
    endDate?: Date | string | null;
    airTime?: string | null;
    // ✅ Relations - Updated field names
    dramaCasts?: Array<{
      cast: { name: string };
      character?: string | null;
    }>;
    dramaDirectors?: Array<{
      director: { name: string };
    }>;
    dramaWriters?: Array<{
      writer: { name: string };
    }>;
    dramaNovelAuthor?: Array<{
      novelAuthor: { name: string };
      novelTitle?: string | null;
    }>;
    dramaNetworks?: Array<{
      network: { name: string };
    }>;
    production?: {
      name: string;
    } | null;
  };
}

export function TVSeriesSchema({ drama }: TVSeriesSchemaProps) {
  const releaseDate =
    drama.releaseDate instanceof Date
      ? drama.releaseDate.toISOString().split("T")[0]
      : new Date(drama.releaseDate).toISOString().split("T")[0];

  // Parse endDate jika ada
  const endDate = drama.endDate
    ? drama.endDate instanceof Date
      ? drama.endDate.toISOString().split("T")[0]
      : new Date(drama.endDate).toISOString().split("T")[0]
    : undefined;

  // ✅ Build actors array - Updated field name
  const actors = drama.dramaCasts?.map((item) => ({
    "@type": "PerformanceRole" as const,
    actor: {
      "@type": "Person" as const,
      name: item.cast.name,
    },
    ...(item.character && {
      characterName: item.character,
    }),
  }));

  // ✅ Build directors array - Updated field name
  const directors = drama.dramaDirectors?.map((item) => ({
    "@type": "Person" as const,
    name: item.director.name,
  }));

  // ✅ Build writers array - Updated field name
  const writers = drama.dramaWriters?.map((item) => ({
    "@type": "Person" as const,
    name: item.writer.name,
  }));

  // ✅ Build novel authors array (as additional creators)
  const novelAuthors = drama.dramaNovelAuthor?.map((item) => ({
    "@type": "Person" as const,
    name: item.novelAuthor.name,
    ...(item.novelTitle && {
      workExample: {
        "@type": "Book" as const,
        name: item.novelTitle,
      },
    }),
  }));

  // ✅ Combine writers and novel authors as creators
  const creators = [...(writers || []), ...(novelAuthors || [])];

  // ✅ Build broadcast networks
  const broadcastNetworks = drama.dramaNetworks?.map((item) => ({
    "@type": "BroadcastService" as const,
    name: item.network.name,
    broadcastDisplayName: item.network.name,
  }));

  const schema: WithContext<TVSeries> = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: drama.title,
    description: drama.description,
    image: drama.thumbnail,
    url: `https://mangeakkk.my.id/drama/${drama.slug}`,
    datePublished: releaseDate,
    inLanguage: "ms-MY",
    countryOfOrigin: {
      "@type": "Country",
      name: "Malaysia",
    },

    // ✅ Add air time if available
    ...(drama.airTime && {
      schedule: drama.airTime,
    }),

    ...(drama.totalEpisode && {
      numberOfEpisodes: drama.totalEpisode,
    }),

    ...(drama.status === "TAMAT" &&
      endDate && {
        endDate: endDate,
      }),

    // ✅ Actors
    ...(actors &&
      actors.length > 0 && {
        actor: actors,
      }),

    // ✅ Directors
    ...(directors &&
      directors.length > 0 && {
        director: directors,
      }),

    // ✅ Creators (writers + novel authors)
    ...(creators.length > 0 && {
      creator: creators,
    }),

    // ✅ Production company
    ...(drama.production && {
      productionCompany: {
        "@type": "Organization",
        name: drama.production.name,
      },
    }),

    // ✅ Broadcast networks
    ...(broadcastNetworks &&
      broadcastNetworks.length > 0 && {
        containedInPlace: broadcastNetworks,
      }),

    // ✅ Genre (default untuk drama melayu)
    genre: ["Drama", "Malaysian Drama"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
