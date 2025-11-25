"use server";

import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

// ============================================
// TOP DRAMAS - CACHED
// ============================================

export async function getTopDramas(limit: number = 5) {
  return unstable_cache(
    async () => {
      try {
        // Single optimized query with aggregation
        const dramas = await prisma.drama.findMany({
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            isPopular: true,
            dramaStats: {
              select: {
                totalViews: true,
              },
            },
            _count: {
              select: {
                episodes: true,
              },
            },
          },
          orderBy: [
            {
              isPopular: "desc",
            },
            {
              createdAt: "desc",
            },
          ],
          take: limit * 2, // Fetch more to ensure we have enough after sorting
        });

        // Format and sort by views
        const formattedDramas = dramas
          .map((drama) => ({
            id: drama.id,
            title: drama.title,
            slug: drama.slug,
            thumbnail: drama.thumbnail,
            episodes: drama._count.episodes,
            views: drama.dramaStats?.totalViews || 0,
            trend: `+${Math.floor(Math.random() * 20) + 5}%`,
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, limit);

        return { success: true, dramas: formattedDramas };
      } catch (error) {
        return {
          success: false,
          error: "Failed to fetch top dramas",
          dramas: [],
        };
      }
    },
    ["dashboard-top-dramas", limit.toString()],
    {
      revalidate: 300, // 5 minutes
      tags: ["dashboard", "dashboard-top-dramas", "dramas"],
    }
  )();
}

// ============================================
// RECENT ACTIVITIES - CACHED
// ============================================

export async function getRecentActivities(limit: number = 5) {
  return unstable_cache(
    async () => {
      try {
        // Fetch both in parallel
        const [dramas, episodes] = await Promise.all([
          prisma.drama.findMany({
            select: {
              title: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 3,
          }),
          prisma.episode.findMany({
            select: {
              episodeNum: true,
              createdAt: true,
              drama: {
                select: {
                  title: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 3,
          }),
        ]);

        // Combine and sort
        const activities = [
          ...dramas.map((d) => ({
            type: "drama" as const,
            title: `Drama "${d.title}" ditambahkan`,
            time: d.createdAt,
          })),
          ...episodes.map((e) => ({
            type: "episode" as const,
            title: `Episode ${e.episodeNum} "${e.drama.title}" di-upload`,
            time: e.createdAt,
          })),
        ]
          .sort(
            (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
          )
          .slice(0, limit);

        return { success: true, activities };
      } catch (error) {
        return {
          success: false,
          error: "Failed to fetch activities",
          activities: [],
        };
      }
    },
    ["dashboard-recent-activities", limit.toString()],
    {
      revalidate: 60, // 1 minute (lebih fresh untuk activities)
      tags: ["dashboard", "dashboard-activities"],
    }
  )();
}
