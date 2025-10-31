"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

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

// Check if episode already exists for a drama
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

// Types
export interface CreateEpisodeInput {
  videoUrl: string;
  dramaId: string;
  episodeNum: number;
  releaseDate: string | Date;
  slug: string;
}

// Create episode with duplicate check
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

    // Get drama info for revalidation
    const { data: drama } = await supabase
      .from("Drama")
      .select("slug")
      .eq("id", data.dramaId)
      .single();

    const { data: episode, error } = await supabase
      .from("Episode")
      .insert({
        id: generateUUID(), // ✅ Tambahkan ini
        ...data,
        releaseDate: new Date(data.releaseDate).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Revalidate paths
    revalidatePath("/");
    if (drama) {
      revalidatePath(`/drama/${drama.slug}`);
    }

    return { success: true, episode };
  } catch (error) {
    console.error("Error creating episode:", error);
    return {
      success: false,
      error: "Gagal menambah episode",
    };
  }
}
// Update episode with duplicate check
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

    // Type assertion untuk drama karena Supabase mengembalikan object, bukan array
    const dramaSlug = (currentEpisode.drama as any).slug;

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

    // Revalidate paths
    revalidatePath("/");
    revalidatePath(`/drama/${dramaSlug}`);
    revalidatePath(`/episode/${episode.slug}`);

    return { success: true, episode };
  } catch (error) {
    console.error("Error updating episode:", error);
    return {
      success: false,
      error: "Failed to update episode",
    };
  }
}

// Delete episode
export async function deleteEpisode(id: string) {
  try {
    // Get episode info before deletion for revalidation
    const { data: episode } = await supabase
      .from("Episode")
      .select(
        `
        slug,
        drama:Drama!inner(slug)
      `
      )
      .eq("id", id)
      .single();

    const { error } = await supabase.from("Episode").delete().eq("id", id);

    if (error) throw error;

    // Revalidate paths
    revalidatePath("/");
    if (episode) {
      const dramaSlug = (episode.drama as any).slug;
      revalidatePath(`/drama/${dramaSlug}`);
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

// Bulk create episodes
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
      ...ep,
      releaseDate: new Date(ep.releaseDate).toISOString(),
    }));

    const { data, error } = await supabase
      .from("Episode")
      .insert(formattedEpisodes)
      .select();

    if (error) throw error;

    // Get drama slug for revalidation
    const { data: drama } = await supabase
      .from("Drama")
      .select("slug")
      .eq("id", episodes[0].dramaId)
      .single();

    // Revalidate paths
    revalidatePath("/");
    if (drama) {
      revalidatePath(`/drama/${drama.slug}`);
    }

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

// Bulk delete episodes by drama
export async function bulkDeleteEpisodesByDrama(dramaId: string) {
  try {
    // Get drama info before deletion
    const { data: drama } = await supabase
      .from("Drama")
      .select("slug")
      .eq("id", dramaId)
      .single();

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

    // Revalidate paths
    revalidatePath("/");
    if (drama) {
      revalidatePath(`/drama/${drama.slug}`);
    }

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

// Delete multiple episodes by IDs
export async function bulkDeleteEpisodesByIds(episodeIds: string[]) {
  try {
    if (episodeIds.length === 0) {
      return {
        success: false,
        count: 0,
        error: "No episode IDs provided",
      };
    }

    // Get unique drama slugs for revalidation
    const { data: episodes } = await supabase
      .from("Episode")
      .select(
        `
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

    // Revalidate paths
    revalidatePath("/");
    const uniqueDramaSlugs = Array.from(
      new Set(episodes?.map((e) => (e.drama as any).slug) || [])
    );
    uniqueDramaSlugs.forEach((slug) => {
      revalidatePath(`/drama/${slug}`);
    });

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
