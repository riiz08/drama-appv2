"use server";

import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

// ============================================
// MAIN EPISODE QUERY - HEAVILY OPTIMIZED
// ============================================

export async function getEpisodeFullData(slug: string) {
  return unstable_cache(
    async () => {
      try {
        const episode = await prisma.episode.findUnique({
          where: { slug },
          include: {
            drama: {
              include: {
                production: true,
                dramaCasts: {
                  take: 5,
                  include: {
                    cast: true,
                  },
                },
                dramaDirectors: {
                  take: 2,
                  include: {
                    director: true,
                  },
                },
                dramaWriters: {
                  take: 2,
                  include: {
                    writer: true,
                  },
                },
                dramaNovelAuthor: {
                  take: 1,
                  include: {
                    novelAuthor: true,
                  },
                },
                dramaNetworks: {
                  take: 2,
                  include: {
                    network: true,
                  },
                },
                episodes: {
                  select: {
                    id: true,
                    slug: true,
                    episodeNum: true,
                    releaseDate: true,
                    videoUrl: true,
                  },
                  orderBy: {
                    episodeNum: "asc",
                  },
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

        const allEpisodes = episode.drama.episodes;

        // Calculate prev/next in-memory
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
    ["episode-full-data", slug],
    {
      revalidate: 300,
      tags: ["episodes", `episode-${slug}`],
    }
  )();
}

// ============================================
// SIMPLIFIED EPISODE QUERY - FOR BASIC INFO
// ============================================

export async function getEpisodeBySlug(slug: string) {
  return unstable_cache(
    async () => {
      try {
        const episode = await prisma.episode.findUnique({
          where: { slug },
          include: {
            drama: {
              include: {
                production: true,
                dramaCasts: {
                  include: {
                    cast: true,
                  },
                },
                dramaDirectors: {
                  include: {
                    director: true,
                  },
                },
                dramaWriters: {
                  include: {
                    writer: true,
                  },
                },
                dramaNovelAuthor: {
                  include: {
                    novelAuthor: true,
                  },
                },
                dramaNetworks: {
                  include: {
                    network: true,
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
    ["episode-by-slug", slug],
    {
      revalidate: 300,
      tags: ["episodes", `episode-${slug}`],
    }
  )();
}

// ============================================
// LATEST EPISODES - CACHED WITH PAGINATION
// ============================================

export async function getLatestEpisodes(limit?: number, offset?: number) {
  const actualLimit = limit || 12;
  const actualOffset = offset || 0;

  const cacheKey = ["episodes-latest", actualLimit, actualOffset].join("-");

  return unstable_cache(
    async () => {
      try {
        const [episodes, total] = await Promise.all([
          prisma.episode.findMany({
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
            orderBy: {
              releaseDate: "desc",
            },
            skip: actualOffset,
            take: actualLimit,
          }),
          prisma.episode.count(),
        ]);

        return {
          success: true,
          episodes: episodes || [],
          total,
          hasMore: actualOffset + episodes.length < total,
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
    },
    [cacheKey],
    {
      revalidate: 60,
      tags: ["episodes", "episodes-latest"],
    }
  )();
}

// ============================================
// ADJACENT EPISODES - CACHED PER DRAMA
// ============================================

export async function getAdjacentEpisodes(
  dramaId: string,
  currentEpisodeNum: number
) {
  return unstable_cache(
    async () => {
      try {
        const episodes = await prisma.episode.findMany({
          where: {
            dramaId,
            episodeNum: {
              in: [currentEpisodeNum - 1, currentEpisodeNum + 1],
            },
          },
          select: {
            id: true,
            slug: true,
            episodeNum: true,
          },
          orderBy: {
            episodeNum: "asc",
          },
        });

        const prev =
          episodes.find((ep) => ep.episodeNum === currentEpisodeNum - 1) ||
          null;
        const next =
          episodes.find((ep) => ep.episodeNum === currentEpisodeNum + 1) ||
          null;

        return {
          success: true,
          prev,
          next,
        };
      } catch (error) {
        return {
          success: false,
          prev: null,
          next: null,
          error: "Failed to fetch adjacent episodes",
        };
      }
    },
    ["episodes-adjacent", dramaId, currentEpisodeNum.toString()],
    {
      revalidate: 300,
      tags: ["episodes", `drama-${dramaId}-episodes`],
    }
  )();
}

// ============================================
// EPISODES BY DRAMA ID - CACHED
// ============================================

export async function getEpisodesByDramaId(dramaId: string) {
  return unstable_cache(
    async () => {
      try {
        const episodes = await prisma.episode.findMany({
          where: { dramaId },
          select: {
            id: true,
            slug: true,
            episodeNum: true,
            releaseDate: true,
            videoUrl: true,
          },
          orderBy: {
            episodeNum: "asc",
          },
        });

        return { success: true, episodes: episodes || [] };
      } catch (error) {
        return {
          success: false,
          episodes: [],
          error: "Failed to fetch episodes",
        };
      }
    },
    ["episodes-by-drama-id", dramaId],
    {
      revalidate: 180,
      tags: ["episodes", `drama-${dramaId}-episodes`],
    }
  )();
}

// ============================================
// EPISODES BY DRAMA SLUG - CACHED
// ============================================

export async function getEpisodesByDramaSlug(dramaSlug: string) {
  return unstable_cache(
    async () => {
      try {
        const episodes = await prisma.episode.findMany({
          where: {
            drama: {
              slug: dramaSlug,
            },
          },
          select: {
            id: true,
            slug: true,
            episodeNum: true,
            releaseDate: true,
            videoUrl: true,
          },
          orderBy: {
            episodeNum: "asc",
          },
        });

        if (episodes.length === 0) {
          return {
            success: false,
            episodes: [],
            error: "Drama not found or no episodes",
          };
        }

        return { success: true, episodes };
      } catch (error) {
        return {
          success: false,
          episodes: [],
          error: "Failed to fetch episodes",
        };
      }
    },
    ["episodes-by-drama-slug", dramaSlug],
    {
      revalidate: 180,
      tags: ["episodes", `drama-slug-${dramaSlug}-episodes`],
    }
  )();
}

// ============================================
// ALL EPISODE SLUGS - FOR STATIC GENERATION
// ============================================

export async function getAllEpisodeSlugs() {
  return unstable_cache(
    async () => {
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
    },
    ["episodes-all-slugs"],
    {
      revalidate: 3600,
      tags: ["episodes", "episodes-slugs"],
    }
  )();
}

// ============================================
// POPULAR EPISODE SLUGS - FOR STATIC PARAMS
// ============================================

export async function getPopularEpisodeSlugs(limit: number = 50) {
  return unstable_cache(
    async () => {
      try {
        const episodes = await prisma.episode.findMany({
          select: {
            slug: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
        });

        return episodes.map((ep) => ep.slug);
      } catch (error) {
        console.error("Error fetching popular episodes:", error);
        return [];
      }
    },
    ["episodes-popular-slugs", limit.toString()],
    {
      revalidate: 300,
      tags: ["episodes", "episodes-popular"],
    }
  )();
}

// ============================================
// EPISODE METADATA - FOR SEO
// ============================================

interface Cast {
  cast: {
    id: string;
    name: string;
  };
  character?: string | null;
}

interface Director {
  director: {
    id: string;
    name: string;
  };
}

interface Writer {
  writer: {
    id: string;
    name: string;
  };
}

interface Network {
  network: {
    id: string;
    name: string;
  };
}

interface Production {
  id: string;
  name: string;
}

interface Drama {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  status: string;
  releaseDate: Date;
  isPopular: boolean;
  totalEpisode?: number | null;
  airTime?: string | null;
  casts?: Cast[];
  directors?: Director[];
  writers?: Writer[];
  networks?: Network[];
  production?: Production | null;
}

interface Episode {
  id: string;
  slug: string;
  episodeNum: number;
  videoUrl: string;
  releaseDate: Date;
  drama: Drama;
}

interface PrevNextEpisode {
  slug: string;
  episodeNum: number;
}

interface EpisodeMetadataResponse {
  success: boolean;
  episode?: Episode;
  prev?: PrevNextEpisode | null;
  next?: PrevNextEpisode | null;
}

async function _getEpisodeMetadata(
  slug: string
): Promise<EpisodeMetadataResponse> {
  try {
    const episode = await prisma.episode.findUnique({
      where: { slug },
      include: {
        drama: {
          include: {
            production: true,
            dramaCasts: {
              include: {
                cast: true,
              },
            },
            dramaDirectors: {
              include: {
                director: true,
              },
            },
            dramaWriters: {
              include: {
                writer: true,
              },
            },
            dramaNetworks: {
              include: {
                network: true,
              },
            },
          },
        },
      },
    });

    if (!episode) {
      return { success: false };
    }

    // Get prev/next episodes
    const [prev, next] = await Promise.all([
      prisma.episode.findFirst({
        where: {
          dramaId: episode.dramaId,
          episodeNum: episode.episodeNum - 1,
        },
        select: {
          slug: true,
          episodeNum: true,
        },
      }),
      prisma.episode.findFirst({
        where: {
          dramaId: episode.dramaId,
          episodeNum: episode.episodeNum + 1,
        },
        select: {
          slug: true,
          episodeNum: true,
        },
      }),
    ]);

    return {
      success: true,
      episode: episode as any,
      prev,
      next,
    };
  } catch (error) {
    console.error("Unexpected error in getEpisodeMetadata:", error);
    return { success: false };
  }
}

export async function getEpisodeMetadata(
  slug: string
): Promise<EpisodeMetadataResponse> {
  const getCachedMetadata = unstable_cache(
    async (episodeSlug: string) => _getEpisodeMetadata(episodeSlug),
    [`episode-metadata-${slug}`],
    {
      revalidate: 3600,
      tags: [`episode-${slug}`, "episode-metadata"],
    }
  );

  return getCachedMetadata(slug);
}

export async function getBasicEpisodeInfo(slug: string) {
  try {
    const data = await prisma.episode.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        episodeNum: true,
        videoUrl: true,
        releaseDate: true,
        drama: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
          },
        },
      },
    });

    return data;
  } catch (error) {
    console.error("Unexpected error in getBasicEpisodeInfo:", error);
    return null;
  }
}

// ============================================
// ALL EPISODES - ADMIN WITH PAGINATION
// ============================================

export async function getAllEpisodes(page: number = 1, limit: number = 20) {
  const cacheKey = ["episodes-all", page, limit].join("-");

  return unstable_cache(
    async () => {
      try {
        const skip = (page - 1) * limit;

        const [episodes, total] = await Promise.all([
          prisma.episode.findMany({
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
            orderBy: {
              createdAt: "desc",
            },
            skip,
            take: limit,
          }),
          prisma.episode.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
          success: true,
          data: episodes || [],
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
    },
    [cacheKey],
    {
      revalidate: 60,
      tags: ["episodes", "episodes-admin"],
    }
  )();
}

// ============================================
// EPISODE COUNT BY DRAMA - CACHED
// ============================================

export async function getEpisodeCountByDrama(dramaId: string) {
  return unstable_cache(
    async () => {
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
    },
    ["episode-count-by-drama", dramaId],
    {
      revalidate: 180,
      tags: ["episodes", `drama-${dramaId}-count`],
    }
  )();
}

export async function getEpisodeForPublic(slug: string) {
  return unstable_cache(
    async () => {
      try {
        const episode = await prisma.episode.findUnique({
          where: { slug },
          include: {
            drama: {
              include: {
                production: true,
                dramaCasts: {
                  take: 5,
                  include: {
                    cast: true,
                  },
                },
                dramaDirectors: {
                  take: 2,
                  include: {
                    director: true,
                  },
                },
                dramaWriters: {
                  take: 2,
                  include: {
                    writer: true,
                  },
                },
                dramaNovelAuthor: {
                  take: 1,
                  include: {
                    novelAuthor: true,
                  },
                },
                dramaNetworks: {
                  take: 2,
                  include: {
                    network: true,
                  },
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

        // Get ALL episodes for list (lightweight)
        const allEpisodes = await prisma.episode.findMany({
          where: { dramaId: episode.drama.id },
          select: {
            id: true,
            slug: true,
            episodeNum: true,
            releaseDate: true,
          },
          orderBy: {
            episodeNum: "asc",
          },
        });

        // Find prev/next from episodes
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
        };
      }
    },
    ["episode-public", slug],
    { revalidate: 86400, tags: ["episodes", `episode-${slug}`] }
  )();
}

export async function getLatestEpisodesForPublic(limit = 12, offset = 0) {
  const cacheKey = ["episodes-latest-public", limit, offset].join("-");

  return unstable_cache(
    async () => {
      try {
        const [episodes, total] = await Promise.all([
          prisma.episode.findMany({
            select: {
              id: true,
              slug: true,
              episodeNum: true,
              releaseDate: true,
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
            orderBy: {
              releaseDate: "desc",
            },
            skip: offset,
            take: limit,
          }),
          prisma.episode.count(),
        ]);

        return {
          success: true,
          episodes: episodes || [],
          total,
          hasMore: offset + episodes.length < total,
        };
      } catch (error) {
        return {
          success: false,
          episodes: [],
          total: 0,
          hasMore: false,
        };
      }
    },
    [cacheKey],
    { revalidate: 300, tags: ["episodes", "episodes-latest"] }
  )();
}
