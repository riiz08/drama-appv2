"use server";

import { prisma } from "@/lib/db";
import { StatusType } from "@/types";
import { revalidateTag } from "next/cache";

// Types
type CastInput = { name: string; character?: string };
type DirectorInput = { name: string };
type WriterInput = { name: string };
type NovelAuthorInput = { name: string; novelTitle?: string };
type NetworkInput = { name: string };
type ProductionInput = { name: string };

export type CreateDramaWithRelationsInput = {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  status: StatusType;
  releaseDate: string | Date;
  isPopular?: boolean;
  totalEpisode?: number;
  airTime?: string;

  casts?: CastInput[];
  directors?: DirectorInput[];
  writers?: WriterInput[];
  novelAuthors?: NovelAuthorInput[];
  networks?: NetworkInput[];
  production?: ProductionInput;
};

// ============================================
// OPTIMIZED: Batch get or create operations
// ============================================

async function batchGetOrCreateCasts(names: string[]) {
  if (names.length === 0) return [];

  const trimmedNames = names.map((n) => n.trim()).filter(Boolean);

  const existingCasts = await prisma.cast.findMany({
    where: {
      name: {
        in: trimmedNames,
      },
    },
  });

  const existingMap = new Map(existingCasts.map((c) => [c.name, c]));
  const missingNames = trimmedNames.filter((name) => !existingMap.has(name));

  if (missingNames.length > 0) {
    const newCasts = await prisma.cast.createManyAndReturn({
      data: missingNames.map((name) => ({ name })),
    });

    newCasts.forEach((cast) => existingMap.set(cast.name, cast));
  }

  return trimmedNames.map((name) => existingMap.get(name)!);
}

async function batchGetOrCreateDirectors(names: string[]) {
  if (names.length === 0) return [];

  const trimmedNames = names.map((n) => n.trim()).filter(Boolean);

  const existingDirectors = await prisma.director.findMany({
    where: {
      name: {
        in: trimmedNames,
      },
    },
  });

  const existingMap = new Map(existingDirectors.map((d) => [d.name, d]));
  const missingNames = trimmedNames.filter((name) => !existingMap.has(name));

  if (missingNames.length > 0) {
    const newDirectors = await prisma.director.createManyAndReturn({
      data: missingNames.map((name) => ({ name })),
    });

    newDirectors.forEach((director) =>
      existingMap.set(director.name, director)
    );
  }

  return trimmedNames.map((name) => existingMap.get(name)!);
}

async function batchGetOrCreateWriters(names: string[]) {
  if (names.length === 0) return [];

  const trimmedNames = names.map((n) => n.trim()).filter(Boolean);

  const existingWriters = await prisma.writer.findMany({
    where: {
      name: {
        in: trimmedNames,
      },
    },
  });

  const existingMap = new Map(existingWriters.map((w) => [w.name, w]));
  const missingNames = trimmedNames.filter((name) => !existingMap.has(name));

  if (missingNames.length > 0) {
    const newWriters = await prisma.writer.createManyAndReturn({
      data: missingNames.map((name) => ({ name })),
    });

    newWriters.forEach((writer) => existingMap.set(writer.name, writer));
  }

  return trimmedNames.map((name) => existingMap.get(name)!);
}

async function batchGetOrCreateNovelAuthors(names: string[]) {
  if (names.length === 0) return [];

  const trimmedNames = names.map((n) => n.trim()).filter(Boolean);

  const existingAuthors = await prisma.novelAuthor.findMany({
    where: {
      name: {
        in: trimmedNames,
      },
    },
  });

  const existingMap = new Map(existingAuthors.map((a) => [a.name, a]));
  const missingNames = trimmedNames.filter((name) => !existingMap.has(name));

  if (missingNames.length > 0) {
    const newAuthors = await prisma.novelAuthor.createManyAndReturn({
      data: missingNames.map((name) => ({ name })),
    });

    newAuthors.forEach((author) => existingMap.set(author.name, author));
  }

  return trimmedNames.map((name) => existingMap.get(name)!);
}

async function batchGetOrCreateNetworks(names: string[]) {
  if (names.length === 0) return [];

  const trimmedNames = names.map((n) => n.trim()).filter(Boolean);

  const existingNetworks = await prisma.network.findMany({
    where: {
      name: {
        in: trimmedNames,
      },
    },
  });

  const existingMap = new Map(existingNetworks.map((n) => [n.name, n]));
  const missingNames = trimmedNames.filter((name) => !existingMap.has(name));

  if (missingNames.length > 0) {
    const newNetworks = await prisma.network.createManyAndReturn({
      data: missingNames.map((name) => ({ name })),
    });

    newNetworks.forEach((network) => existingMap.set(network.name, network));
  }

  return trimmedNames.map((name) => existingMap.get(name)!);
}

async function getOrCreateProduction(name: string) {
  const trimmedName = name.trim();

  const production = await prisma.production.findFirst({
    where: { name: trimmedName },
  });

  if (production) return production;

  const newProduction = await prisma.production.create({
    data: { name: trimmedName },
  });

  return newProduction;
}

// ============================================
// OPTIMIZED: Create Drama
// ============================================

export async function createDrama(data: CreateDramaWithRelationsInput) {
  try {
    // 1. Handle production
    let productionId: string | undefined;
    if (data.production?.name) {
      const production = await getOrCreateProduction(data.production.name);
      productionId = production.id;
    }

    // 2. Create drama
    const drama = await prisma.drama.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        thumbnail: data.thumbnail,
        status: data.status,
        releaseDate: new Date(data.releaseDate),
        isPopular: data.isPopular ?? false,
        totalEpisode: data.totalEpisode,
        airTime: data.airTime,
        productionId,
      },
    });

    // 3. Batch process all relations in parallel
    const relationPromises = [];

    // Casts
    if (data.casts && data.casts.length > 0) {
      relationPromises.push(
        (async () => {
          const castNames = data.casts!.map((c) => c.name).filter(Boolean);
          const casts = await batchGetOrCreateCasts(castNames);

          const dramaCastInserts = data.casts!.map((castInput, idx) => ({
            dramaId: drama.id,
            castId: casts[idx].id,
            character: castInput.character?.trim() || null,
          }));

          await prisma.dramaCast.createMany({
            data: dramaCastInserts,
          });
        })()
      );
    }

    // Directors
    if (data.directors && data.directors.length > 0) {
      relationPromises.push(
        (async () => {
          const directorNames = data
            .directors!.map((d) => d.name)
            .filter(Boolean);
          const directors = await batchGetOrCreateDirectors(directorNames);

          const dramaDirectorInserts = directors.map((director) => ({
            dramaId: drama.id,
            directorId: director.id,
          }));

          await prisma.dramaDirector.createMany({
            data: dramaDirectorInserts,
          });
        })()
      );
    }

    // Writers
    if (data.writers && data.writers.length > 0) {
      relationPromises.push(
        (async () => {
          const writerNames = data.writers!.map((w) => w.name).filter(Boolean);
          const writers = await batchGetOrCreateWriters(writerNames);

          const dramaWriterInserts = writers.map((writer) => ({
            dramaId: drama.id,
            writerId: writer.id,
          }));

          await prisma.dramaWriter.createMany({
            data: dramaWriterInserts,
          });
        })()
      );
    }

    // Novel Authors
    if (data.novelAuthors && data.novelAuthors.length > 0) {
      relationPromises.push(
        (async () => {
          const authorNames = data
            .novelAuthors!.map((a) => a.name)
            .filter(Boolean);
          const authors = await batchGetOrCreateNovelAuthors(authorNames);

          const dramaAuthorInserts = data.novelAuthors!.map(
            (authorInput, idx) => ({
              dramaId: drama.id,
              novelAuthorId: authors[idx].id,
              novelTitle: authorInput.novelTitle?.trim() || null,
            })
          );

          await prisma.dramaNovelAuthor.createMany({
            data: dramaAuthorInserts,
          });
        })()
      );
    }

    // Networks
    if (data.networks && data.networks.length > 0) {
      relationPromises.push(
        (async () => {
          const networkNames = data
            .networks!.map((n) => n.name)
            .filter(Boolean);
          const networks = await batchGetOrCreateNetworks(networkNames);

          const dramaNetworkInserts = networks.map((network) => ({
            dramaId: drama.id,
            networkId: network.id,
          }));

          await prisma.dramaNetwork.createMany({
            data: dramaNetworkInserts,
          });
        })()
      );
    }

    // Execute all relation operations in parallel
    await Promise.all(relationPromises);

    // Smart cache invalidation
    revalidateTag("dramas");
    revalidateTag("dramas-list");
    revalidateTag("dramas-popular");
    revalidateTag("dramas-featured");
    revalidateTag("dramas-filtered");
    revalidateTag("dashboard");
    revalidateTag("dashboard-activities");
    revalidateTag("dashboard-top-dramas");
    revalidateTag("homepage");
    revalidateTag("site-stats");
    if (data.status === "TAMAT") {
      revalidateTag("dramas-tamat");
      revalidateTag("dashboard-activities");
      revalidateTag("dashboard-top-dramas");
      revalidateTag("dashboard");
    }

    return { success: true, drama };
  } catch (error) {
    console.error("Error creating drama:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create drama",
    };
  }
}

// ============================================
// OPTIMIZED: Update Drama
// ============================================

export async function updateDrama(
  id: string,
  data: Partial<CreateDramaWithRelationsInput>
) {
  try {
    // 1. Prepare drama update data
    const updateData: any = {};

    if (data.title) updateData.title = data.title;
    if (data.slug) updateData.slug = data.slug;
    if (data.description) updateData.description = data.description;
    if (data.thumbnail) updateData.thumbnail = data.thumbnail;
    if (data.status) updateData.status = data.status;
    if (data.releaseDate) updateData.releaseDate = new Date(data.releaseDate);
    if (data.isPopular !== undefined) updateData.isPopular = data.isPopular;
    if (data.totalEpisode !== undefined)
      updateData.totalEpisode = data.totalEpisode;
    if (data.airTime !== undefined) updateData.airTime = data.airTime;

    // Handle production
    if (data.production?.name) {
      const production = await getOrCreateProduction(data.production.name);
      updateData.productionId = production.id;
    }

    // 2. Update drama basic info
    const drama = await prisma.drama.update({
      where: { id },
      data: updateData,
    });

    // 3. Batch update all relations in parallel
    const relationPromises = [];

    // Casts
    if (data.casts !== undefined) {
      relationPromises.push(
        (async () => {
          await prisma.dramaCast.deleteMany({
            where: { dramaId: id },
          });

          if (data.casts!.length > 0) {
            const castNames = data.casts!.map((c) => c.name).filter(Boolean);
            const casts = await batchGetOrCreateCasts(castNames);

            const dramaCastInserts = data.casts!.map((castInput, idx) => ({
              dramaId: id,
              castId: casts[idx].id,
              character: castInput.character?.trim() || null,
            }));

            await prisma.dramaCast.createMany({
              data: dramaCastInserts,
            });
          }
        })()
      );
    }

    // Directors
    if (data.directors !== undefined) {
      relationPromises.push(
        (async () => {
          await prisma.dramaDirector.deleteMany({
            where: { dramaId: id },
          });

          if (data.directors!.length > 0) {
            const directorNames = data
              .directors!.map((d) => d.name)
              .filter(Boolean);
            const directors = await batchGetOrCreateDirectors(directorNames);

            const dramaDirectorInserts = directors.map((director) => ({
              dramaId: id,
              directorId: director.id,
            }));

            await prisma.dramaDirector.createMany({
              data: dramaDirectorInserts,
            });
          }
        })()
      );
    }

    // Writers
    if (data.writers !== undefined) {
      relationPromises.push(
        (async () => {
          await prisma.dramaWriter.deleteMany({
            where: { dramaId: id },
          });

          if (data.writers!.length > 0) {
            const writerNames = data
              .writers!.map((w) => w.name)
              .filter(Boolean);
            const writers = await batchGetOrCreateWriters(writerNames);

            const dramaWriterInserts = writers.map((writer) => ({
              dramaId: id,
              writerId: writer.id,
            }));

            await prisma.dramaWriter.createMany({
              data: dramaWriterInserts,
            });
          }
        })()
      );
    }

    // Novel Authors
    if (data.novelAuthors !== undefined) {
      relationPromises.push(
        (async () => {
          await prisma.dramaNovelAuthor.deleteMany({
            where: { dramaId: id },
          });

          if (data.novelAuthors!.length > 0) {
            const authorNames = data
              .novelAuthors!.map((a) => a.name)
              .filter(Boolean);
            const authors = await batchGetOrCreateNovelAuthors(authorNames);

            const dramaAuthorInserts = data.novelAuthors!.map(
              (authorInput, idx) => ({
                dramaId: id,
                novelAuthorId: authors[idx].id,
                novelTitle: authorInput.novelTitle?.trim() || null,
              })
            );

            await prisma.dramaNovelAuthor.createMany({
              data: dramaAuthorInserts,
            });
          }
        })()
      );
    }

    // Networks
    if (data.networks !== undefined) {
      relationPromises.push(
        (async () => {
          await prisma.dramaNetwork.deleteMany({
            where: { dramaId: id },
          });

          if (data.networks!.length > 0) {
            const networkNames = data
              .networks!.map((n) => n.name)
              .filter(Boolean);
            const networks = await batchGetOrCreateNetworks(networkNames);

            const dramaNetworkInserts = networks.map((network) => ({
              dramaId: id,
              networkId: network.id,
            }));

            await prisma.dramaNetwork.createMany({
              data: dramaNetworkInserts,
            });
          }
        })()
      );
    }

    // Execute all relation operations in parallel
    await Promise.all(relationPromises);

    // Invalidate specific caches
    revalidateTag("dramas");
    revalidateTag("dramas-list");
    revalidateTag("dramas-filtered");
    revalidateTag(`drama-${id}`);
    revalidateTag(`drama-slug-${drama.slug}`);
    revalidateTag("homepage");

    // Invalidate related caches based on changes
    if (data.isPopular !== undefined) {
      revalidateTag("dramas-popular");
      revalidateTag("dramas-featured");
    }
    if (data.status === "TAMAT" || updateData.status === "TAMAT") {
      revalidateTag("dramas-tamat");
    }

    return { success: true, drama };
  } catch (error) {
    console.error("Error updating drama:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update drama",
    };
  }
}

// Delete drama
export async function deleteDrama(id: string) {
  try {
    // Get slug before delete for cache invalidation
    const drama = await prisma.drama.findUnique({
      where: { id },
      select: { slug: true },
    });

    await prisma.drama.delete({
      where: { id },
    });

    // Invalidate all related caches
    revalidateTag("dramas");
    revalidateTag("dramas-list");
    revalidateTag("dramas-filtered");
    revalidateTag("dramas-popular");
    revalidateTag("dramas-tamat");
    revalidateTag("dramas-featured");
    revalidateTag(`drama-${id}`);
    revalidateTag("homepage");
    revalidateTag("site-stats");

    if (drama?.slug) {
      revalidateTag(`drama-slug-${drama.slug}`);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Failed to delete drama",
    };
  }
}

// Toggle popular status
export async function togglePopular(id: string) {
  try {
    const drama = await prisma.drama.findUnique({
      where: { id },
      select: { isPopular: true, slug: true },
    });

    if (!drama) {
      return { success: false, error: "Drama not found" };
    }

    const updated = await prisma.drama.update({
      where: { id },
      data: { isPopular: !drama.isPopular },
    });

    // Invalidate popular-related caches
    revalidateTag("dramas");
    revalidateTag("dramas-list");
    revalidateTag("dramas-popular");
    revalidateTag("dramas-featured");
    revalidateTag(`drama-${id}`);
    revalidateTag(`drama-slug-${drama.slug}`);

    return { success: true, drama: updated };
  } catch (error) {
    return {
      success: false,
      error: "Failed to toggle popular status",
    };
  }
}
