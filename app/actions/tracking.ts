// file: app/actions/tracking.ts
"use server";

import { supabase } from "@/lib/supabase";

export async function trackDramaView(dramaId: string) {
  try {
    const today = new Date().toISOString().split("T")[0];

    // 1. Update atau create DramaStats
    const { data: stats, error: statsError } = await supabase
      .from("DramaStats")
      .select("*")
      .eq("dramaId", dramaId)
      .maybeSingle();

    if (stats) {
      // Update existing
      await supabase
        .from("DramaStats")
        .update({
          totalViews: stats.totalViews + 1,
          updatedAt: new Date().toISOString(),
        })
        .eq("dramaId", dramaId);
    } else {
      // Create new
      await supabase.from("DramaStats").insert({
        dramaId,
        totalViews: 1,
      });
    }

    // 2. Update atau create DramaViewsDaily
    const { data: dailyStats, error: dailyError } = await supabase
      .from("DramaViewsDaily")
      .select("*")
      .eq("dramaId", dramaId)
      .eq("date", today)
      .maybeSingle();

    if (dailyStats) {
      // Update existing
      await supabase
        .from("DramaViewsDaily")
        .update({
          views: dailyStats.views + 1,
        })
        .eq("dramaId", dramaId)
        .eq("date", today);
    } else {
      // Create new
      await supabase.from("DramaViewsDaily").insert({
        dramaId,
        date: today,
        views: 1,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error tracking view:", error);
    return { success: false, error: "Failed to track view" };
  }
}
