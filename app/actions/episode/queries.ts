"use server";

import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export const getEpisodeFullData = unstable_cache(
  async (slug: string) => {
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
              airTime: true,
              production: {
                select: {
                  id: true,
                  name: true,
                },
              },
              casts: {
                take: 5, // Limit for performance
                select: {
                  id: true,
                  character: true,
                  cast: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              directors: {
                take: 2, // Limit for performance
                select: {
                  id: true,
                  director: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              writers: {
                take: 2,
                select: {
                  id: true,
                  writer: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              novelAuthors: {
                take: 1,
                select: {
                  id: true,
                  novelTitle: true,
                  novelAuthor: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              networks: {
                take: 2,
                select: {
                  id: true,
                  network: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              // Get ALL episodes for this drama in single query
              episodes: {
                select: {
                  id: true,
                  slug: true,
                  episodeNum: true,
                  releaseDate: true,
                  videoUrl: true,
                },
                orderBy: { episodeNum: "asc" },
              },
            },
          },
        },
      });

      if (!episode) {
        return {
          success: false,
          episode: null,
          prev: null,
          next: null,
          allEpisodes: [],
        };
      }

      // Calculate prev/next in-memory (fast!)
      const allEpisodes = episode.drama.episodes;
      const currentIndex = allEpisodes.findIndex(
        (ep) => ep.episodeNum === episode.episodeNum
      );

      const prev = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null;
      const next =
        currentIndex < allEpisodes.length - 1
          ? allEpisodes[currentIndex + 1]
          : null;

      return {
        success: true,
        episode,
        prev,
        next,
        allEpisodes,
      };
    } catch (error) {
      return {
        success: false,
        episode: null,
        prev: null,
        next: null,
        allEpisodes: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  ["episode-full-data"],
  {
    revalidate: 3600, // 1 hour (conservative start)
    tags: ["episodes"],
  }
);

// ============================================
// EXISTING FUNCTIONS - WITH CACHE
// ============================================

// Get episode by slug with drama info
export const getEpisodeBySlug = unstable_cache(
  async (slug: string) => {
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
              airTime: true,
              production: {
                select: {
                  id: true,
                  name: true,
                },
              },
              casts: {
                select: {
                  id: true,
                  character: true,
                  cast: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              directors: {
                select: {
                  id: true,
                  director: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              writers: {
                select: {
                  id: true,
                  writer: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              novelAuthors: {
                select: {
                  id: true,
                  novelTitle: true,
                  novelAuthor: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              networks: {
                select: {
                  id: true,
                  network: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
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
  },
  ["episode-by-slug"],
  {
    revalidate: 3600,
    tags: ["episodes"],
  }
);

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
              id: true,
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

// Get all episodes for a drama by ID
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
        videoUrl: true,
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

// Get all episodes for a drama by SLUG
export async function getEpisodesByDramaSlug(dramaSlug: string) {
  try {
    const drama = await prisma.drama.findUnique({
      where: { slug: dramaSlug },
      select: { id: true },
    });

    if (!drama) {
      return {
        success: false,
        episodes: [],
        error: "Drama not found",
      };
    }

    const episodes = await prisma.episode.findMany({
      where: { dramaId: drama.id },
      orderBy: { episodeNum: "asc" },
      select: {
        id: true,
        slug: true,
        episodeNum: true,
        releaseDate: true,
        videoUrl: true,
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

// Get all episode slugs (for sitemap/generateStaticParams)
export async function getAllEpisodeSlugs() {
  try {
    const episodes = await prisma.episode.findMany({
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
      slugs: episodes.map((e) => e.slug),
      episodes: episodes.map((e) => ({
        slug: e.slug,
        updatedAt: e.updatedAt,
      })),
    };
  } catch (error) {
    console.error("Error fetching episode slugs:", error);
    return {
      success: false,
      slugs: [],
      episodes: [],
      error: "Failed to fetch episode slugs",
    };
  }
}

// ============================================
// NEW: Get popular episode slugs for generateStaticParams
// ============================================
export async function getPopularEpisodeSlugs(limit: number = 50) {
  try {
    const episodes = await prisma.episode.findMany({
      select: { slug: true },
      orderBy: { createdAt: "desc" }, // Latest episodes
      take: limit,
    });

    return episodes.map((ep) => ep.slug);
  } catch (error) {
    console.error("Error fetching popular episodes:", error);
    return [];
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

// Get all episodes with drama info (for admin) with pagination
export async function getAllEpisodes(page: number = 1, limit: number = 20) {
  try {
    const skip = (page - 1) * limit;

    const [episodes, total] = await Promise.all([
      prisma.episode.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          drama: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
            },
          },
        },
      }),
      prisma.episode.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: episodes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
      error: "Failed to fetch episodes",
    };
  }
}

// Get episode count by drama
export async function getEpisodeCountByDrama(dramaId: string) {
  try {
    const count = await prisma.episode.count({
      where: { dramaId },
    });

    return { success: true, count };
  } catch (error) {
    return {
      success: false,
      count: 0,
      error: "Failed to count episodes",
    };
  }
}
