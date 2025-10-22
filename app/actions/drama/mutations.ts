"use server";

import { Status } from "@/app/generated/prisma";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
  status: Status;
  releaseDate: string | Date;
  isPopular?: boolean;
  totalEpisode?: number;
  airTime?: string;

  // Relasi - semua optional
  casts?: CastInput[];
  directors?: DirectorInput[];
  writers?: WriterInput[];
  novelAuthors?: NovelAuthorInput[];
  networks?: NetworkInput[];
  production?: ProductionInput;
};

// Helper: Get or create Cast
async function getOrCreateCast(name: string) {
  const trimmedName = name.trim();

  let cast = await prisma.cast.findFirst({
    where: { name: trimmedName },
  });

  if (!cast) {
    cast = await prisma.cast.create({
      data: { name: trimmedName },
    });
  }

  return cast;
}

// Helper: Get or create Director
async function getOrCreateDirector(name: string) {
  const trimmedName = name.trim();

  let director = await prisma.director.findFirst({
    where: { name: trimmedName },
  });

  if (!director) {
    director = await prisma.director.create({
      data: { name: trimmedName },
    });
  }

  return director;
}

// Helper: Get or create Writer
async function getOrCreateWriter(name: string) {
  const trimmedName = name.trim();

  let writer = await prisma.writer.findFirst({
    where: { name: trimmedName },
  });

  if (!writer) {
    writer = await prisma.writer.create({
      data: { name: trimmedName },
    });
  }

  return writer;
}

// Helper: Get or create Novel Author
async function getOrCreateNovelAuthor(name: string) {
  const trimmedName = name.trim();

  let author = await prisma.novelAuthor.findFirst({
    where: { name: trimmedName },
  });

  if (!author) {
    author = await prisma.novelAuthor.create({
      data: { name: trimmedName },
    });
  }

  return author;
}

// Helper: Get or create Network
async function getOrCreateNetwork(name: string) {
  const trimmedName = name.trim();

  let network = await prisma.network.findFirst({
    where: { name: trimmedName },
  });

  if (!network) {
    network = await prisma.network.create({
      data: { name: trimmedName },
    });
  }

  return network;
}

// Helper: Get or create Production
async function getOrCreateProduction(name: string) {
  const trimmedName = name.trim();

  let production = await prisma.production.findFirst({
    where: { name: trimmedName },
  });

  if (!production) {
    production = await prisma.production.create({
      data: { name: trimmedName },
    });
  }

  return production;
}

// Create new drama WITH all relations
export async function createDrama(data: CreateDramaWithRelationsInput) {
  try {
    // 1. Handle production first (if provided)
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

    // 3. Handle casts
    if (data.casts && data.casts.length > 0) {
      for (const castInput of data.casts) {
        if (castInput.name) {
          const cast = await getOrCreateCast(castInput.name);
          await prisma.dramaCast.create({
            data: {
              dramaId: drama.id,
              castId: cast.id,
              character: castInput.character?.trim() || null,
            },
          });
        }
      }
    }

    // 4. Handle directors
    if (data.directors && data.directors.length > 0) {
      for (const directorInput of data.directors) {
        if (directorInput.name) {
          const director = await getOrCreateDirector(directorInput.name);
          await prisma.dramaDirector.create({
            data: {
              dramaId: drama.id,
              directorId: director.id,
            },
          });
        }
      }
    }

    // 5. Handle writers
    if (data.writers && data.writers.length > 0) {
      for (const writerInput of data.writers) {
        if (writerInput.name) {
          const writer = await getOrCreateWriter(writerInput.name);
          await prisma.dramaWriter.create({
            data: {
              dramaId: drama.id,
              writerId: writer.id,
            },
          });
        }
      }
    }

    // 6. Handle novel authors
    if (data.novelAuthors && data.novelAuthors.length > 0) {
      for (const authorInput of data.novelAuthors) {
        if (authorInput.name) {
          const author = await getOrCreateNovelAuthor(authorInput.name);
          await prisma.dramaNovelAuthor.create({
            data: {
              dramaId: drama.id,
              novelAuthorId: author.id,
              novelTitle: authorInput.novelTitle?.trim() || null,
            },
          });
        }
      }
    }

    // 7. Handle networks
    if (data.networks && data.networks.length > 0) {
      for (const networkInput of data.networks) {
        if (networkInput.name) {
          const network = await getOrCreateNetwork(networkInput.name);
          await prisma.dramaNetwork.create({
            data: {
              dramaId: drama.id,
              networkId: network.id,
            },
          });
        }
      }
    }

    revalidatePath("/");
    revalidatePath("/drama");

    return { success: true, drama };
  } catch (error) {
    console.error("Error creating drama:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create drama",
    };
  }
}

// Update drama WITH relations
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

    // 3. Update casts (delete old + create new)
    if (data.casts !== undefined) {
      // Delete existing casts
      await prisma.dramaCast.deleteMany({
        where: { dramaId: id },
      });

      // Create new casts
      if (data.casts.length > 0) {
        for (const castInput of data.casts) {
          if (castInput.name) {
            const cast = await getOrCreateCast(castInput.name);
            await prisma.dramaCast.create({
              data: {
                dramaId: id,
                castId: cast.id,
                character: castInput.character?.trim() || null,
              },
            });
          }
        }
      }
    }

    // 4. Update directors
    if (data.directors !== undefined) {
      await prisma.dramaDirector.deleteMany({
        where: { dramaId: id },
      });

      if (data.directors.length > 0) {
        for (const directorInput of data.directors) {
          if (directorInput.name) {
            const director = await getOrCreateDirector(directorInput.name);
            await prisma.dramaDirector.create({
              data: {
                dramaId: id,
                directorId: director.id,
              },
            });
          }
        }
      }
    }

    // 5. Update writers
    if (data.writers !== undefined) {
      await prisma.dramaWriter.deleteMany({
        where: { dramaId: id },
      });

      if (data.writers.length > 0) {
        for (const writerInput of data.writers) {
          if (writerInput.name) {
            const writer = await getOrCreateWriter(writerInput.name);
            await prisma.dramaWriter.create({
              data: {
                dramaId: id,
                writerId: writer.id,
              },
            });
          }
        }
      }
    }

    // 6. Update novel authors
    if (data.novelAuthors !== undefined) {
      await prisma.dramaNovelAuthor.deleteMany({
        where: { dramaId: id },
      });

      if (data.novelAuthors.length > 0) {
        for (const authorInput of data.novelAuthors) {
          if (authorInput.name) {
            const author = await getOrCreateNovelAuthor(authorInput.name);
            await prisma.dramaNovelAuthor.create({
              data: {
                dramaId: id,
                novelAuthorId: author.id,
                novelTitle: authorInput.novelTitle?.trim() || null,
              },
            });
          }
        }
      }
    }

    // 7. Update networks
    if (data.networks !== undefined) {
      await prisma.dramaNetwork.deleteMany({
        where: { dramaId: id },
      });

      if (data.networks.length > 0) {
        for (const networkInput of data.networks) {
          if (networkInput.name) {
            const network = await getOrCreateNetwork(networkInput.name);
            await prisma.dramaNetwork.create({
              data: {
                dramaId: id,
                networkId: network.id,
              },
            });
          }
        }
      }
    }

    revalidatePath("/");
    revalidatePath("/drama");
    revalidatePath(`/drama/${drama.slug}`);

    return { success: true, drama };
  } catch (error) {
    console.error("Error updating drama:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update drama",
    };
  }
}

// Delete drama (cascade akan auto delete relasi)
export async function deleteDrama(id: string) {
  try {
    await prisma.drama.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/drama");

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

    revalidatePath("/");
    revalidatePath("/drama");
    revalidatePath(`/drama/${drama.slug}`);

    return { success: true, drama: updated };
  } catch (error) {
    return {
      success: false,
      error: "Failed to toggle popular status",
    };
  }
}
