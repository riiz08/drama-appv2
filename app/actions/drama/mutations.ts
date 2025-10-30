"use server";

import { Status } from "@/app/generated/prisma";
import { supabase } from "@/lib/supabase";
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

  const { data: cast, error } = await supabase
    .from("Cast")
    .select("*")
    .eq("name", trimmedName)
    .maybeSingle();

  if (cast) {
    return cast;
  }

  const { data: newCast, error: createError } = await supabase
    .from("Cast")
    .insert({ name: trimmedName })
    .select()
    .single();

  if (createError) throw createError;

  return newCast;
}

// Helper: Get or create Director
async function getOrCreateDirector(name: string) {
  const trimmedName = name.trim();

  const { data: director, error } = await supabase
    .from("Director")
    .select("*")
    .eq("name", trimmedName)
    .maybeSingle();

  if (director) {
    return director;
  }

  const { data: newDirector, error: createError } = await supabase
    .from("Director")
    .insert({ name: trimmedName })
    .select()
    .single();

  if (createError) throw createError;

  return newDirector;
}

// Helper: Get or create Writer
async function getOrCreateWriter(name: string) {
  const trimmedName = name.trim();

  const { data: writer, error } = await supabase
    .from("Writer")
    .select("*")
    .eq("name", trimmedName)
    .maybeSingle();

  if (writer) {
    return writer;
  }

  const { data: newWriter, error: createError } = await supabase
    .from("Writer")
    .insert({ name: trimmedName })
    .select()
    .single();

  if (createError) throw createError;

  return newWriter;
}

// Helper: Get or create Novel Author
async function getOrCreateNovelAuthor(name: string) {
  const trimmedName = name.trim();

  const { data: author, error } = await supabase
    .from("NovelAuthor")
    .select("*")
    .eq("name", trimmedName)
    .maybeSingle();

  if (author) {
    return author;
  }

  const { data: newAuthor, error: createError } = await supabase
    .from("NovelAuthor")
    .insert({ name: trimmedName })
    .select()
    .single();

  if (createError) throw createError;

  return newAuthor;
}

// Helper: Get or create Network
async function getOrCreateNetwork(name: string) {
  const trimmedName = name.trim();

  const { data: network, error } = await supabase
    .from("Network")
    .select("*")
    .eq("name", trimmedName)
    .maybeSingle();

  if (network) {
    return network;
  }

  const { data: newNetwork, error: createError } = await supabase
    .from("Network")
    .insert({ name: trimmedName })
    .select()
    .single();

  if (createError) throw createError;

  return newNetwork;
}

// Helper: Get or create Production
async function getOrCreateProduction(name: string) {
  const trimmedName = name.trim();

  const { data: production, error } = await supabase
    .from("Production")
    .select("*")
    .eq("name", trimmedName)
    .maybeSingle();

  if (production) {
    return production;
  }

  const { data: newProduction, error: createError } = await supabase
    .from("Production")
    .insert({ name: trimmedName })
    .select()
    .single();

  if (createError) throw createError;

  return newProduction;
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
    const { data: drama, error: dramaError } = await supabase
      .from("Drama")
      .insert({
        title: data.title,
        slug: data.slug,
        description: data.description,
        thumbnail: data.thumbnail,
        status: data.status,
        releaseDate: new Date(data.releaseDate).toISOString(),
        isPopular: data.isPopular ?? false,
        totalEpisode: data.totalEpisode,
        airTime: data.airTime,
        productionId,
      })
      .select()
      .single();

    if (dramaError) throw dramaError;

    // 3. Handle casts
    if (data.casts && data.casts.length > 0) {
      for (const castInput of data.casts) {
        if (castInput.name) {
          const cast = await getOrCreateCast(castInput.name);
          await supabase.from("DramaCast").insert({
            dramaId: drama.id,
            castId: cast.id,
            character: castInput.character?.trim() || null,
          });
        }
      }
    }

    // 4. Handle directors
    if (data.directors && data.directors.length > 0) {
      for (const directorInput of data.directors) {
        if (directorInput.name) {
          const director = await getOrCreateDirector(directorInput.name);
          await supabase.from("DramaDirector").insert({
            dramaId: drama.id,
            directorId: director.id,
          });
        }
      }
    }

    // 5. Handle writers
    if (data.writers && data.writers.length > 0) {
      for (const writerInput of data.writers) {
        if (writerInput.name) {
          const writer = await getOrCreateWriter(writerInput.name);
          await supabase.from("DramaWriter").insert({
            dramaId: drama.id,
            writerId: writer.id,
          });
        }
      }
    }

    // 6. Handle novel authors
    if (data.novelAuthors && data.novelAuthors.length > 0) {
      for (const authorInput of data.novelAuthors) {
        if (authorInput.name) {
          const author = await getOrCreateNovelAuthor(authorInput.name);
          await supabase.from("DramaNovelAuthor").insert({
            dramaId: drama.id,
            novelAuthorId: author.id,
            novelTitle: authorInput.novelTitle?.trim() || null,
          });
        }
      }
    }

    // 7. Handle networks
    if (data.networks && data.networks.length > 0) {
      for (const networkInput of data.networks) {
        if (networkInput.name) {
          const network = await getOrCreateNetwork(networkInput.name);
          await supabase.from("DramaNetwork").insert({
            dramaId: drama.id,
            networkId: network.id,
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
    if (data.releaseDate)
      updateData.releaseDate = new Date(data.releaseDate).toISOString();
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
    const { data: drama, error: updateError } = await supabase
      .from("Drama")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 3. Update casts (delete old + create new)
    if (data.casts !== undefined) {
      // Delete existing casts
      await supabase.from("DramaCast").delete().eq("dramaId", id);

      // Create new casts
      if (data.casts.length > 0) {
        for (const castInput of data.casts) {
          if (castInput.name) {
            const cast = await getOrCreateCast(castInput.name);
            await supabase.from("DramaCast").insert({
              dramaId: id,
              castId: cast.id,
              character: castInput.character?.trim() || null,
            });
          }
        }
      }
    }

    // 4. Update directors
    if (data.directors !== undefined) {
      await supabase.from("DramaDirector").delete().eq("dramaId", id);

      if (data.directors.length > 0) {
        for (const directorInput of data.directors) {
          if (directorInput.name) {
            const director = await getOrCreateDirector(directorInput.name);
            await supabase.from("DramaDirector").insert({
              dramaId: id,
              directorId: director.id,
            });
          }
        }
      }
    }

    // 5. Update writers
    if (data.writers !== undefined) {
      await supabase.from("DramaWriter").delete().eq("dramaId", id);

      if (data.writers.length > 0) {
        for (const writerInput of data.writers) {
          if (writerInput.name) {
            const writer = await getOrCreateWriter(writerInput.name);
            await supabase.from("DramaWriter").insert({
              dramaId: id,
              writerId: writer.id,
            });
          }
        }
      }
    }

    // 6. Update novel authors
    if (data.novelAuthors !== undefined) {
      await supabase.from("DramaNovelAuthor").delete().eq("dramaId", id);

      if (data.novelAuthors.length > 0) {
        for (const authorInput of data.novelAuthors) {
          if (authorInput.name) {
            const author = await getOrCreateNovelAuthor(authorInput.name);
            await supabase.from("DramaNovelAuthor").insert({
              dramaId: id,
              novelAuthorId: author.id,
              novelTitle: authorInput.novelTitle?.trim() || null,
            });
          }
        }
      }
    }

    // 7. Update networks
    if (data.networks !== undefined) {
      await supabase.from("DramaNetwork").delete().eq("dramaId", id);

      if (data.networks.length > 0) {
        for (const networkInput of data.networks) {
          if (networkInput.name) {
            const network = await getOrCreateNetwork(networkInput.name);
            await supabase.from("DramaNetwork").insert({
              dramaId: id,
              networkId: network.id,
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

// Delete drama (cascade akan auto delete relasi jika sudah setup di database)
export async function deleteDrama(id: string) {
  try {
    const { error } = await supabase.from("Drama").delete().eq("id", id);

    if (error) throw error;

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
    const { data: drama, error: fetchError } = await supabase
      .from("Drama")
      .select("isPopular, slug")
      .eq("id", id)
      .single();

    if (fetchError || !drama) {
      return { success: false, error: "Drama not found" };
    }

    const { data: updated, error: updateError } = await supabase
      .from("Drama")
      .update({ isPopular: !drama.isPopular })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

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
