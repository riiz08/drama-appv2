"use server";

import { prisma } from "@/lib/db";
import { StatusType } from "@/types";
import { unstable_cache } from "next/cache";

// ============================================
// CACHED QUERIES - Mengurangi request drastis!
// ============================================

// Get all dramas with flexible options + CACHE
export async function getAllDramas(options?: {
  status?: StatusType;
  limit?: number;
  offset?: number;
  orderBy?: "title" | "releaseDate" | "createdAt";
  order?: "asc" | "desc";
  includeRelations?: boolean;
}) {
  const cacheKey = [
    "dramas-all",
    options?.status || "all",
    options?.orderBy || "title",
    options?.order || "asc",
    options?.limit || "all",
    options?.offset || 0,
  ].join("-");

  return unstable_cache(
    async () => {
      try {
        const where = options?.status ? { status: options.status } : {};

        const orderBy = options?.orderBy || "title";
        const order = options?.order || "asc";

        const dramas = await prisma.drama.findMany({
          where,
          include: {
            episodes: {
              select: {
                id: true,
                episodeNum: true,
              },
            },
            production: {
              select: {
                id: true,
                name: true,
              },
            },
            dramaNetworks: {
              include: {
                network: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            [orderBy]: order,
          },
          skip: options?.offset,
          take: options?.limit,
        });

        return { success: true, dramas };
      } catch (error) {
        console.error("Error fetching dramas:", error);
        return {
          success: false,
          dramas: [],
          error: "Failed to fetch dramas",
        };
      }
    },
    [cacheKey],
    {
      revalidate: 60,
      tags: ["dramas", "dramas-list"],
    }
  )();
}

// Get drama by ID - CACHED (untuk edit form)
export async function getDramaById(id: string) {
  return unstable_cache(
    async () => {
      try {
        const drama = await prisma.drama.findUnique({
          where: { id },
          include: {
            dramaCasts: {
              include: {
                cast: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            dramaDirectors: {
              include: {
                director: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            dramaWriters: {
              include: {
                writer: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            dramaNovelAuthor: {
              include: {
                novelAuthor: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            dramaNetworks: {
              include: {
                network: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            production: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!drama) {
          return { success: false, drama: null };
        }

        const transformedDrama = {
          ...drama,
          casts: drama.dramaCasts.map((dc) => ({
            name: dc.cast.name,
            character: dc.character || "",
          })),
          directors: drama.dramaDirectors.map((dd) => ({
            name: dd.director.name,
          })),
          writers: drama.dramaWriters.map((dw) => ({
            name: dw.writer.name,
          })),
          novelAuthors: drama.dramaNovelAuthor.map((dna) => ({
            name: dna.novelAuthor.name,
            novelTitle: dna.novelTitle || "",
          })),
          networks: drama.dramaNetworks.map((dn) => ({
            name: dn.network.name,
          })),
          production: drama.production ? { name: drama.production.name } : null,
        };

        return { success: true, drama: transformedDrama };
      } catch (error) {
        return {
          success: false,
          drama: null,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    ["drama-by-id", id],
    {
      revalidate: 300,
      tags: ["dramas", `drama-${id}`],
    }
  )();
}

// Get drama by slug - CACHED (untuk detail page)
export async function getDramaBySlug(slug: string) {
  return unstable_cache(
    async () => {
      try {
        const drama = await prisma.drama.findUnique({
          where: { slug },
          include: {
            episodes: {
              select: {
                id: true,
                episodeNum: true,
                slug: true,
                releaseDate: true,
                videoUrl: true,
              },
              orderBy: {
                episodeNum: "asc",
              },
            },
            dramaCasts: {
              include: {
                cast: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            dramaDirectors: {
              include: {
                director: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            dramaWriters: {
              include: {
                writer: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            dramaNovelAuthor: {
              include: {
                novelAuthor: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            dramaNetworks: {
              include: {
                network: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            production: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                episodes: true,
              },
            },
          },
        });

        if (!drama) {
          return { success: false, drama: null };
        }

        return { success: true, drama };
      } catch (error) {
        return {
          success: false,
          drama: null,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    ["drama-by-slug", slug],
    {
      revalidate: 180,
      tags: ["dramas", `drama-slug-${slug}`],
    }
  )();
}

// Search dramas - NO CACHE (realtime search)
export async function searchDramas(
  query: string,
  options?: {
    limit?: number;
    offset?: number;
  }
) {
  try {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    const [dramas, total] = await Promise.all([
      prisma.drama.findMany({
        where: {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          releaseDate: true,
          status: true,
          totalEpisode: true,
          isPopular: true,
        },
        orderBy: {
          title: "asc",
        },
        skip: offset,
        take: limit,
      }),
      prisma.drama.count({
        where: {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
      }),
    ]);

    return {
      success: true,
      dramas: dramas || [],
      total,
      hasMore: offset + dramas.length < total,
    };
  } catch (error) {
    return {
      success: false,
      dramas: [],
      total: 0,
      hasMore: false,
      error: "Failed to search dramas",
    };
  }
}

// Get dramas with filters - PARTIAL CACHE (cache per filter combination)
export async function getDramasWithFilters(filters: {
  status?: string;
  search?: string;
  sortBy?: "title" | "releaseDate" | "popular";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}) {
  if (filters.search) {
    return getDramasWithFiltersUncached(filters);
  }

  const cacheKey = [
    "dramas-filtered",
    filters.status || "all",
    filters.sortBy || "releaseDate",
    filters.order || "desc",
    filters.limit || 20,
    filters.offset || 0,
  ].join("-");

  return unstable_cache(
    () => getDramasWithFiltersUncached(filters),
    [cacheKey],
    {
      revalidate: 60,
      tags: ["dramas", "dramas-filtered"],
    }
  )();
}

// Helper function - actual query without cache
async function getDramasWithFiltersUncached(filters: {
  status?: string;
  search?: string;
  sortBy?: "title" | "releaseDate" | "popular";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}) {
  try {
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    const where: any = {};

    if (filters.status && filters.status !== "all") {
      where.status = filters.status;
    }

    if (filters.search) {
      where.title = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    let orderBy: any = {};

    if (filters.sortBy === "popular") {
      orderBy = [{ isPopular: "desc" }, { releaseDate: "desc" }];
    } else if (filters.sortBy === "title") {
      orderBy = { title: "asc" };
    } else {
      orderBy = { releaseDate: "desc" };
    }

    const [dramas, total] = await Promise.all([
      prisma.drama.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          releaseDate: true,
          status: true,
          totalEpisode: true,
          isPopular: true,
          description: true,
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.drama.count({ where }),
    ]);

    return {
      success: true,
      dramas: dramas || [],
      total,
      hasMore: offset + dramas.length < total,
    };
  } catch (error) {
    console.error("Error fetching dramas with filters:", error);
    return {
      success: false,
      dramas: [],
      total: 0,
      hasMore: false,
      error: "Failed to fetch dramas with filters",
    };
  }
}

// Get popular dramas - HEAVILY CACHED
export async function getAllPopularDrama(limit?: number) {
  return unstable_cache(
    async () => {
      try {
        const dramas = await prisma.drama.findMany({
          where: {
            isPopular: true,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            releaseDate: true,
            status: true,
            totalEpisode: true,
            description: true,
          },
          orderBy: {
            releaseDate: "desc",
          },
          take: limit || 10,
        });

        return { success: true, dramas: dramas || [] };
      } catch (error) {
        return {
          success: false,
          dramas: [],
          error: "Failed to fetch popular dramas",
        };
      }
    },
    ["dramas-popular", String(limit || 10)],
    {
      revalidate: 300,
      tags: ["dramas", "dramas-popular"],
    }
  )();
}

// Get recently completed - CACHED
export async function getRecentlyCompleted(limit?: number) {
  return unstable_cache(
    async () => {
      try {
        const dramas = await prisma.drama.findMany({
          where: {
            status: "TAMAT",
          },
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            releaseDate: true,
            status: true,
            totalEpisode: true,
            description: true,
          },
          orderBy: {
            releaseDate: "desc",
          },
          take: limit || 10,
        });

        return { success: true, dramas: dramas || [] };
      } catch (error) {
        return {
          success: false,
          dramas: [],
          error: "Failed to fetch completed dramas",
        };
      }
    },
    ["dramas-completed", String(limit || 10)],
    {
      revalidate: 300,
      tags: ["dramas", "dramas-completed"],
    }
  )();
}

// Get related dramas - CACHED per drama
export async function getRelatedDramas(dramaId: string, limit?: number) {
  return unstable_cache(
    async () => {
      try {
        const currentDrama = await prisma.drama.findUnique({
          where: { id: dramaId },
          select: {
            releaseDate: true,
            productionId: true,
            status: true,
          },
        });

        if (!currentDrama) {
          return { success: false, dramas: [] };
        }

        const actualLimit = limit || 6;

        // Priority 1: Same production company
        if (currentDrama.productionId) {
          const sameProduction = await prisma.drama.findMany({
            where: {
              productionId: currentDrama.productionId,
              id: {
                not: dramaId,
              },
            },
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
              releaseDate: true,
              status: true,
              totalEpisode: true,
            },
            orderBy: {
              releaseDate: "desc",
            },
            take: actualLimit,
          });

          if (sameProduction.length >= actualLimit) {
            return { success: true, dramas: sameProduction };
          }

          const year = new Date(currentDrama.releaseDate).getFullYear();
          const startDate = new Date(year, 0, 1);
          const endDate = new Date(year, 11, 31, 23, 59, 59);

          const sameYear = await prisma.drama.findMany({
            where: {
              id: {
                not: dramaId,
              },
              productionId: {
                not: currentDrama.productionId,
              },
              releaseDate: {
                gte: startDate,
                lte: endDate,
              },
            },
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
              releaseDate: true,
              status: true,
              totalEpisode: true,
            },
            orderBy: {
              releaseDate: "desc",
            },
            take: actualLimit - sameProduction.length,
          });

          return {
            success: true,
            dramas: [...sameProduction, ...sameYear],
          };
        }

        // Priority 2: Same year range
        const year = new Date(currentDrama.releaseDate).getFullYear();
        const startDate = new Date(year - 1, 0, 1);
        const endDate = new Date(year + 1, 11, 31, 23, 59, 59);

        const dramas = await prisma.drama.findMany({
          where: {
            id: {
              not: dramaId,
            },
            releaseDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            releaseDate: true,
            status: true,
            totalEpisode: true,
          },
          orderBy: {
            releaseDate: "desc",
          },
          take: actualLimit,
        });

        return { success: true, dramas: dramas || [] };
      } catch (error) {
        return {
          success: false,
          dramas: [],
          error: "Failed to fetch related dramas",
        };
      }
    },
    ["dramas-related", dramaId, String(limit || 6)],
    {
      revalidate: 600,
      tags: ["dramas", `drama-${dramaId}-related`],
    }
  )();
}

// Get featured drama - CACHED
export async function getFeaturedDrama() {
  return unstable_cache(
    async () => {
      try {
        const popularDramas = await prisma.drama.findMany({
          where: {
            isPopular: true,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            description: true,
            releaseDate: true,
            status: true,
            totalEpisode: true,
            airTime: true,
          },
          orderBy: {
            releaseDate: "desc",
          },
          take: 5,
        });

        if (popularDramas.length === 0) {
          return { success: false, drama: null };
        }

        // Pick random drama from top 5
        const randomIndex = Math.floor(Math.random() * popularDramas.length);
        const drama = popularDramas[randomIndex];

        return { success: true, drama };
      } catch (error) {
        return {
          success: false,
          drama: null,
          error: "Failed to fetch featured drama",
        };
      }
    },
    ["drama-featured"],
    {
      revalidate: 300,
      tags: ["dramas", "dramas-featured"],
    }
  )();
}
