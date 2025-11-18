"use server";

import { supabase } from "@/lib/supabase";
import { unstable_cache } from "next/cache";

// ============================================
// TOP DRAMAS - CACHED
// ============================================

export async function getTopDramas(limit: number = 5) {
  return unstable_cache(
    async () => {
      try {
        // Single optimized query with aggregation
        const { data: dramas, error } = await supabase
          .from("Drama")
          .select(
            `
            id,
            title,
            slug,
            thumbnail,
            isPopular,
            dramaStats:DramaStats(totalViews),
            episodes:Episode(id)
          `
          )
          .order("isPopular", { ascending: false })
          .order("createdAt", { ascending: false })
          .limit(limit * 2); // Fetch more to ensure we have enough after sorting

        if (error) throw error;

        // Format and sort by views
        const formattedDramas =
          dramas
            ?.map((drama) => ({
              id: drama.id,
              title: drama.title,
              slug: drama.slug,
              thumbnail: drama.thumbnail,
              episodes: drama.episodes?.length || 0,
              views: (drama.dramaStats as any)?.[0]?.totalViews || 0,
              trend: `+${Math.floor(Math.random() * 20) + 5}%`,
            }))
            .sort((a, b) => b.views - a.views)
            .slice(0, limit) || [];

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
        const [dramasResult, episodesResult] = await Promise.all([
          supabase
            .from("Drama")
            .select("title, createdAt")
            .order("createdAt", { ascending: false })
            .limit(3),
          supabase
            .from("Episode")
            .select(
              `
              episodeNum, 
              createdAt,
              drama:Drama!inner(title)
            `
            )
            .order("createdAt", { ascending: false })
            .limit(3),
        ]);

        if (dramasResult.error) throw dramasResult.error;
        if (episodesResult.error) throw episodesResult.error;

        // Combine and sort
        const activities = [
          ...(dramasResult.data?.map((d) => ({
            type: "drama" as const,
            title: `Drama "${d.title}" ditambahkan`,
            time: d.createdAt,
          })) || []),
          ...(episodesResult.data?.map((e) => ({
            type: "episode" as const,
            title: `Episode ${e.episodeNum} "${(e.drama as any)?.title || "Unknown"}" di-upload`,
            time: e.createdAt,
          })) || []),
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
