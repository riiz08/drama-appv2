// components/schema/tvseries-schema.tsx
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
    airTime?: string | null;
  };
}

export function TVSeriesSchema({ drama }: TVSeriesSchemaProps) {
  const releaseDate =
    drama.releaseDate instanceof Date
      ? drama.releaseDate.toISOString().split("T")[0]
      : new Date(drama.releaseDate).toISOString().split("T")[0];

  const schema: WithContext<TVSeries> = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: drama.title,
    description: drama.description,
    image: drama.thumbnail,
    url: `https://mangeakkk.my.id/drama/${drama.slug}`,
    datePublished: releaseDate,
    ...(drama.totalEpisode && {
      numberOfEpisodes: drama.totalEpisode,
    }),
    ...(drama.status === "TAMAT" && {
      endDate: releaseDate, // bisa diganti dengan tanggal tamat sebenarnya jika ada
    }),
    inLanguage: "ms", // Bahasa Malaysia
    countryOfOrigin: {
      "@type": "Country",
      name: "Malaysia",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
