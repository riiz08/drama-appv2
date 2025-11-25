"use server";

import { prisma } from "@/lib/db";
import { revalidateTag } from "next/cache";

// Types
export interface CreateEpisodeInput {
  videoUrl: string;
  dramaId: string;
  episodeNum: number;
  releaseDate: string | Date;
  slug: string;
}

// ============================================
// HELPER: Check Episode Exists
// ============================================

export async function checkEpisodeExists(dramaId: string, episodeNum: number) {
  try {
    const existingEpisode = await prisma.episode.findFirst({
      where: {
        dramaId,
        episodeNum,
      },
      select: {
        id: true,
        slug: true,
      },
    });

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
    const drama = await prisma.drama.findUnique({
      where: { id: data.dramaId },
      select: { slug: true },
    });

    const episode = await prisma.episode.create({
      data: {
        ...data,
        releaseDate: new Date(data.releaseDate),
      },
    });

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
    const currentEpisode = await prisma.episode.findUnique({
      where: { id },
      select: {
        dramaId: true,
        episodeNum: true,
        slug: true,
        drama: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!currentEpisode) {
      return {
        success: false,
        error: "Episode not found",
      };
    }

    const dramaSlug = currentEpisode.drama.slug;
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
      updateData.releaseDate = new Date(data.releaseDate);
    }

    const episode = await prisma.episode.update({
      where: { id },
      data: updateData,
    });

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
    const episode = await prisma.episode.findUnique({
      where: { id },
      select: {
        slug: true,
        dramaId: true,
        drama: {
          select: {
            slug: true,
          },
        },
      },
    });

    await prisma.episode.delete({
      where: { id },
    });

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
      const dramaSlug = episode.drama.slug;

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
      ...ep,
      releaseDate: new Date(ep.releaseDate),
    }));

    const data = await prisma.episode.createMany({
      data: formattedEpisodes,
    });

    // Get drama slug for cache invalidation
    const drama = await prisma.drama.findUnique({
      where: { id: episodes[0].dramaId },
      select: { slug: true },
    });

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
      count: data.count || 0,
      message: `Successfully created ${data.count || 0} episode(s)`,
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
    const drama = await prisma.drama.findUnique({
      where: { id: dramaId },
      select: { slug: true },
    });

    const episodes = await prisma.episode.findMany({
      where: { dramaId },
      select: { slug: true },
    });

    // Get count before deletion
    const beforeCount = await prisma.episode.count({
      where: { dramaId },
    });

    await prisma.episode.deleteMany({
      where: { dramaId },
    });

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
    episodes.forEach((ep) => {
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
    const episodes = await prisma.episode.findMany({
      where: {
        id: { in: episodeIds },
      },
      select: {
        slug: true,
        dramaId: true,
        drama: {
          select: {
            slug: true,
          },
        },
      },
    });

    // Get count before deletion
    const beforeCount = await prisma.episode.count({
      where: {
        id: { in: episodeIds },
      },
    });

    await prisma.episode.deleteMany({
      where: {
        id: { in: episodeIds },
      },
    });

    // Comprehensive cache invalidation
    revalidateTag("episodes");
    revalidateTag("episodes-latest");
    revalidateTag("episodes-admin");
    revalidateTag("episodes-all-slugs");
    revalidateTag("episodes-slugs");
    revalidateTag("episodes-popular");

    // Invalidate affected dramas and episodes
    const uniqueDramaIds = Array.from(new Set(episodes.map((e) => e.dramaId)));
    const uniqueDramaSlugs = Array.from(
      new Set(episodes.map((e) => e.drama.slug))
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

    episodes.forEach((ep) => {
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
