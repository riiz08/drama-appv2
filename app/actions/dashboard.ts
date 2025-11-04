// file: app/actions/dashboard.ts
"use server";

import { supabase } from "@/lib/supabase";

export async function getTopDramas(limit: number = 5) {
  try {
    // Get dramas dengan jumlah episode
    const { data: dramas, error } = await supabase
      .from("Drama")
      .select(
        `
        id,
        title,
        slug,
        thumbnail,
        episodes:Episode(count)
      `
      )
      .order("isPopular", { ascending: false })
      .order("createdAt", { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Format data untuk komponen
    const formattedDramas =
      dramas?.map((drama) => ({
        id: drama.id,
        title: drama.title,
        slug: drama.slug,
        thumbnail: drama.thumbnail,
        episodes: drama.episodes?.[0]?.count || 0,
        // Mock views & trend untuk sekarang (nanti bisa diganti dengan real data)
        views: Math.floor(Math.random() * 10000) + 5000,
        trend: `+${Math.floor(Math.random() * 20) + 5}%`,
      })) || [];

    return { success: true, dramas: formattedDramas };
  } catch (error) {
    console.error("Error fetching top dramas:", error);
    return {
      success: false,
      error: "Failed to fetch top dramas",
      dramas: [],
    };
  }
}

export async function getRecentActivities(limit: number = 5) {
  try {
    // Get recent dramas
    const { data: recentDramas, error: dramaError } = await supabase
      .from("Drama")
      .select("title, createdAt")
      .order("createdAt", { ascending: false })
      .limit(3);

    if (dramaError) {
      console.error("Error fetching dramas:", dramaError);
      throw dramaError;
    }

    // Get recent episodes dengan drama info
    const { data: recentEpisodes, error: episodeError } = await supabase
      .from("Episode")
      .select(
        `
        episodeNum, 
        createdAt, 
        dramaId,
        Drama!inner (
          title
        )
      `
      )
      .order("createdAt", { ascending: false })
      .limit(3);

    if (episodeError) {
      console.error("Error fetching episodes:", episodeError);
      throw episodeError;
    }

    // Combine dan sort berdasarkan waktu
    const activities = [
      ...(recentDramas?.map((d) => ({
        type: "drama" as const,
        title: `Drama "${d.title}" ditambahkan`,
        time: d.createdAt,
      })) || []),
      ...(recentEpisodes?.map((e) => ({
        type: "episode" as const,
        title: `Episode ${e.episodeNum} "${(e.Drama as any)?.[0]?.title || "Unknown"}" di-upload`,
        time: e.createdAt,
      })) || []),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limit);

    return { success: true, activities };
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return {
      success: false,
      error: "Failed to fetch activities",
      activities: [],
    };
  }
}
