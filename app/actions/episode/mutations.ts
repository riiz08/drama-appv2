"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Check if episode already exists for a drama
export async function checkEpisodeExists(dramaId: string, episodeNum: number) {
  try {
    const existingEpisode = await prisma.episode.findFirst({
      where: {
        dramaId: dramaId,
        episodeNum: episodeNum,
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
    const currentEpisode = await prisma.episode.findUnique({
      where: { id },
      select: {
        dramaId: true,
        episodeNum: true,
        drama: {
          select: { slug: true },
        },
      },
    });

    if (!currentEpisode) {
      return {
        success: false,
        error: "Episode not found",
      };
    }

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

    // Revalidate paths
    revalidatePath("/");
    revalidatePath(`/drama/${currentEpisode.drama.slug}`);
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
    const episode = await prisma.episode.findUnique({
      where: { id },
      select: {
        slug: true,
        drama: {
          select: { slug: true },
        },
      },
    });

    await prisma.episode.delete({
      where: { id },
    });

    // Revalidate paths
    revalidatePath("/");
    if (episode) {
      revalidatePath(`/drama/${episode.drama.slug}`);
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
      releaseDate: new Date(ep.releaseDate),
    }));

    const result = await prisma.episode.createMany({
      data: formattedEpisodes,
      skipDuplicates: true,
    });

    // Get drama slug for revalidation
    const drama = await prisma.drama.findUnique({
      where: { id: episodes[0].dramaId },
      select: { slug: true },
    });

    // Revalidate paths
    revalidatePath("/");
    if (drama) {
      revalidatePath(`/drama/${drama.slug}`);
    }

    return {
      success: true,
      count: result.count,
      message: `Successfully created ${result.count} episode(s)`,
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
    const drama = await prisma.drama.findUnique({
      where: { id: dramaId },
      select: { slug: true },
    });

    const result = await prisma.episode.deleteMany({
      where: { dramaId },
    });

    // Revalidate paths
    revalidatePath("/");
    if (drama) {
      revalidatePath(`/drama/${drama.slug}`);
    }

    return {
      success: true,
      count: result.count,
      message: `Successfully deleted ${result.count} episode(s)`,
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
    const episodes = await prisma.episode.findMany({
      where: { id: { in: episodeIds } },
      select: {
        drama: {
          select: { slug: true },
        },
      },
    });

    const result = await prisma.episode.deleteMany({
      where: { id: { in: episodeIds } },
    });

    // Revalidate paths
    revalidatePath("/");
    const uniqueDramaSlugs = Array.from(
      new Set(episodes.map((e) => e.drama.slug))
    );
    uniqueDramaSlugs.forEach((slug) => {
      revalidatePath(`/drama/${slug}`);
    });

    return {
      success: true,
      count: result.count,
      message: `Successfully deleted ${result.count} episode(s)`,
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
