"use server";

import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";

export async function trackDramaView(dramaId: string) {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Execute both updates in parallel with upsert (single query each)
    const [statsResult, dailyResult] = await Promise.all([
      // 1. Upsert DramaStats (1 query instead of 2)
      supabase.rpc("increment_drama_views", { drama_id: dramaId }),

      // 2. Upsert DramaViewsDaily (1 query instead of 2)
      supabase.rpc("increment_daily_views", {
        drama_id: dramaId,
        view_date: today,
      }),
    ]);

    // Fallback jika RPC tidak tersedia - gunakan upsert manual
    if (statsResult.error || dailyResult.error) {
      await Promise.all([
        supabase.from("DramaStats").upsert(
          {
            dramaId,
            totalViews: 1,
            updatedAt: new Date().toISOString(),
          },
          {
            onConflict: "dramaId",
            ignoreDuplicates: false,
          }
        ),

        supabase.from("DramaViewsDaily").upsert(
          {
            dramaId,
            date: today,
            views: 1,
          },
          {
            onConflict: "dramaId,date",
            ignoreDuplicates: false,
          }
        ),
      ]);
    }

    // Invalidate dashboard cache (views changed)
    revalidateTag("dashboard-top-dramas");

    return { success: true };
  } catch (error) {
    console.error("Error tracking view:", error);
    return { success: false, error: "Failed to track view" };
  }
}
