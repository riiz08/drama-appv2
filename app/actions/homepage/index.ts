"use server";

import { prisma } from "@/lib/db";

// Get all homepage data in one optimized query
export async function getHomepageData() {
  try {
    const [
      featuredDrama,
      popularDramas,
      ongoingDramas,
      completedDramas,
      latestEpisodes,
    ] = await Promise.all([
      // Featured drama for hero banner (random popular)
      prisma.drama
        .findMany({
          where: { isPopular: true },
          take: 5,
          orderBy: { releaseDate: "desc" },
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
        })
        .then((dramas) => {
          if (dramas.length === 0) return null;
          return dramas[Math.floor(Math.random() * dramas.length)];
        }),

      // Popular dramas section
      prisma.drama.findMany({
        where: { isPopular: true },
        take: 10,
        orderBy: { releaseDate: "desc" },
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
      }),

      // Ongoing dramas section
      prisma.drama.findMany({
        where: { status: "ONGOING" },
        take: 10,
        orderBy: { releaseDate: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          releaseDate: true,
          status: true,
          totalEpisode: true,
          description: true,
          airTime: true,
        },
      }),

      // Recently completed dramas section
      prisma.drama.findMany({
        where: { status: "TAMAT" },
        take: 10,
        orderBy: { releaseDate: "desc" },
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
      }),

      // Latest episodes section
      prisma.episode.findMany({
        take: 12,
        orderBy: { releaseDate: "desc" },
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
    ]);

    return {
      success: true,
      data: {
        featured: featuredDrama,
        popular: popularDramas,
        ongoing: ongoingDramas,
        completed: completedDramas,
        latestEpisodes: latestEpisodes,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: {
        featured: null,
        popular: [],
        ongoing: [],
        completed: [],
        latestEpisodes: [],
      },
      error: "Failed to fetch homepage data",
    };
  }
}

// Get site statistics
export async function getSiteStats() {
  try {
    const [totalDramas, totalEpisodes, ongoingCount, completedCount] =
      await Promise.all([
        prisma.drama.count(),
        prisma.episode.count(),
        prisma.drama.count({ where: { status: "ONGOING" } }),
        prisma.drama.count({ where: { status: "TAMAT" } }),
      ]);

    return {
      success: true,
      stats: {
        totalDramas,
        totalEpisodes,
        ongoingCount,
        completedCount,
      },
    };
  } catch (error) {
    return {
      success: false,
      stats: {
        totalDramas: 0,
        totalEpisodes: 0,
        ongoingCount: 0,
        completedCount: 0,
      },
      error: "Failed to fetch site stats",
    };
  }
}
