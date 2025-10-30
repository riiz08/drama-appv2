// FILE: app/drama/[slug]/page.tsx (SEO-OPTIMIZED)

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDramaBySlug, getRelatedDramas } from "@/app/actions/drama";
import { generateDramaTitle, generateMetaDescription } from "@/lib/utils";
import DramaHero from "@/components/drama/DramaHero";
import DramaSynopsis from "@/components/drama/DramaSynopsis";
import EpisodeList from "@/components/drama/EpisodeList";
import RelatedDramas from "@/components/drama/RelatedDramas";
import CompletedSection from "@/components/home/CompletedSection";
import { getHomepageData } from "@/app/actions";
import AdUnit from "@/components/ads/AdUnit";
import { ADSENSE_CONFIG } from "@/lib/adsense-config";
import { BreadcrumbSchema } from "@/components/schema/BreadcrumbSchema";
import { TVSeriesSchema } from "@/components/schema/TvSeriesSchema";
import DramaCredits from "@/components/drama/DramaCredits";

export const runtime = "edge";

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

  const title = generateDramaTitle(drama.title);

  // Build rich description with cast/director/production info
  let description = `Tonton ${drama.title} online secara percuma dalam kualiti HD.`;

  // Add cast info
  if (drama.casts && drama.casts.length > 0) {
    const topCast = drama.casts
      .slice(0, 4)
      .map((c) => c.cast.name)
      .join(", ");
    description += ` Lakonan ${topCast}`;
    if (drama.casts.length > 4) {
      description += ` dan lain-lain`;
    }
    description += `.`;
  }

  // Add director info
  if (drama.directors && drama.directors.length > 0) {
    const directorNames = drama.directors
      .map((d) => d.director.name)
      .join(", ");
    description += ` Diarahkan oleh ${directorNames}.`;
  }

  // Add production & network info
  if (drama.production) {
    description += ` Produksi ${drama.production.name}`;
    if (drama.networks && drama.networks.length > 0) {
      const networkNames = drama.networks.map((n) => n.network.name).join(", ");
      description += ` untuk ${networkNames}`;
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

  // Add cast names to keywords
  if (drama.casts && drama.casts.length > 0) {
    drama.casts.slice(0, 6).forEach((cast) => {
      keywords.push(`${cast.cast.name} drama`);
      keywords.push(`${cast.cast.name} ${drama.title}`);
    });
  }

  // Add director names
  if (drama.directors && drama.directors.length > 0) {
    drama.directors.forEach((director) => {
      keywords.push(`${director.director.name} drama`);
      keywords.push(`drama arahan ${director.director.name}`);
    });
  }

  // Add writer names
  if (drama.writers && drama.writers.length > 0) {
    drama.writers.forEach((writer) => {
      keywords.push(`${writer.writer.name} penulis`);
    });
  }

  // Add production company
  if (drama.production) {
    keywords.push(`${drama.production.name} drama`);
    keywords.push(`drama ${drama.production.name}`);
  }

  // Add network names
  if (drama.networks && drama.networks.length > 0) {
    drama.networks.forEach((network) => {
      keywords.push(`drama ${network.network.name}`);
      keywords.push(`${network.network.name} ${drama.title}`);
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
        releaseDate: drama.releaseDate,
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
      "article:published_time": drama.releaseDate?.toISOString(),
      "article:modified_time": drama.updatedAt?.toISOString(),
      ...(drama.casts &&
        drama.casts.length > 0 && {
          "video:actor": drama.casts
            .slice(0, 5)
            .map((c) => c.cast.name)
            .join(", "),
        }),
      ...(drama.directors &&
        drama.directors.length > 0 && {
          "video:director": drama.directors
            .map((d) => d.director.name)
            .join(", "),
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

  // Get related dramas
  const relatedResult = await getRelatedDramas(drama.id, 6);
  const relatedDramas = relatedResult.success ? relatedResult.dramas : [];
  const completedResult = await getHomepageData();

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
        {/* Hero Section */}
        <header>
          <DramaHero drama={drama} />
        </header>

        {/* Ad 1: After Hero */}
        <div className="max-w-5xl mx-auto px-4 py-6">
          <AdUnit
            slot={ADSENSE_CONFIG.slots.dramaAfterHero}
            format="auto"
            responsive={true}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Synopsis */}
          <section aria-labelledby="synopsis-heading">
            <DramaSynopsis description={drama.description} />
          </section>

          {/* Ad 2: After Synopsis */}
          <div className="max-w-3xl mx-auto">
            <AdUnit
              slot={ADSENSE_CONFIG.slots.dramaAfterSynopsis}
              format="auto"
              responsive={true}
            />
          </div>

          <DramaCredits
            casts={drama.casts}
            directors={drama.directors}
            writers={drama.writers}
            novelAuthors={drama.novelAuthors}
          />

          {/* Episode List */}
          <section aria-labelledby="episodes-heading">
            <EpisodeList episodes={drama.episodes} dramaTitle={drama.title} />
          </section>

          {/* Ad 3: After Episode List */}
          <div className="max-w-3xl mx-auto">
            <AdUnit
              slot={ADSENSE_CONFIG.slots.dramaAfterEpisodes}
              format="auto"
              responsive={true}
            />
          </div>

          {/* Related Dramas */}
          {relatedDramas.length > 0 && (
            <section aria-labelledby="related-heading">
              <RelatedDramas dramas={relatedDramas} />
            </section>
          )}

          {/* Ad 4: After Related Dramas */}
          {relatedDramas.length > 0 && (
            <div className="max-w-3xl mx-auto">
              <AdUnit
                slot={ADSENSE_CONFIG.slots.dramaAfterRelated}
                format="auto"
                responsive={true}
              />
            </div>
          )}

          {/* Completed Dramas */}
          {completedResult.data.completed.length > 0 && (
            <section aria-labelledby="completed-heading">
              <CompletedSection dramas={completedResult.data.completed} />
            </section>
          )}

          <div className="max-w-5xl mx-auto py-4">
            <AdUnit
              slot={ADSENSE_CONFIG.slots.dramaBottomBanner}
              format="auto"
              responsive={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}
