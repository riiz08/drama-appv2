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
    // Relations
    casts?: Array<{
      cast: { name: string };
      character?: string | null;
    }>;
    directors?: Array<{
      director: { name: string };
    }>;
    writers?: Array<{
      writer: { name: string };
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

  // Build actors array
  const actors = drama.casts?.map((item) => ({
    "@type": "PerformanceRole" as const,
    actor: {
      "@type": "Person" as const,
      name: item.cast.name,
    },
    ...(item.character && {
      characterName: item.character,
    }),
  }));

  // Build directors array
  const directors = drama.directors?.map((item) => ({
    "@type": "Person" as const,
    name: item.director.name,
  }));

  // Build writers array (creators in schema.org)
  const creators = drama.writers?.map((item) => ({
    "@type": "Person" as const,
    name: item.writer.name,
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
    ...(drama.totalEpisode && {
      numberOfEpisodes: drama.totalEpisode,
    }),
    ...(drama.status === "TAMAT" &&
      endDate && {
        endDate: endDate,
      }),
    ...(actors &&
      actors.length > 0 && {
        actor: actors,
      }),
    ...(directors &&
      directors.length > 0 && {
        director: directors,
      }),
    ...(creators &&
      creators.length > 0 && {
        creator: creators,
      }),
    ...(drama.production && {
      productionCompany: {
        "@type": "Organization",
        name: drama.production.name,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
