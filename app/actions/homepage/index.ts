"use server";

import { supabase } from "@/lib/supabase";
import { unstable_cache } from "next/cache";

export async function getHomepageData() {
  return unstable_cache(
    async () => {
      try {
        // Parallel fetch with Promise.all
        const [
          { data: allPopular },
          { data: popularDramas },
          { data: ongoingDramas },
          { data: completedDramas },
          { data: latestEpisodes },
        ] = await Promise.all([
          supabase
            .from("Drama")
            .select(
              "id, title, slug, thumbnail, description, releaseDate, status, totalEpisode, airTime"
            )
            .eq("isPopular", true)
            .order("releaseDate", { ascending: false })
            .limit(5),

          supabase
            .from("Drama")
            .select(
              "id, title, slug, thumbnail, releaseDate, status, totalEpisode, description"
            )
            .eq("isPopular", true)
            .order("releaseDate", { ascending: false })
            .limit(10),

          supabase
            .from("Drama")
            .select(
              "id, title, slug, thumbnail, releaseDate, status, totalEpisode, description, airTime"
            )
            .eq("status", "ONGOING")
            .order("releaseDate", { ascending: false })
            .limit(10),

          supabase
            .from("Drama")
            .select(
              "id, title, slug, thumbnail, releaseDate, status, totalEpisode, description"
            )
            .eq("status", "TAMAT")
            .order("releaseDate", { ascending: false })
            .limit(10),

          supabase
            .from("Episode")
            .select(`*, drama:Drama!inner(title, slug, thumbnail, status)`)
            .order("releaseDate", { ascending: false })
            .limit(12),
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
        const [
          { count: totalDramas },
          { count: totalEpisodes },
          { count: ongoingCount },
          { count: completedCount },
        ] = await Promise.all([
          supabase.from("Drama").select("*", { count: "exact", head: true }),
          supabase.from("Episode").select("*", { count: "exact", head: true }),
          supabase
            .from("Drama")
            .select("*", { count: "exact", head: true })
            .eq("status", "ONGOING"),
          supabase
            .from("Drama")
            .select("*", { count: "exact", head: true })
            .eq("status", "TAMAT"),
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
