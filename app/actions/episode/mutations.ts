"use server";

import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";

// Types
export interface CreateEpisodeInput {
  videoUrl: string;
  dramaId: string;
  episodeNum: number;
  releaseDate: string | Date;
  slug: string;
}

function generateUUID(): string {
  return crypto.randomUUID();
}

// ============================================
// HELPER: Check Episode Exists
// ============================================

export async function checkEpisodeExists(dramaId: string, episodeNum: number) {
  try {
    const { data: existingEpisode, error } = await supabase
      .from("Episode")
      .select("id, slug")
      .eq("dramaId", dramaId)
      .eq("episodeNum", episodeNum)
      .maybeSingle();

    return {
      success: true,
      exists: !!existingEpisode,
      episodeId: existingEpisode?.id || null,
      episodeSlug: existingEpisode?.slug || null,
    };
  } catch (error) {
    console.error("Error checking episode:", error);
    return {
      success: false,
      exists: false,
      episodeId: null,
      episodeSlug: null,
    };
  }
}

// ============================================
// CREATE EPISODE
// ============================================

export async function createEpisode(data: CreateEpisodeInput) {
  try {
    // Check if episode already exists
    const checkResult = await checkEpisodeExists(data.dramaId, data.episodeNum);

    if (checkResult.exists) {
      return {
        success: false,
        error: `Episode ${data.episodeNum} untuk drama ini sudah wujud`,
      };
    }

    // Get drama info for cache invalidation
    const { data: drama } = await supabase
      .from("Drama")
      .select("slug")
      .eq("id", data.dramaId)
      .single();

    const { data: episode, error } = await supabase
      .from("Episode")
      .insert({
        id: generateUUID(),
        ...data,
        releaseDate: new Date(data.releaseDate).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Smart cache invalidation
    revalidateTag("episodes");
    revalidateTag("episodes-latest");
    revalidateTag("episodes-admin");
    revalidateTag("episodes-all-slugs");
    revalidateTag("episodes-popular");
    revalidateTag("episodes-slugs");
    revalidateTag(`drama-${data.dramaId}-episodes`);
    revalidateTag(`drama-${data.dramaId}-count`);

    if (drama?.slug) {
      revalidateTag(`drama-slug-${drama.slug}-episodes`);
      revalidateTag(`drama-slug-${drama.slug}`);
    }

    // Invalidate drama cache (episode count changed)
    revalidateTag("dramas");
    revalidateTag("dramas-list");
    revalidateTag(`drama-${data.dramaId}`);
    revalidateTag("homepage");
    revalidateTag("site-stats");

    return { success: true, episode };
  } catch (error) {
    console.error("Error creating episode:", error);
    return {
      success: false,
      error: "Gagal menambah episode",
    };
  }
}

// ============================================
// UPDATE EPISODE
// ============================================

export async function updateEpisode(
  id: string,
  data: Partial<CreateEpisodeInput>
) {
  try {
    // Get current episode
    const { data: currentEpisode, error: fetchError } = await supabase
      .from("Episode")
      .select(
        `
        dramaId,
        episodeNum,
        slug,
        drama:Drama!inner(slug)
      `
      )
      .eq("id", id)
      .single();

    if (fetchError || !currentEpisode) {
      return {
        success: false,
        error: "Episode not found",
      };
    }

    const dramaSlug = (currentEpisode.drama as any).slug;
    const oldSlug = currentEpisode.slug;

    // Check for duplicate if episodeNum is being changed
    if (data.episodeNum && data.episodeNum !== currentEpisode.episodeNum) {
      const checkResult = await checkEpisodeExists(
        currentEpisode.dramaId,
        data.episodeNum
      );

      if (checkResult.exists) {
        return {
          success: false,
          error: `Episode ${data.episodeNum} untuk drama ini sudah wujud`,
        };
      }
    }

    const updateData: any = { ...data };

    if (data.releaseDate) {
      updateData.releaseDate = new Date(data.releaseDate).toISOString();
    }

    const { data: episode, error } = await supabase
      .from("Episode")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Smart cache invalidation
    revalidateTag("episodes");
    revalidateTag("episodes-latest");
    revalidateTag("episodes-admin");
    revalidateTag(`episode-${oldSlug}`);
    revalidateTag(`episode-${episode.slug}`);
    revalidateTag(`episode-${oldSlug}-metadata`);
    revalidateTag(`episode-${episode.slug}-metadata`);
    revalidateTag(`drama-${currentEpisode.dramaId}-episodes`);
    revalidateTag("dashboard");
    revalidateTag("dashboard-activities");

    if (dramaSlug) {
      revalidateTag(`drama-slug-${dramaSlug}-episodes`);
      revalidateTag(`drama-slug-${dramaSlug}`);
    }

    // If slug changed, invalidate both old and new
    if (data.slug && data.slug !== oldSlug) {
      revalidateTag("episodes-all-slugs");
      revalidateTag("episodes-slugs");
    }

    // If episodeNum changed, invalidate adjacent episodes
    if (data.episodeNum && data.episodeNum !== currentEpisode.episodeNum) {
      revalidateTag(`drama-${currentEpisode.dramaId}-episodes`);
    }

    return { success: true, episode };
  } catch (error) {
    console.error("Error updating episode:", error);
    return {
      success: false,
      error: "Failed to update episode",
    };
  }
}

// ============================================
// DELETE EPISODE
// ============================================

export async function deleteEpisode(id: string) {
  try {
    // Get episode info before deletion for cache invalidation
    const { data: episode } = await supabase
      .from("Episode")
      .select(
        `
        slug,
        dramaId,
        drama:Drama!inner(slug)
      `
      )
      .eq("id", id)
      .single();

    const { error } = await supabase.from("Episode").delete().eq("id", id);

    if (error) throw error;

    // Smart cache invalidation
    revalidateTag("episodes");
    revalidateTag("episodes-latest");
    revalidateTag("episodes-admin");
    revalidateTag("episodes-all-slugs");
    revalidateTag("episodes-slugs");
    revalidateTag("episodes-popular");
    revalidateTag("homepage");
    revalidateTag("site-stats");

    if (episode) {
      const dramaSlug = (episode.drama as any).slug;

      revalidateTag(`episode-${episode.slug}`);
      revalidateTag(`episode-${episode.slug}-metadata`);
      revalidateTag(`drama-${episode.dramaId}-episodes`);
      revalidateTag(`drama-${episode.dramaId}-count`);
      revalidateTag("homepage");
      revalidateTag("site-stats");

      if (dramaSlug) {
        revalidateTag(`drama-slug-${dramaSlug}-episodes`);
        revalidateTag(`drama-slug-${dramaSlug}`);
      }

      // Invalidate drama cache (episode count changed)
      revalidateTag("dramas");
      revalidateTag("dramas-list");
      revalidateTag(`drama-${episode.dramaId}`);
      revalidateTag("homepage");
      revalidateTag("site-stats");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting episode:", error);
    return {
      success: false,
      error: "Failed to delete episode",
    };
  }
}

// ============================================
// BULK CREATE EPISODES
// ============================================

export async function bulkCreateEpisodes(episodes: CreateEpisodeInput[]) {
  try {
    if (episodes.length === 0) {
      return {
        success: false,
        count: 0,
        error: "No episodes provided",
      };
    }

    const formattedEpisodes = episodes.map((ep) => ({
      id: generateUUID(),
      ...ep,
      releaseDate: new Date(ep.releaseDate).toISOString(),
    }));

    const { data, error } = await supabase
      .from("Episode")
      .insert(formattedEpisodes)
      .select();

    if (error) throw error;

    // Get drama slug for cache invalidation
    const { data: drama } = await supabase
      .from("Drama")
      .select("slug")
      .eq("id", episodes[0].dramaId)
      .single();

    const dramaId = episodes[0].dramaId;

    // Comprehensive cache invalidation for bulk create
    revalidateTag("episodes");
    revalidateTag("episodes-latest");
    revalidateTag("episodes-admin");
    revalidateTag("episodes-all-slugs");
    revalidateTag("episodes-slugs");
    revalidateTag("episodes-popular");
    revalidateTag(`drama-${dramaId}-episodes`);
    revalidateTag(`drama-${dramaId}-count`);
    revalidateTag("homepage");
    revalidateTag("site-stats");

    if (drama?.slug) {
      revalidateTag(`drama-slug-${drama.slug}-episodes`);
      revalidateTag(`drama-slug-${drama.slug}`);
      revalidateTag("homepage");
      revalidateTag("site-stats");
    }

    // Invalidate drama cache
    revalidateTag("dramas");
    revalidateTag("dramas-list");
    revalidateTag(`drama-${dramaId}`);
    revalidateTag("homepage");
    revalidateTag("site-stats");

    return {
      success: true,
      count: data?.length || 0,
      message: `Successfully created ${data?.length || 0} episode(s)`,
    };
  } catch (error) {
    console.error("Error bulk creating episodes:", error);
    return {
      success: false,
      count: 0,
      error: "Failed to bulk create episodes",
    };
  }
}

// ============================================
// BULK DELETE EPISODES BY DRAMA
// ============================================

export async function bulkDeleteEpisodesByDrama(dramaId: string) {
  try {
    // Get drama info and episodes before deletion
    const { data: drama } = await supabase
      .from("Drama")
      .select("slug")
      .eq("id", dramaId)
      .single();

    const { data: episodes } = await supabase
      .from("Episode")
      .select("slug")
      .eq("dramaId", dramaId);

    // Get count before deletion
    const { count: beforeCount } = await supabase
      .from("Episode")
      .select("*", { count: "exact", head: true })
      .eq("dramaId", dramaId);

    const { error } = await supabase
      .from("Episode")
      .delete()
      .eq("dramaId", dramaId);

    if (error) throw error;

    // Comprehensive cache invalidation
    revalidateTag("episodes");
    revalidateTag("episodes-latest");
    revalidateTag("episodes-admin");
    revalidateTag("episodes-all-slugs");
    revalidateTag("episodes-slugs");
    revalidateTag("episodes-popular");
    revalidateTag(`drama-${dramaId}-episodes`);
    revalidateTag(`drama-${dramaId}-count`);

    // Invalidate all episode slugs
    episodes?.forEach((ep) => {
      revalidateTag(`episode-${ep.slug}`);
      revalidateTag(`episode-${ep.slug}-metadata`);
    });

    if (drama?.slug) {
      revalidateTag(`drama-slug-${drama.slug}-episodes`);
      revalidateTag(`drama-slug-${drama.slug}`);
    }

    // Invalidate drama cache
    revalidateTag("dramas");
    revalidateTag("dramas-list");
    revalidateTag(`drama-${dramaId}`);

    return {
      success: true,
      count: beforeCount || 0,
      message: `Successfully deleted ${beforeCount || 0} episode(s)`,
    };
  } catch (error) {
    console.error("Error bulk deleting episodes:", error);
    return {
      success: false,
      count: 0,
      error: "Failed to bulk delete episodes",
    };
  }
}

// ============================================
// BULK DELETE EPISODES BY IDS
// ============================================

export async function bulkDeleteEpisodesByIds(episodeIds: string[]) {
  try {
    if (episodeIds.length === 0) {
      return {
        success: false,
        count: 0,
        error: "No episode IDs provided",
      };
    }

    // Get episode info before deletion
    const { data: episodes } = await supabase
      .from("Episode")
      .select(
        `
        slug,
        dramaId,
        drama:Drama!inner(slug)
      `
      )
      .in("id", episodeIds);

    // Get count before deletion
    const { count: beforeCount } = await supabase
      .from("Episode")
      .select("*", { count: "exact", head: true })
      .in("id", episodeIds);

    const { error } = await supabase
      .from("Episode")
      .delete()
      .in("id", episodeIds);

    if (error) throw error;

    // Comprehensive cache invalidation
    revalidateTag("episodes");
    revalidateTag("episodes-latest");
    revalidateTag("episodes-admin");
    revalidateTag("episodes-all-slugs");
    revalidateTag("episodes-slugs");
    revalidateTag("episodes-popular");

    // Invalidate affected dramas and episodes
    const uniqueDramaIds = Array.from(
      new Set(episodes?.map((e) => e.dramaId) || [])
    );
    const uniqueDramaSlugs = Array.from(
      new Set(episodes?.map((e) => (e.drama as any).slug) || [])
    );

    uniqueDramaIds.forEach((dramaId) => {
      revalidateTag(`drama-${dramaId}-episodes`);
      revalidateTag(`drama-${dramaId}-count`);
      revalidateTag(`drama-${dramaId}`);
    });

    uniqueDramaSlugs.forEach((slug) => {
      revalidateTag(`drama-slug-${slug}-episodes`);
      revalidateTag(`drama-slug-${slug}`);
    });

    episodes?.forEach((ep) => {
      revalidateTag(`episode-${ep.slug}`);
      revalidateTag(`episode-${ep.slug}-metadata`);
    });

    // Invalidate drama list cache
    revalidateTag("dramas");
    revalidateTag("dramas-list");

    return {
      success: true,
      count: beforeCount || 0,
      message: `Successfully deleted ${beforeCount || 0} episode(s)`,
    };
  } catch (error) {
    console.error("Error bulk deleting episodes:", error);
    return {
      success: false,
      count: 0,
      error: "Failed to bulk delete episodes",
    };
  }
}
