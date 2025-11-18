"use server";

import { supabase } from "@/lib/supabase";
import { StatusType } from "@/types";
import { unstable_cache } from "next/cache";

// ============================================
// CACHED QUERIES - Mengurangi request drastis!
// ============================================

// Get all dramas with flexible options + CACHE
export async function getAllDramas(options?: {
  status?: StatusType;
  limit?: number;
  offset?: number;
  orderBy?: "title" | "releaseDate" | "createdAt";
  order?: "asc" | "desc";
  includeRelations?: boolean;
}) {
  // Generate unique cache key based on options
  const cacheKey = [
    "dramas-all",
    options?.status || "all",
    options?.orderBy || "title",
    options?.order || "asc",
    options?.limit || "all",
    options?.offset || 0,
  ].join("-");

  return unstable_cache(
    async () => {
      try {
        let query = supabase.from("Drama").select(`
          id,
          title,
          slug,
          thumbnail,
          releaseDate,
          status,
          totalEpisode,
          isPopular,
          description,
          airTime,
          episodes:Episode(id, episodeNum),
          production:Production(id, name),
          networks:DramaNetwork(
            network:Network(id, name)
          )
        `);

        if (options?.status) {
          query = query.eq("status", options.status);
        }

        const orderBy = options?.orderBy || "title";
        const ascending = (options?.order || "asc") === "asc";
        query = query.order(orderBy, { ascending });

        if (options?.limit) {
          const from = options?.offset || 0;
          const to = from + options.limit - 1;
          query = query.range(from, to);
        }

        const { data: dramas, error } = await query;

        if (error) throw error;

        return { success: true, dramas: (dramas || []) as any[] };
      } catch (error) {
        console.error("Error fetching dramas:", error);
        return {
          success: false,
          dramas: [],
          error: "Failed to fetch dramas",
        };
      }
    },
    [cacheKey],
    {
      revalidate: 60, // Cache 1 menit
      tags: ["dramas", "dramas-list"],
    }
  )();
}

// Get drama by ID - CACHED (untuk edit form)
export async function getDramaById(id: string) {
  return unstable_cache(
    async () => {
      try {
        const { data: drama, error } = await supabase
          .from("Drama")
          .select(
            `
            *,
            casts:DramaCast(
              character,
              cast:Cast(name)
            ),
            directors:DramaDirector(
              director:Director(name)
            ),
            writers:DramaWriter(
              writer:Writer(name)
            ),
            novelAuthors:DramaNovelAuthor(
              novelTitle,
              novelAuthor:NovelAuthor(name)
            ),
            networks:DramaNetwork(
              network:Network(name)
            ),
            production:Production(name)
          `
          )
          .eq("id", id)
          .single();

        if (error || !drama) {
          return { success: false, drama: null };
        }

        const transformedDrama = {
          ...drama,
          casts:
            drama.casts?.map((dc: any) => ({
              name: dc.cast.name,
              character: dc.character || "",
            })) || [],
          directors:
            drama.directors?.map((dd: any) => ({
              name: dd.director.name,
            })) || [],
          writers:
            drama.writers?.map((dw: any) => ({
              name: dw.writer.name,
            })) || [],
          novelAuthors:
            drama.novelAuthors?.map((dna: any) => ({
              name: dna.novelAuthor.name,
              novelTitle: dna.novelTitle || "",
            })) || [],
          networks:
            drama.networks?.map((dn: any) => ({
              name: dn.network.name,
            })) || [],
          production: drama.production ? { name: drama.production.name } : null,
        };

        return { success: true, drama: transformedDrama };
      } catch (error) {
        return {
          success: false,
          drama: null,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    ["drama-by-id", id],
    {
      revalidate: 300, // Cache 5 menit (jarang berubah)
      tags: ["dramas", `drama-${id}`],
    }
  )();
}

// Get drama by slug - CACHED (untuk detail page)
export async function getDramaBySlug(slug: string) {
  return unstable_cache(
    async () => {
      try {
        const { data: drama, error } = await supabase
          .from("Drama")
          .select(
            `
            *,
            episodes:Episode(
              id,
              episodeNum,
              slug,
              releaseDate,
              videoUrl
            ),
            casts:DramaCast(
              id,
              character,
              cast:Cast(id, name)
            ),
            directors:DramaDirector(
              id,
              director:Director(id, name)
            ),
            writers:DramaWriter(
              id,
              writer:Writer(id, name)
            ),
            novelAuthors:DramaNovelAuthor(
              id,
              novelTitle,
              novelAuthor:NovelAuthor(id, name)
            ),
            networks:DramaNetwork(
              id,
              network:Network(id, name)
            ),
            production:Production(id, name)
          `
          )
          .eq("slug", slug)
          .single();

        if (error || !drama) {
          return { success: false, drama: null };
        }

        // Sort episodes
        if (drama.episodes) {
          (drama as any).episodes = (drama.episodes as any[]).sort(
            (a, b) => a.episodeNum - b.episodeNum
          );
        }

        // Get episode count
        const { count } = await supabase
          .from("Episode")
          .select("*", { count: "exact", head: true })
          .eq("dramaId", drama.id);

        (drama as any)._count = { episodes: count || 0 };

        return { success: true, drama };
      } catch (error) {
        return {
          success: false,
          drama: null,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    ["drama-by-slug", slug],
    {
      revalidate: 180, // Cache 3 menit
      tags: ["dramas", `drama-slug-${slug}`],
    }
  )();
}

// Search dramas - NO CACHE (realtime search)
export async function searchDramas(
  query: string,
  options?: {
    limit?: number;
    offset?: number;
  }
) {
  try {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    const {
      data: dramas,
      error,
      count,
    } = await supabase
      .from("Drama")
      .select(
        `
        id,
        title,
        slug,
        thumbnail,
        releaseDate,
        status,
        totalEpisode,
        isPopular
      `,
        { count: "exact" }
      )
      .ilike("title", `%${query}%`)
      .order("title", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const total = count || 0;

    return {
      success: true,
      dramas: dramas || [],
      total,
      hasMore: offset + (dramas?.length || 0) < total,
    };
  } catch (error) {
    return {
      success: false,
      dramas: [],
      total: 0,
      hasMore: false,
      error: "Failed to search dramas",
    };
  }
}

// Get dramas with filters - PARTIAL CACHE (cache per filter combination)
export async function getDramasWithFilters(filters: {
  status?: string;
  search?: string;
  sortBy?: "title" | "releaseDate" | "popular";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}) {
  // Jika ada search, skip cache (realtime)
  if (filters.search) {
    return getDramasWithFiltersUncached(filters);
  }

  // Cache untuk filter tanpa search
  const cacheKey = [
    "dramas-filtered",
    filters.status || "all",
    filters.sortBy || "releaseDate",
    filters.order || "desc",
    filters.limit || 20,
    filters.offset || 0,
  ].join("-");

  return unstable_cache(
    () => getDramasWithFiltersUncached(filters),
    [cacheKey],
    {
      revalidate: 60,
      tags: ["dramas", "dramas-filtered"],
    }
  )();
}

// Helper function - actual query without cache
async function getDramasWithFiltersUncached(filters: {
  status?: string;
  search?: string;
  sortBy?: "title" | "releaseDate" | "popular";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}) {
  try {
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    let query = supabase.from("Drama").select(
      `
        id,
        title,
        slug,
        thumbnail,
        releaseDate,
        status,
        totalEpisode,
        isPopular,
        description
      `,
      { count: "exact" }
    );

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters.search) {
      query = query.ilike("title", `%${filters.search}%`);
    }

    if (filters.sortBy === "popular") {
      query = query
        .order("isPopular", { ascending: false })
        .order("releaseDate", { ascending: false });
    } else if (filters.sortBy === "title") {
      query = query.order("title", { ascending: true });
    } else {
      query = query.order("releaseDate", { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data: dramas, error, count } = await query;

    if (error) throw error;

    const total = count || 0;

    return {
      success: true,
      dramas: dramas || [],
      total,
      hasMore: offset + (dramas?.length || 0) < total,
    };
  } catch (error) {
    console.error("Error fetching dramas with filters:", error);
    return {
      success: false,
      dramas: [],
      total: 0,
      hasMore: false,
      error: "Failed to fetch dramas with filters",
    };
  }
}

// Get popular dramas - HEAVILY CACHED
export async function getAllPopularDrama(limit?: number) {
  return unstable_cache(
    async () => {
      try {
        const { data: dramas, error } = await supabase
          .from("Drama")
          .select(
            `
            id,
            title,
            slug,
            thumbnail,
            releaseDate,
            status,
            totalEpisode,
            description
          `
          )
          .eq("isPopular", true)
          .order("releaseDate", { ascending: false })
          .limit(limit || 10);

        if (error) throw error;

        return { success: true, dramas: dramas || [] };
      } catch (error) {
        return {
          success: false,
          dramas: [],
          error: "Failed to fetch popular dramas",
        };
      }
    },
    ["dramas-popular", String(limit || 10)],
    {
      revalidate: 300, // Cache 5 menit (jarang berubah)
      tags: ["dramas", "dramas-popular"],
    }
  )();
}

// Get recently completed - CACHED
export async function getRecentlyCompleted(limit?: number) {
  return unstable_cache(
    async () => {
      try {
        const { data: dramas, error } = await supabase
          .from("Drama")
          .select(
            `
            id,
            title,
            slug,
            thumbnail,
            releaseDate,
            status,
            totalEpisode,
            description
          `
          )
          .eq("status", "TAMAT")
          .order("releaseDate", { ascending: false })
          .limit(limit || 10);

        if (error) throw error;

        return { success: true, dramas: dramas || [] };
      } catch (error) {
        return {
          success: false,
          dramas: [],
          error: "Failed to fetch completed dramas",
        };
      }
    },
    ["dramas-completed", String(limit || 10)],
    {
      revalidate: 300, // Cache 5 menit
      tags: ["dramas", "dramas-completed"],
    }
  )();
}

// Get related dramas - CACHED per drama
export async function getRelatedDramas(dramaId: string, limit?: number) {
  return unstable_cache(
    async () => {
      try {
        const { data: currentDrama, error: currentError } = await supabase
          .from("Drama")
          .select("releaseDate, productionId, status")
          .eq("id", dramaId)
          .single();

        if (currentError || !currentDrama) {
          return { success: false, dramas: [] };
        }

        const actualLimit = limit || 6;

        // Priority 1: Same production company
        if (currentDrama.productionId) {
          const { data: sameProduction } = await supabase
            .from("Drama")
            .select(
              `
              id,
              title,
              slug,
              thumbnail,
              releaseDate,
              status,
              totalEpisode
            `
            )
            .eq("productionId", currentDrama.productionId)
            .neq("id", dramaId)
            .order("releaseDate", { ascending: false })
            .limit(actualLimit);

          if (sameProduction && sameProduction.length >= actualLimit) {
            return { success: true, dramas: sameProduction };
          }

          const year = new Date(currentDrama.releaseDate).getFullYear();
          const startDate = new Date(year, 0, 1).toISOString();
          const endDate = new Date(year, 11, 31, 23, 59, 59).toISOString();

          const { data: sameYear } = await supabase
            .from("Drama")
            .select(
              `
              id,
              title,
              slug,
              thumbnail,
              releaseDate,
              status,
              totalEpisode
            `
            )
            .neq("id", dramaId)
            .neq("productionId", currentDrama.productionId)
            .gte("releaseDate", startDate)
            .lte("releaseDate", endDate)
            .order("releaseDate", { ascending: false })
            .limit(actualLimit - (sameProduction?.length || 0));

          return {
            success: true,
            dramas: [...(sameProduction || []), ...(sameYear || [])],
          };
        }

        // Priority 2: Same year range
        const year = new Date(currentDrama.releaseDate).getFullYear();
        const startDate = new Date(year - 1, 0, 1).toISOString();
        const endDate = new Date(year + 1, 11, 31, 23, 59, 59).toISOString();

        const { data: dramas, error } = await supabase
          .from("Drama")
          .select(
            `
            id,
            title,
            slug,
            thumbnail,
            releaseDate,
            status,
            totalEpisode
          `
          )
          .neq("id", dramaId)
          .gte("releaseDate", startDate)
          .lte("releaseDate", endDate)
          .order("releaseDate", { ascending: false })
          .limit(actualLimit);

        if (error) throw error;

        return { success: true, dramas: dramas || [] };
      } catch (error) {
        return {
          success: false,
          dramas: [],
          error: "Failed to fetch related dramas",
        };
      }
    },
    ["dramas-related", dramaId, String(limit || 6)],
    {
      revalidate: 600, // Cache 10 menit (sangat jarang berubah)
      tags: ["dramas", `drama-${dramaId}-related`],
    }
  )();
}

// Get featured drama - CACHED
export async function getFeaturedDrama() {
  return unstable_cache(
    async () => {
      try {
        const { data: popularDramas, error } = await supabase
          .from("Drama")
          .select(
            `
            id,
            title,
            slug,
            thumbnail,
            description,
            releaseDate,
            status,
            totalEpisode,
            airTime
          `
          )
          .eq("isPopular", true)
          .order("releaseDate", { ascending: false })
          .limit(5);

        if (error) throw error;

        if (!popularDramas || popularDramas.length === 0) {
          return { success: false, drama: null };
        }

        // Pick random drama from top 5
        const randomIndex = Math.floor(Math.random() * popularDramas.length);
        const drama = popularDramas[randomIndex];

        return { success: true, drama };
      } catch (error) {
        return {
          success: false,
          drama: null,
          error: "Failed to fetch featured drama",
        };
      }
    },
    ["drama-featured"],
    {
      revalidate: 300, // Cache 5 menit
      tags: ["dramas", "dramas-featured"],
    }
  )();
}
