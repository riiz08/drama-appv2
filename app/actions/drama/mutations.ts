"use server";

import { supabase } from "@/lib/supabase";
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

  const { data: existingCasts } = await supabase
    .from("Cast")
    .select("*")
    .in("name", trimmedNames);

  const existingMap = new Map((existingCasts || []).map((c) => [c.name, c]));

  const missingNames = trimmedNames.filter((name) => !existingMap.has(name));

  if (missingNames.length > 0) {
    const { data: newCasts } = await supabase
      .from("Cast")
      .insert(missingNames.map((name) => ({ name })))
      .select();

    newCasts?.forEach((cast) => existingMap.set(cast.name, cast));
  }

  return trimmedNames.map((name) => existingMap.get(name)!);
}

async function batchGetOrCreateDirectors(names: string[]) {
  if (names.length === 0) return [];

  const trimmedNames = names.map((n) => n.trim()).filter(Boolean);

  const { data: existingDirectors } = await supabase
    .from("Director")
    .select("*")
    .in("name", trimmedNames);

  const existingMap = new Map(
    (existingDirectors || []).map((d) => [d.name, d])
  );

  const missingNames = trimmedNames.filter((name) => !existingMap.has(name));

  if (missingNames.length > 0) {
    const { data: newDirectors } = await supabase
      .from("Director")
      .insert(missingNames.map((name) => ({ name })))
      .select();

    newDirectors?.forEach((director) =>
      existingMap.set(director.name, director)
    );
  }

  return trimmedNames.map((name) => existingMap.get(name)!);
}

async function batchGetOrCreateWriters(names: string[]) {
  if (names.length === 0) return [];

  const trimmedNames = names.map((n) => n.trim()).filter(Boolean);

  const { data: existingWriters } = await supabase
    .from("Writer")
    .select("*")
    .in("name", trimmedNames);

  const existingMap = new Map((existingWriters || []).map((w) => [w.name, w]));

  const missingNames = trimmedNames.filter((name) => !existingMap.has(name));

  if (missingNames.length > 0) {
    const { data: newWriters } = await supabase
      .from("Writer")
      .insert(missingNames.map((name) => ({ name })))
      .select();

    newWriters?.forEach((writer) => existingMap.set(writer.name, writer));
  }

  return trimmedNames.map((name) => existingMap.get(name)!);
}

async function batchGetOrCreateNovelAuthors(names: string[]) {
  if (names.length === 0) return [];

  const trimmedNames = names.map((n) => n.trim()).filter(Boolean);

  const { data: existingAuthors } = await supabase
    .from("NovelAuthor")
    .select("*")
    .in("name", trimmedNames);

  const existingMap = new Map((existingAuthors || []).map((a) => [a.name, a]));

  const missingNames = trimmedNames.filter((name) => !existingMap.has(name));

  if (missingNames.length > 0) {
    const { data: newAuthors } = await supabase
      .from("NovelAuthor")
      .insert(missingNames.map((name) => ({ name })))
      .select();

    newAuthors?.forEach((author) => existingMap.set(author.name, author));
  }

  return trimmedNames.map((name) => existingMap.get(name)!);
}

async function batchGetOrCreateNetworks(names: string[]) {
  if (names.length === 0) return [];

  const trimmedNames = names.map((n) => n.trim()).filter(Boolean);

  const { data: existingNetworks } = await supabase
    .from("Network")
    .select("*")
    .in("name", trimmedNames);

  const existingMap = new Map((existingNetworks || []).map((n) => [n.name, n]));

  const missingNames = trimmedNames.filter((name) => !existingMap.has(name));

  if (missingNames.length > 0) {
    const { data: newNetworks } = await supabase
      .from("Network")
      .insert(missingNames.map((name) => ({ name })))
      .select();

    newNetworks?.forEach((network) => existingMap.set(network.name, network));
  }

  return trimmedNames.map((name) => existingMap.get(name)!);
}

async function getOrCreateProduction(name: string) {
  const trimmedName = name.trim();

  const { data: production } = await supabase
    .from("Production")
    .select("*")
    .eq("name", trimmedName)
    .maybeSingle();

  if (production) return production;

  const { data: newProduction, error } = await supabase
    .from("Production")
    .insert({ name: trimmedName })
    .select()
    .single();

  if (error) throw error;
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

          const { error } = await supabase
            .from("DramaCast")
            .insert(dramaCastInserts);

          if (error) throw new Error(`Failed to add casts: ${error.message}`);
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

          const { error } = await supabase
            .from("DramaDirector")
            .insert(dramaDirectorInserts);

          if (error)
            throw new Error(`Failed to add directors: ${error.message}`);
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

          const { error } = await supabase
            .from("DramaWriter")
            .insert(dramaWriterInserts);

          if (error) throw new Error(`Failed to add writers: ${error.message}`);
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

          const { error } = await supabase
            .from("DramaNovelAuthor")
            .insert(dramaAuthorInserts);

          if (error)
            throw new Error(`Failed to add novel authors: ${error.message}`);
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

          const { error } = await supabase
            .from("DramaNetwork")
            .insert(dramaNetworkInserts);

          if (error)
            throw new Error(`Failed to add networks: ${error.message}`);
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
      revalidateTag("dramas-completed");
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

    // 3. Batch update all relations in parallel
    const relationPromises = [];

    // Casts
    if (data.casts !== undefined) {
      relationPromises.push(
        (async () => {
          await supabase.from("DramaCast").delete().eq("dramaId", id);

          if (data.casts!.length > 0) {
            const castNames = data.casts!.map((c) => c.name).filter(Boolean);
            const casts = await batchGetOrCreateCasts(castNames);

            const dramaCastInserts = data.casts!.map((castInput, idx) => ({
              dramaId: id,
              castId: casts[idx].id,
              character: castInput.character?.trim() || null,
            }));

            const { error } = await supabase
              .from("DramaCast")
              .insert(dramaCastInserts);

            if (error)
              throw new Error(`Failed to update casts: ${error.message}`);
          }
        })()
      );
    }

    // Directors
    if (data.directors !== undefined) {
      relationPromises.push(
        (async () => {
          await supabase.from("DramaDirector").delete().eq("dramaId", id);

          if (data.directors!.length > 0) {
            const directorNames = data
              .directors!.map((d) => d.name)
              .filter(Boolean);
            const directors = await batchGetOrCreateDirectors(directorNames);

            const dramaDirectorInserts = directors.map((director) => ({
              dramaId: id,
              directorId: director.id,
            }));

            const { error } = await supabase
              .from("DramaDirector")
              .insert(dramaDirectorInserts);

            if (error)
              throw new Error(`Failed to update directors: ${error.message}`);
          }
        })()
      );
    }

    // Writers
    if (data.writers !== undefined) {
      relationPromises.push(
        (async () => {
          await supabase.from("DramaWriter").delete().eq("dramaId", id);

          if (data.writers!.length > 0) {
            const writerNames = data
              .writers!.map((w) => w.name)
              .filter(Boolean);
            const writers = await batchGetOrCreateWriters(writerNames);

            const dramaWriterInserts = writers.map((writer) => ({
              dramaId: id,
              writerId: writer.id,
            }));

            const { error } = await supabase
              .from("DramaWriter")
              .insert(dramaWriterInserts);

            if (error)
              throw new Error(`Failed to update writers: ${error.message}`);
          }
        })()
      );
    }

    // Novel Authors
    if (data.novelAuthors !== undefined) {
      relationPromises.push(
        (async () => {
          await supabase.from("DramaNovelAuthor").delete().eq("dramaId", id);

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

            const { error } = await supabase
              .from("DramaNovelAuthor")
              .insert(dramaAuthorInserts);

            if (error)
              throw new Error(
                `Failed to update novel authors: ${error.message}`
              );
          }
        })()
      );
    }

    // Networks
    if (data.networks !== undefined) {
      relationPromises.push(
        (async () => {
          await supabase.from("DramaNetwork").delete().eq("dramaId", id);

          if (data.networks!.length > 0) {
            const networkNames = data
              .networks!.map((n) => n.name)
              .filter(Boolean);
            const networks = await batchGetOrCreateNetworks(networkNames);

            const dramaNetworkInserts = networks.map((network) => ({
              dramaId: id,
              networkId: network.id,
            }));

            const { error } = await supabase
              .from("DramaNetwork")
              .insert(dramaNetworkInserts);

            if (error)
              throw new Error(`Failed to update networks: ${error.message}`);
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
      revalidateTag("dramas-completed");
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
    const { data: drama } = await supabase
      .from("Drama")
      .select("slug")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("Drama").delete().eq("id", id);

    if (error) throw error;

    // Invalidate all related caches
    revalidateTag("dramas");
    revalidateTag("dramas-list");
    revalidateTag("dramas-filtered");
    revalidateTag("dramas-popular");
    revalidateTag("dramas-completed");
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
