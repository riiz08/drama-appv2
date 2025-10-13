"use server";

import { prisma } from "@/lib/db";

// Get episode by slug with drama info
export async function getEpisodeBySlug(slug: string) {
  try {
    const episode = await prisma.episode.findUnique({
      where: { slug },
      include: {
        drama: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            description: true,
            status: true,
            totalEpisode: true,
          },
        },
      },
    });

    if (!episode) {
      return { success: false, episode: null };
    }

    return { success: true, episode };
  } catch (error) {
    return {
      success: false,
      episode: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get latest episodes across all dramas
export async function getLatestEpisodes(limit?: number, offset?: number) {
  try {
    const [episodes, total] = await Promise.all([
      prisma.episode.findMany({
        take: limit || 12,
        skip: offset || 0,
        orderBy: {
          releaseDate: "desc",
        },
        include: {
          drama: {
            select: {
              title: true,
              slug: true,
              thumbnail: true,
              status: true,
            },
          },
        },
      }),
      prisma.episode.count(),
    ]);

    return {
      success: true,
      episodes,
      total,
      hasMore: (offset || 0) + episodes.length < total,
    };
  } catch (error) {
    return {
      success: false,
      episodes: [],
      total: 0,
      hasMore: false,
      error: "Failed to fetch latest episodes",
    };
  }
}

// Get adjacent episodes (previous and next)
export async function getAdjacentEpisodes(
  dramaId: string,
  currentEpisodeNum: number
) {
  try {
    const [prevEpisode, nextEpisode] = await Promise.all([
      prisma.episode.findFirst({
        where: {
          dramaId,
          episodeNum: currentEpisodeNum - 1,
        },
        select: {
          id: true,
          slug: true,
          episodeNum: true,
        },
      }),
      prisma.episode.findFirst({
        where: {
          dramaId,
          episodeNum: currentEpisodeNum + 1,
        },
        select: {
          id: true,
          slug: true,
          episodeNum: true,
        },
      }),
    ]);

    return {
      success: true,
      prev: prevEpisode,
      next: nextEpisode,
    };
  } catch (error) {
    return {
      success: false,
      prev: null,
      next: null,
      error: "Failed to fetch adjacent episodes",
    };
  }
}

// Get all episodes for a drama
export async function getEpisodesByDramaId(dramaId: string) {
  try {
    const episodes = await prisma.episode.findMany({
      where: { dramaId },
      orderBy: { episodeNum: "asc" },
      select: {
        id: true,
        slug: true,
        episodeNum: true,
        releaseDate: true,
      },
    });

    return { success: true, episodes };
  } catch (error) {
    return {
      success: false,
      episodes: [],
      error: "Failed to fetch episodes",
    };
  }
}

// Get all episode slugs for static generation
export async function getAllEpisodeSlugs() {
  try {
    const episodes = await prisma.episode.findMany({
      select: {
        slug: true,
      },
    });

    return {
      success: true,
      slugs: episodes.map((e) => e.slug),
    };
  } catch (error) {
    return {
      success: false,
      slugs: [],
      error: "Failed to fetch episode slugs",
    };
  }
}

// Get episode metadata for SEO
export async function getEpisodeMetadata(slug: string) {
  try {
    const episode = await prisma.episode.findUnique({
      where: { slug },
      select: {
        episodeNum: true,
        releaseDate: true,
        updatedAt: true,
        drama: {
          select: {
            title: true,
            description: true,
            thumbnail: true,
          },
        },
      },
    });

    if (!episode) {
      return { success: false, metadata: null };
    }

    return {
      success: true,
      metadata: {
        title: `${episode.drama.title} - Episode ${episode.episodeNum}`,
        description: episode.drama.description,
        image: episode.drama.thumbnail,
        releaseDate: episode.releaseDate,
        lastUpdated: episode.updatedAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      metadata: null,
      error: "Failed to fetch episode metadata",
    };
  }
}
