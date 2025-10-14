import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getDramaBySlug,
  getAllDramaSlugs,
  getRelatedDramas,
} from "@/app/actions/drama";
import { generateDramaTitle, generateMetaDescription } from "@/lib/utils";
import DramaHero from "@/components/drama/DramaHero";
import DramaSynopsis from "@/components/drama/DramaSynopsis";
import EpisodeList from "@/components/drama/EpisodeList";
import RelatedDramas from "@/components/drama/RelatedDramas";

// Generate static params for all dramas
export async function generateStaticParams() {
  return [];
}

export const revalidate = 259200;

// Generate metadata for SEO
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { success, drama } = await getDramaBySlug(params.slug);

  if (!success || !drama) {
    return {
      title: "Drama Tidak Ditemukan",
    };
  }

  return {
    title: generateDramaTitle(drama.title),
    description: generateMetaDescription(drama.description),
    keywords: [
      `nonton ${drama.title}`,
      `${drama.title} sub indo`,
      `streaming ${drama.title}`,
      "drama malaysia",
      "drama malaysia sub indo",
    ],
    openGraph: {
      title: generateDramaTitle(drama.title),
      description: generateMetaDescription(drama.description),
      type: "video.tv_show",
      images: [
        {
          url: drama.thumbnail,
          width: 1200,
          height: 630,
          alt: drama.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: generateDramaTitle(drama.title),
      description: generateMetaDescription(drama.description),
      images: [drama.thumbnail],
    },
    alternates: {
      canonical: `https://mangeakkk.my.id/drama/${drama.slug}`,
    },
  };
}

export default async function DramaDetailPage({ params }: any) {
  const { success, drama } = await getDramaBySlug(params.slug);

  if (!success || !drama) {
    notFound();
  }

  // Get related dramas
  const relatedResult = await getRelatedDramas(drama.id, 6);
  const relatedDramas = relatedResult.success ? relatedResult.dramas : [];

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <DramaHero drama={drama} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Synopsis */}
        <DramaSynopsis description={drama.description} />

        {/* Episode List */}
        <EpisodeList episodes={drama.episodes} dramaTitle={drama.title} />

        {/* Related Dramas */}
        {relatedDramas.length > 0 && <RelatedDramas dramas={relatedDramas} />}
      </div>
    </main>
  );
}
