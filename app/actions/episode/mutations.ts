"use server";

import { prisma } from "@/lib/db";

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
      },
    });

    return {
      success: true,
      exists: !!existingEpisode,
      episodeId: existingEpisode?.id || null,
    };
  } catch (error) {
    console.error("Error checking episode:", error);
    return {
      success: false,
      exists: false,
      episodeId: null,
    };
  }
}

// Updated createEpisode with duplicate check
interface CreateEpisodeInput {
  videoUrl: string;
  dramaId: string;
  episodeNum: number;
  releaseDate: string | Date;
  slug: string;
}

export async function createEpisode(data: CreateEpisodeInput) {
  try {
    // Check if episode already exists
    const checkResult = await checkEpisodeExists(data.dramaId, data.episodeNum);

    if (checkResult.exists) {
      return {
        success: false,
        error: `Episod ${data.episodeNum} untuk drama ini sudah wujud`,
      };
    }

    const episode = await prisma.episode.create({
      data: {
        ...data,
        releaseDate: new Date(data.releaseDate),
      },
    });

    return { success: true, episode };
  } catch (error) {
    console.error("Error creating episode:", error);
    return {
      success: false,
      error: "Gagal menambah episod",
    };
  }
}

// Update episode
export async function updateEpisode(
  id: string,
  data: Partial<CreateEpisodeInput>
) {
  try {
    const updateData: any = { ...data };

    if (data.releaseDate) {
      updateData.releaseDate = new Date(data.releaseDate);
    }

    const episode = await prisma.episode.update({
      where: { id },
      data: updateData,
    });

    return { success: true, episode };
  } catch (error) {
    return {
      success: false,
      error: "Failed to update episode",
    };
  }
}

// Delete episode
export async function deleteEpisode(id: string) {
  try {
    await prisma.episode.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Failed to delete episode",
    };
  }
}

// Bulk create episodes
export async function bulkCreateEpisodes(episodes: CreateEpisodeInput[]) {
  try {
    const formattedEpisodes = episodes.map((ep) => ({
      ...ep,
      releaseDate: new Date(ep.releaseDate),
    }));

    const result = await prisma.episode.createMany({
      data: formattedEpisodes,
      skipDuplicates: true,
    });

    return {
      success: true,
      count: result.count,
    };
  } catch (error) {
    return {
      success: false,
      count: 0,
      error: "Failed to bulk create episodes",
    };
  }
}
