"use server";

import { supabase } from "@/lib/supabase";

export async function getHomepageData() {
  try {
    console.log("Fetching homepage data with Supabase...");

    // Fetch all data in parallel
    const [
      { data: allPopular },
      { data: popularDramas },
      { data: ongoingDramas },
      { data: completedDramas },
      { data: latestEpisodes },
    ] = await Promise.all([
      // Featured drama (random from popular)
      supabase
        .from("Drama")
        .select(
          "id, title, slug, thumbnail, description, releaseDate, status, totalEpisode, airTime"
        )
        .eq("isPopular", true)
        .order("releaseDate", { ascending: false })
        .limit(5),

      // Popular dramas
      supabase
        .from("Drama")
        .select(
          "id, title, slug, thumbnail, releaseDate, status, totalEpisode, description"
        )
        .eq("isPopular", true)
        .order("releaseDate", { ascending: false })
        .limit(10),

      // Ongoing dramas
      supabase
        .from("Drama")
        .select(
          "id, title, slug, thumbnail, releaseDate, status, totalEpisode, description, airTime"
        )
        .eq("status", "ONGOING")
        .order("releaseDate", { ascending: false })
        .limit(10),

      // Completed dramas
      supabase
        .from("Drama")
        .select(
          "id, title, slug, thumbnail, releaseDate, status, totalEpisode, description"
        )
        .eq("status", "TAMAT")
        .order("releaseDate", { ascending: false })
        .limit(10),

      // Latest episodes with drama info
      supabase
        .from("Episode")
        .select(
          `
          *,
          drama:Drama!inner(
            title,
            slug,
            thumbnail,
            status
          )
        `
        )
        .order("releaseDate", { ascending: false })
        .limit(12),
    ]);

    // Pick random featured from popular
    const featuredDrama =
      allPopular && allPopular.length > 0
        ? allPopular[Math.floor(Math.random() * allPopular.length)]
        : null;

    console.log("Data fetched successfully:", {
      featured: !!featuredDrama,
      popular: popularDramas?.length || 0,
      ongoing: ongoingDramas?.length || 0,
      completed: completedDramas?.length || 0,
      episodes: latestEpisodes?.length || 0,
    });

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
  }
}

export async function getSiteStats() {
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
        error instanceof Error ? error.message : "Failed to fetch site stats",
    };
  }
}
