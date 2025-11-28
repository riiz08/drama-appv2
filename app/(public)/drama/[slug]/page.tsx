// FILE: app/drama/[slug]/page.tsx (SEO-OPTIMIZED)

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDramaBySlug, getRelatedDramas } from "@/app/actions/drama";
import { generateMetaDescription } from "@/lib/utils";
import DramaHero from "@/components/drama/DramaHero";
import DramaSynopsis from "@/components/drama/DramaSynopsis";
import EpisodeList from "@/components/drama/EpisodeList";
import RelatedDramas from "@/components/drama/RelatedDramas";
import { ADSENSE_CONFIG } from "@/lib/adsense-config";
import { BreadcrumbSchema } from "@/components/schema/BreadcrumbSchema";
import { TVSeriesSchema } from "@/components/schema/TvSeriesSchema";
import DramaCredits from "@/components/drama/DramaCredits";
import AdWrapper from "@/components/ads/AdWrapper";

export const dynamic = "force-static";
export const revalidate = 86400;

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<any>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { success, drama } = await getDramaBySlug(slug);

  if (!success || !drama) {
    return {
      title: "Drama Tidak Dijumpai - Mangeakkk Drama",
      description:
        "Drama yang anda cari tidak dijumpai. Kembali ke halaman utama untuk melihat senarai drama terkini.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const title = `${drama.title} Full Episod HD Percuma | Mangeakkk Drama`;

  // Cast drama ke any untuk akses nested data
  const dramaData = drama as any;

  // Build rich description with cast/director/production info
  let description = `Tonton drama ${drama.title} full episod dalam kualiti HD. Streaming percuma tanpa iklan hanya di Mangeakkk.`;

  // ✅ UBAH: casts -> dramaCasts
  if (
    dramaData.dramaCasts &&
    Array.isArray(dramaData.dramaCasts) &&
    dramaData.dramaCasts.length > 0
  ) {
    const topCast = dramaData.dramaCasts
      .slice(0, 4)
      .map((c: any) => c.cast?.name)
      .filter(Boolean)
      .join(", ");

    if (topCast) {
      description += ` Lakonan ${topCast}`;
      if (dramaData.dramaCasts.length > 4) {
        description += ` dan lain-lain`;
      }
      description += `.`;
    }
  }

  // ✅ UBAH: directors -> dramaDirectors
  if (
    dramaData.dramaDirectors &&
    Array.isArray(dramaData.dramaDirectors) &&
    dramaData.dramaDirectors.length > 0
  ) {
    const directorNames = dramaData.dramaDirectors
      .map((d: any) => d.director?.name)
      .filter(Boolean)
      .join(", ");

    if (directorNames) {
      description += ` Diarahkan oleh ${directorNames}.`;
    }
  }

  // Add production & network info
  if (dramaData.production?.name) {
    description += ` Produksi ${dramaData.production.name}`;

    // ✅ UBAH: networks -> dramaNetworks
    if (
      dramaData.dramaNetworks &&
      Array.isArray(dramaData.dramaNetworks) &&
      dramaData.dramaNetworks.length > 0
    ) {
      const networkNames = dramaData.dramaNetworks
        .map((n: any) => n.network?.name)
        .filter(Boolean)
        .join(", ");

      if (networkNames) {
        description += ` untuk ${networkNames}`;
      }
    }
    description += `.`;
  }

  // Add drama description
  const dramaDesc = generateMetaDescription(drama.description);
  description += ` ${dramaDesc}`;

  // Truncate if too long
  if (description.length > 160) {
    description = description.substring(0, 157) + "...";
  }

  const canonicalUrl = `https://mangeakkk.my.id/drama/${drama.slug}`;

  // Generate keywords with cast/director/production
  const keywords = [
    `tonton ${drama.title}`,
    `${drama.title} episod penuh`,
    `streaming ${drama.title} HD`,
    `${drama.title} online percuma`,
    `${drama.title} semua episod`,
    "drama melayu",
    "drama malaysia terkini",
    "tonton drama percuma",
  ];

  // ✅ UBAH: casts -> dramaCasts
  if (
    dramaData.dramaCasts &&
    Array.isArray(dramaData.dramaCasts) &&
    dramaData.dramaCasts.length > 0
  ) {
    dramaData.dramaCasts.slice(0, 6).forEach((cast: any) => {
      if (cast.cast?.name) {
        keywords.push(`${cast.cast.name} drama`);
        keywords.push(`${cast.cast.name} ${drama.title}`);
      }
    });
  }

  // ✅ UBAH: directors -> dramaDirectors
  if (
    dramaData.dramaDirectors &&
    Array.isArray(dramaData.dramaDirectors) &&
    dramaData.dramaDirectors.length > 0
  ) {
    dramaData.dramaDirectors.forEach((director: any) => {
      if (director.director?.name) {
        keywords.push(`${director.director.name} drama`);
        keywords.push(`drama arahan ${director.director.name}`);
      }
    });
  }

  // ✅ UBAH: writers -> dramaWriters
  if (
    dramaData.dramaWriters &&
    Array.isArray(dramaData.dramaWriters) &&
    dramaData.dramaWriters.length > 0
  ) {
    dramaData.dramaWriters.forEach((writer: any) => {
      if (writer.writer?.name) {
        keywords.push(`${writer.writer.name} penulis`);
      }
    });
  }

  // Add production company
  if (dramaData.production?.name) {
    keywords.push(`${dramaData.production.name} drama`);
    keywords.push(`drama ${dramaData.production.name}`);
  }

  // ✅ UBAH: networks -> dramaNetworks
  if (
    dramaData.dramaNetworks &&
    Array.isArray(dramaData.dramaNetworks) &&
    dramaData.dramaNetworks.length > 0
  ) {
    dramaData.dramaNetworks.forEach((network: any) => {
      if (network.network?.name) {
        keywords.push(`drama ${network.network.name}`);
        keywords.push(`${network.network.name} ${drama.title}`);
      }
    });
  }

  // Add status-based keywords
  if (drama.status === "ONGOING") {
    keywords.push(`${drama.title} terkini`);
    keywords.push(`drama ongoing ${new Date().getFullYear()}`);
  } else {
    keywords.push(`${drama.title} tamat`);
    keywords.push(`${drama.title} full episode`);
  }

  // ✅ UBAH: Prepare video metadata
  const videoActors =
    dramaData.dramaCasts && Array.isArray(dramaData.dramaCasts)
      ? dramaData.dramaCasts
          .slice(0, 5)
          .map((c: any) => c.cast?.name)
          .filter(Boolean)
          .join(", ")
      : undefined;

  const videoDirectors =
    dramaData.dramaDirectors && Array.isArray(dramaData.dramaDirectors)
      ? dramaData.dramaDirectors
          .map((d: any) => d.director?.name)
          .filter(Boolean)
          .join(", ")
      : undefined;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: "video.tv_show",
      url: canonicalUrl,
      siteName: "Mangeakkk Drama",
      images: [
        {
          url: drama.thumbnail,
          width: 1200,
          height: 630,
          alt: `${drama.title} - Tonton Drama Melayu Online`,
        },
      ],
      ...(drama.releaseDate && {
        releaseDate: new Date(drama.releaseDate).toISOString(),
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [drama.thumbnail],
      creator: "@mangeakkk",
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
    other: {
      // Additional metadata for better indexing
      ...(drama.releaseDate && {
        "article:published_time": new Date(drama.releaseDate).toISOString(),
      }),
      ...(drama.updatedAt && {
        "article:modified_time": new Date(drama.updatedAt).toISOString(),
      }),
      ...(videoActors && {
        "video:actor": videoActors,
      }),
      ...(videoDirectors && {
        "video:director": videoDirectors,
      }),
      ...(drama.totalEpisode && {
        "video:series": drama.title,
      }),
    },
  };
}

export default async function DramaDetailPage({
  params,
}: {
  params: Promise<any>;
}) {
  const { slug } = await params;
  const { success, drama } = await getDramaBySlug(slug);

  if (!success || !drama) {
    notFound();
  }

  // Cast to any for accessing nested Supabase data
  const dramaData = drama as any;

  // Get related dramas
  const relatedResult = await getRelatedDramas(drama.id, 6);
  const relatedDramas = relatedResult.success ? relatedResult.dramas : [];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Laman Utama", url: "https://mangeakkk.my.id" },
          { name: "Drama", url: "https://mangeakkk.my.id/drama" },
          {
            name: drama.title,
            url: `https://mangeakkk.my.id/drama/${drama.slug}`,
          },
        ]}
      />

      {/* TVSeries Schema */}
      <TVSeriesSchema drama={drama} />

      <div className="min-h-screen bg-black">
        <AdWrapper slot={ADSENSE_CONFIG.slots.hads1} format="auto" />

        {/* Hero Section */}
        <header>
          <DramaHero drama={drama} />
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Synopsis */}
          <section aria-labelledby="synopsis-heading">
            <DramaSynopsis description={drama.description} />
          </section>

          <DramaCredits
            casts={dramaData.casts || []}
            directors={dramaData.directors || []}
            writers={dramaData.writers || []}
            novelAuthors={dramaData.novelAuthors || []}
          />

          <AdWrapper slot={ADSENSE_CONFIG.slots.hads2} format="auto" />

          {/* Episode List */}
          <section aria-labelledby="episodes-heading">
            <EpisodeList
              episodes={dramaData.episodes || []}
              dramaTitle={drama.title}
            />
          </section>

          {/* Ad 4: After Related Dramas */}
          {relatedDramas.length > 0 && (
            <div className="max-w-3xl mx-auto">
              <AdWrapper
                slot={ADSENSE_CONFIG.slots.dramaAfterRelated}
                format="auto"
              />
            </div>
          )}

          {/* Related Dramas */}
          {relatedDramas.length > 0 && (
            <section aria-labelledby="related-heading">
              <RelatedDramas dramas={relatedDramas} />
            </section>
          )}
        </div>
      </div>
    </>
  );
}
