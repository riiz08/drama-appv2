"use server";

import { prisma } from "@/lib/db";

// Get all drama slugs for static generation
export async function getAllDramaSlugs() {
  try {
    const dramas = await prisma.drama.findMany({
      select: {
        slug: true,
      },
    });

    return {
      success: true,
      slugs: dramas.map((d) => d.slug),
    };
  } catch (error) {
    return {
      success: false,
      slugs: [],
      error: "Failed to fetch drama slugs",
    };
  }
}

// Get drama metadata for SEO
export async function getDramaMetadata(slug: string) {
  try {
    const drama = await prisma.drama.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        releaseDate: true,
        status: true,
        totalEpisode: true,
        airTime: true,
        updatedAt: true,
        _count: {
          select: { episodes: true },
        },
      },
    });

    if (!drama) {
      return { success: false, metadata: null };
    }

    return {
      success: true,
      metadata: {
        title: drama.title,
        description: drama.description,
        image: drama.thumbnail,
        releaseDate: drama.releaseDate,
        status: drama.status,
        totalEpisodes: drama.totalEpisode || drama._count.episodes,
        lastUpdated: drama.updatedAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      metadata: null,
      error: "Failed to fetch drama metadata",
    };
  }
}

// Get sitemap data for all dramas
export async function getDramaSitemapData() {
  try {
    const dramas = await prisma.drama.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return {
      success: true,
      data: dramas.map((d) => ({
        slug: d.slug,
        lastModified: d.updatedAt,
      })),
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: "Failed to fetch sitemap data",
    };
  }
}
