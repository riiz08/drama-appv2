"use server";

import { supabase } from "@/lib/supabase";
import { Status } from "@/app/generated/prisma";

// Get all dramas with flexible options
export async function getAllDramas(options?: {
  status?: Status;
  limit?: number;
  offset?: number;
  orderBy?: "title" | "releaseDate" | "createdAt";
  order?: "asc" | "desc";
  includeRelations?: boolean;
}) {
  try {
    // Always select basic fields + relations (simpler approach)
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
      episodes:Episode(*),
      production:Production(
        id,
        name
      ),
      networks:DramaNetwork(
        network:Network(
          id,
          name
        )
      )
    `);

    // Apply filters
    if (options?.status) {
      query = query.eq("status", options.status);
    }

    // Apply ordering
    const orderBy = options?.orderBy || "title";
    const ascending = (options?.order || "asc") === "asc";
    query = query.order(orderBy, { ascending });

    // Apply pagination
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
}

// Get drama by slug with ALL relations
export async function getDramaBySlug(slug: string) {
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
          cast:Cast(
            id,
            name
          )
        ),
        directors:DramaDirector(
          id,
          director:Director(
            id,
            name
          )
        ),
        writers:DramaWriter(
          id,
          writer:Writer(
            id,
            name
          )
        ),
        novelAuthors:DramaNovelAuthor(
          id,
          novelTitle,
          novelAuthor:NovelAuthor(
            id,
            name
          )
        ),
        networks:DramaNetwork(
          id,
          network:Network(
            id,
            name
          )
        ),
        production:Production(
          id,
          name
        )
      `
      )
      .eq("slug", slug)
      .single();

    if (error || !drama) {
      return { success: false, drama: null };
    }

    // Sort episodes by episodeNum
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

    // Add _count to match Prisma structure
    (drama as any)._count = { episodes: count || 0 };

    return { success: true, drama };
  } catch (error) {
    return {
      success: false,
      drama: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Search dramas by title with pagination
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

// Get dramas with filters and sorting
export async function getDramasWithFilters(filters: {
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

    // Status filter
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    // Search filter
    if (filters.search) {
      query = query.ilike("title", `%${filters.search}%`);
    }

    // Sorting
    if (filters.sortBy === "popular") {
      query = query
        .order("isPopular", { ascending: false })
        .order("releaseDate", { ascending: false });
    } else if (filters.sortBy === "title") {
      query = query.order("title", { ascending: true });
    } else {
      // Default: latest (releaseDate desc)
      query = query.order("releaseDate", { ascending: false });
    }

    // Pagination
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

// Get all popular dramas
export async function getAllPopularDrama(limit?: number) {
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
}

// Get recently completed dramas
export async function getRecentlyCompleted(limit?: number) {
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
}

// Get related dramas (improved logic)
export async function getRelatedDramas(dramaId: string, limit?: number) {
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

      // If not enough, combine with dramas from same year
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

    // Priority 2: Same year if no production (±1 year range)
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
}

// Get featured drama for hero banner (random popular)
export async function getFeaturedDrama() {
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
}
