"use server";

import { supabase } from "@/lib/supabase";
import { unstable_cache } from "next/cache";

export const getEpisodeFullData = unstable_cache(
  async (slug: string) => {
    try {
      const { data: episode, error } = await supabase
        .from("Episode")
        .select(
          `
          *,
          drama:Drama!inner(
            id,
            title,
            slug,
            thumbnail,
            description,
            status,
            totalEpisode,
            airTime,
            production:Production(
              id,
              name
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
            episodes:Episode(
              id,
              slug,
              episodeNum,
              releaseDate,
              videoUrl
            )
          )
        `
        )
        .eq("slug", slug)
        .single();

      if (error || !episode) {
        return {
          success: false,
          episode: null,
          prev: null,
          next: null,
          allEpisodes: [],
        };
      }

      // Cast drama untuk TypeScript
      const drama = episode.drama as any;

      // Limit casts, directors, writers manually (Supabase doesn't support limit in nested queries easily)
      if (drama.casts) drama.casts = drama.casts.slice(0, 5);
      if (drama.directors) drama.directors = drama.directors.slice(0, 2);
      if (drama.writers) drama.writers = drama.writers.slice(0, 2);
      if (drama.novelAuthors)
        drama.novelAuthors = drama.novelAuthors.slice(0, 1);
      if (drama.networks) drama.networks = drama.networks.slice(0, 2);

      // Sort episodes by episodeNum
      const allEpisodes = (drama.episodes || []).sort(
        (a: any, b: any) => a.episodeNum - b.episodeNum
      );

      // Calculate prev/next in-memory
      const currentIndex = allEpisodes.findIndex(
        (ep: any) => ep.episodeNum === episode.episodeNum
      );

      const prev = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null;
      const next =
        currentIndex < allEpisodes.length - 1
          ? allEpisodes[currentIndex + 1]
          : null;

      return {
        success: true,
        episode,
        prev,
        next,
        allEpisodes,
      };
    } catch (error) {
      return {
        success: false,
        episode: null,
        prev: null,
        next: null,
        allEpisodes: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  ["episode-full-data"],
  {
    revalidate: 3600, // 1 hour (conservative start)
    tags: ["episodes"],
  }
);

// ============================================
// EXISTING FUNCTIONS - WITH CACHE
// ============================================

// Get episode by slug with drama info
export const getEpisodeBySlug = unstable_cache(
  async (slug: string) => {
    try {
      const { data: episode, error } = await supabase
        .from("Episode")
        .select(
          `
          *,
          drama:Drama!inner(
            id,
            title,
            slug,
            thumbnail,
            description,
            status,
            totalEpisode,
            airTime,
            production:Production(
              id,
              name
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
            )
          )
        `
        )
        .eq("slug", slug)
        .single();

      if (error || !episode) {
        return { success: false, episode: null };
      }

      return { success: true, episode };
    } catch (error) {
      return {
        success: false,
        episode: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  ["episode-by-slug"],
  {
    revalidate: 3600,
    tags: ["episodes"],
  }
);

// Get latest episodes across all dramas
export async function getLatestEpisodes(limit?: number, offset?: number) {
  try {
    const actualLimit = limit || 12;
    const actualOffset = offset || 0;

    // Get episodes with count
    const {
      data: episodes,
      error,
      count,
    } = await supabase
      .from("Episode")
      .select(
        `
        *,
        drama:Drama!inner(
          id,
          title,
          slug,
          thumbnail,
          status
        )
      `,
        { count: "exact" }
      )
      .order("releaseDate", { ascending: false })
      .range(actualOffset, actualOffset + actualLimit - 1);

    if (error) throw error;

    const total = count || 0;

    return {
      success: true,
      episodes: episodes || [],
      total,
      hasMore: actualOffset + (episodes?.length || 0) < total,
    };
  } catch (error) {
    return {
      success: false,
      episodes: [],
      total: 0,
      hasMore: false,
      error: "Failed to fetch latest episodes",
    };
  }
}

// Get adjacent episodes (previous and next)
export async function getAdjacentEpisodes(
  dramaId: string,
  currentEpisodeNum: number
) {
  try {
    const [prevResult, nextResult] = await Promise.all([
      supabase
        .from("Episode")
        .select("id, slug, episodeNum")
        .eq("dramaId", dramaId)
        .eq("episodeNum", currentEpisodeNum - 1)
        .maybeSingle(),
      supabase
        .from("Episode")
        .select("id, slug, episodeNum")
        .eq("dramaId", dramaId)
        .eq("episodeNum", currentEpisodeNum + 1)
        .maybeSingle(),
    ]);

    return {
      success: true,
      prev: prevResult.data,
      next: nextResult.data,
    };
  } catch (error) {
    return {
      success: false,
      prev: null,
      next: null,
      error: "Failed to fetch adjacent episodes",
    };
  }
}

// Get all episodes for a drama by ID
export async function getEpisodesByDramaId(dramaId: string) {
  try {
    const { data: episodes, error } = await supabase
      .from("Episode")
      .select("id, slug, episodeNum, releaseDate, videoUrl")
      .eq("dramaId", dramaId)
      .order("episodeNum", { ascending: true });

    if (error) throw error;

    return { success: true, episodes: episodes || [] };
  } catch (error) {
    return {
      success: false,
      episodes: [],
      error: "Failed to fetch episodes",
    };
  }
}

// Get all episodes for a drama by SLUG
export async function getEpisodesByDramaSlug(dramaSlug: string) {
  try {
    const { data: drama, error: dramaError } = await supabase
      .from("Drama")
      .select("id")
      .eq("slug", dramaSlug)
      .single();

    if (dramaError || !drama) {
      return {
        success: false,
        episodes: [],
        error: "Drama not found",
      };
    }

    const { data: episodes, error } = await supabase
      .from("Episode")
      .select("id, slug, episodeNum, releaseDate, videoUrl")
      .eq("dramaId", drama.id)
      .order("episodeNum", { ascending: true });

    if (error) throw error;

    return { success: true, episodes: episodes || [] };
  } catch (error) {
    return {
      success: false,
      episodes: [],
      error: "Failed to fetch episodes",
    };
  }
}

// Get all episode slugs (for sitemap/generateStaticParams)
export async function getAllEpisodeSlugs() {
  try {
    const { data: episodes, error } = await supabase
      .from("Episode")
      .select("slug, updatedAt")
      .order("updatedAt", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      slugs: episodes?.map((e) => e.slug) || [],
      episodes:
        episodes?.map((e) => ({
          slug: e.slug,
          updatedAt: e.updatedAt,
        })) || [],
    };
  } catch (error) {
    console.error("Error fetching episode slugs:", error);
    return {
      success: false,
      slugs: [],
      episodes: [],
      error: "Failed to fetch episode slugs",
    };
  }
}

// ============================================
// NEW: Get popular episode slugs for generateStaticParams
// ============================================
export async function getPopularEpisodeSlugs(limit: number = 50) {
  try {
    const { data: episodes, error } = await supabase
      .from("Episode")
      .select("slug")
      .order("createdAt", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return episodes?.map((ep) => ep.slug) || [];
  } catch (error) {
    console.error("Error fetching popular episodes:", error);
    return [];
  }
}

// Get episode metadata for SEO
export async function getEpisodeMetadata(slug: string) {
  try {
    const { data: episode, error } = await supabase
      .from("Episode")
      .select(
        `
        episodeNum,
        releaseDate,
        updatedAt,
        drama:Drama!inner(
          title,
          description,
          thumbnail
        )
      `
      )
      .eq("slug", slug)
      .single();

    if (error || !episode) {
      return { success: false, metadata: null };
    }

    const drama = episode.drama as any;

    return {
      success: true,
      metadata: {
        title: `${drama.title} - Episode ${episode.episodeNum}`,
        description: drama.description,
        image: drama.thumbnail,
        releaseDate: episode.releaseDate,
        lastUpdated: episode.updatedAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      metadata: null,
      error: "Failed to fetch episode metadata",
    };
  }
}

// Get all episodes with drama info (for admin) with pagination
export async function getAllEpisodes(page: number = 1, limit: number = 20) {
  try {
    const skip = (page - 1) * limit;

    const {
      data: episodes,
      error,
      count,
    } = await supabase
      .from("Episode")
      .select(
        `
        *,
        drama:Drama!inner(
          id,
          title,
          slug,
          thumbnail
        )
      `,
        { count: "exact" }
      )
      .order("createdAt", { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: episodes || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
      error: "Failed to fetch episodes",
    };
  }
}

// Get episode count by drama
export async function getEpisodeCountByDrama(dramaId: string) {
  try {
    const { count, error } = await supabase
      .from("Episode")
      .select("*", { count: "exact", head: true })
      .eq("dramaId", dramaId);

    if (error) throw error;

    return { success: true, count: count || 0 };
  } catch (error) {
    return {
      success: false,
      count: 0,
      error: "Failed to count episodes",
    };
  }
}
