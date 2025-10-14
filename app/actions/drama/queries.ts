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

// Get drama by slug with episodes
export async function getDramaBySlug(slug: string) {
  try {
    const drama = await prisma.drama.findUnique({
      where: { slug },
      include: {
        episodes: {
          orderBy: { episodeNum: "asc" },
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

    if (filters.status) {
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
    } else {
      orderBy = {
        [filters.sortBy || "title"]: filters.order || "asc",
      };
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

// Get related dramas (exclude current drama)
export async function getRelatedDramas(dramaId: string, limit?: number) {
  try {
    const currentDrama = await prisma.drama.findUnique({
      where: { id: dramaId },
      select: { releaseDate: true },
    });

    if (!currentDrama) {
      return { success: false, dramas: [] };
    }

    // Get dramas from same year or nearby years
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
