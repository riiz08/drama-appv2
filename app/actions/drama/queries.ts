"use server";

import { prisma } from "@/lib/db";
import { Status } from "@/app/generated/prisma";

// Get all dramas with flexible options
export async function getAllDramas(options?: {
  status?: Status;
  limit?: number;
  offset?: number;
  orderBy?: "title" | "releaseDate" | "createdAt";
  order?: "asc" | "desc";
  includeRelations?: boolean;
}) {
  try {
    const dramas = await prisma.drama.findMany({
      where: options?.status ? { status: options.status } : undefined,
      take: options?.limit,
      skip: options?.offset,
      orderBy: {
        [options?.orderBy || "title"]: options?.order || "asc",
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
        description: true,
        airTime: true,
        episodes: true,
        ...(options?.includeRelations && {
          production: {
            select: {
              id: true,
              name: true,
            },
          },
          networks: {
            select: {
              network: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        }),
      },
    });

    return { success: true, dramas };
  } catch (error) {
    return {
      success: false,
      dramas: [],
      error: "Failed to fetch dramas",
    };
  }
}

// Get drama by slug with ALL relations
export async function getDramaBySlug(slug: string) {
  try {
    const drama = await prisma.drama.findUnique({
      where: { slug },
      include: {
        episodes: {
          orderBy: { episodeNum: "asc" },
          select: {
            id: true,
            episodeNum: true,
            slug: true,
            releaseDate: true,
            videoUrl: true,
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
        production: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { episodes: true },
        },
      },
    });

    if (!drama) return { success: false, drama: null };

    return { success: true, drama };
  } catch (error) {
    return {
      success: false,
      drama: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Search dramas by title with pagination
export async function searchDramas(
  query: string,
  options?: {
    limit?: number;
    offset?: number;
  }
) {
  try {
    const where = {
      title: {
        contains: query,
        mode: "insensitive" as const,
      },
    };

    const [dramas, total] = await Promise.all([
      prisma.drama.findMany({
        where,
        take: options?.limit || 20,
        skip: options?.offset || 0,
        orderBy: { title: "asc" },
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
      }),
      prisma.drama.count({ where }),
    ]);

    return {
      success: true,
      dramas,
      total,
      hasMore: (options?.offset || 0) + dramas.length < total,
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

// Get dramas with filters and sorting
export async function getDramasWithFilters(filters: {
  status?: string;
  search?: string;
  sortBy?: "title" | "releaseDate" | "popular";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}) {
  try {
    const where: any = {};

    // Status filter - only apply if status is provided and valid
    if (filters.status && filters.status !== "all") {
      where.status = filters.status;
    }

    // Search filter
    if (filters.search) {
      where.title = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    // Determine order by
    let orderBy: any = {};
    if (filters.sortBy === "popular") {
      // For popular, sort by isPopular first, then by release date
      orderBy = [{ isPopular: "desc" }, { releaseDate: "desc" }];
    } else if (filters.sortBy === "title") {
      orderBy = { title: "asc" };
    } else {
      // Default: latest (releaseDate desc)
      orderBy = { releaseDate: "desc" };
    }

    const [dramas, total] = await Promise.all([
      prisma.drama.findMany({
        where,
        take: filters.limit || 20,
        skip: filters.offset || 0,
        orderBy,
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
      }),
      prisma.drama.count({ where }),
    ]);

    return {
      success: true,
      dramas,
      total,
      hasMore: (filters.offset || 0) + dramas.length < total,
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

// Get all popular dramas
export async function getAllPopularDrama(limit?: number) {
  try {
    const dramas = await prisma.drama.findMany({
      where: {
        isPopular: true,
      },
      take: limit || 10,
      orderBy: {
        releaseDate: "desc",
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
    });

    return { success: true, dramas };
  } catch (error) {
    return {
      success: false,
      dramas: [],
      error: "Failed to fetch popular dramas",
    };
  }
}

// Get recently completed dramas
export async function getRecentlyCompleted(limit?: number) {
  try {
    const dramas = await prisma.drama.findMany({
      where: {
        status: "TAMAT",
      },
      take: limit || 10,
      orderBy: {
        releaseDate: "desc",
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
    });

    return { success: true, dramas };
  } catch (error) {
    return {
      success: false,
      dramas: [],
      error: "Failed to fetch completed dramas",
    };
  }
}

// Get related dramas (improved logic)
export async function getRelatedDramas(dramaId: string, limit?: number) {
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

    // Priority 1: Same production company
    if (currentDrama.productionId) {
      const sameProduction = await prisma.drama.findMany({
        where: {
          id: { not: dramaId },
          productionId: currentDrama.productionId,
        },
        take: limit || 6,
        orderBy: {
          releaseDate: "desc",
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
      });

      if (sameProduction.length >= (limit || 6)) {
        return { success: true, dramas: sameProduction };
      }

      // If not enough, combine with dramas from same year
      const year = currentDrama.releaseDate.getFullYear();
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      const sameYear = await prisma.drama.findMany({
        where: {
          id: { not: dramaId },
          productionId: { not: currentDrama.productionId },
          releaseDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        take: (limit || 6) - sameProduction.length,
        orderBy: {
          releaseDate: "desc",
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
      });

      return {
        success: true,
        dramas: [...sameProduction, ...sameYear],
      };
    }

    // Priority 2: Same year if no production
    const year = currentDrama.releaseDate.getFullYear();
    const startDate = new Date(year - 1, 0, 1);
    const endDate = new Date(year + 1, 11, 31);

    const dramas = await prisma.drama.findMany({
      where: {
        id: { not: dramaId },
        releaseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      take: limit || 6,
      orderBy: {
        releaseDate: "desc",
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
    });

    return { success: true, dramas };
  } catch (error) {
    return {
      success: false,
      dramas: [],
      error: "Failed to fetch related dramas",
    };
  }
}

// Get featured drama for hero banner (random popular)
export async function getFeaturedDrama() {
  try {
    const popularDramas = await prisma.drama.findMany({
      where: {
        isPopular: true,
      },
      take: 5,
      orderBy: {
        releaseDate: "desc",
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
}
