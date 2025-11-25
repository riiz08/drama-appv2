"use server";

import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export async function getHomepageData() {
  return unstable_cache(
    async () => {
      try {
        // Parallel fetch with Promise.all
        const [
          allPopular,
          popularDramas,
          ongoingDramas,
          completedDramas,
          latestEpisodes,
        ] = await Promise.all([
          prisma.drama.findMany({
            where: { isPopular: true },
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
            orderBy: { releaseDate: "desc" },
            take: 5,
          }),

          prisma.drama.findMany({
            where: { isPopular: true },
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
            orderBy: { releaseDate: "desc" },
            take: 10,
          }),

          prisma.drama.findMany({
            where: { status: "ONGOING" },
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
            orderBy: { releaseDate: "desc" },
            take: 10,
          }),

          prisma.drama.findMany({
            where: { status: "TAMAT" },
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
            orderBy: { releaseDate: "desc" },
            take: 10,
          }),

          prisma.episode.findMany({
            select: {
              id: true,
              videoUrl: true,
              episodeNum: true,
              releaseDate: true,
              slug: true,
              dramaId: true,
              createdAt: true,
              updatedAt: true,
              drama: {
                select: {
                  title: true,
                  slug: true,
                  thumbnail: true,
                  status: true,
                },
              },
            },
            orderBy: { releaseDate: "desc" },
            take: 12,
          }),
        ]);

        const featuredDrama =
          allPopular && allPopular.length > 0
            ? allPopular[Math.floor(Math.random() * allPopular.length)]
            : null;

        return {
          success: true,
          data: {
            featured: featuredDrama,
            popular: popularDramas || [],
            ongoing: ongoingDramas || [],
            completed: completedDramas || [],
            latestEpisodes: latestEpisodes || [],
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
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch homepage data",
        };
      }
    },
    ["homepage-data"],
    {
      revalidate: 60, // 1 minute - homepage harus fresh
      tags: ["homepage", "dramas", "episodes"],
    }
  )();
}

export async function getSiteStats() {
  return unstable_cache(
    async () => {
      try {
        const [totalDramas, totalEpisodes, ongoingCount, completedCount] =
          await Promise.all([
            prisma.drama.count(),
            prisma.episode.count(),
            prisma.drama.count({
              where: { status: "ONGOING" },
            }),
            prisma.drama.count({
              where: { status: "TAMAT" },
            }),
          ]);

        return {
          success: true,
          stats: {
            totalDramas: totalDramas || 0,
            totalEpisodes: totalEpisodes || 0,
            ongoingCount: ongoingCount || 0,
            completedCount: completedCount || 0,
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
            error instanceof Error
              ? error.message
              : "Failed to fetch site stats",
        };
      }
    },
    ["site-stats"],
    {
      revalidate: 300, // 5 minutes - stats jarang berubah
      tags: ["site-stats", "dramas", "episodes"],
    }
  )();
}
