"use server";

import { createPrismaClient } from "@/lib/db";

export async function getHomepageData() {
  // Create fresh client per request
  const prisma = createPrismaClient();

  try {
    console.log("Fetching homepage data with fresh client...");

    const [
      featuredDrama,
      popularDramas,
      ongoingDramas,
      completedDramas,
      latestEpisodes,
    ] = await Promise.all([
      // ... queries sama seperti sebelumnya
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

    console.log("Data fetched successfully");

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
    console.error("Homepage data error:", error);
    return {
      success: false,
      data: {
        featured: null,
        popular: [],
        ongoing: [],
        completed: [],
        latestEpisodes: [],
      },
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch homepage data",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getSiteStats() {
  const prisma = createPrismaClient();

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
    console.error("Site stats error:", error);
    return {
      success: false,
      stats: {
        totalDramas: 0,
        totalEpisodes: 0,
        ongoingCount: 0,
        completedCount: 0,
      },
      error:
        error instanceof Error ? error.message : "Failed to fetch site stats",
    };
  } finally {
    await prisma.$disconnect();
  }
}
