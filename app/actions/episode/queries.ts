"use server";

import { supabase } from "@/lib/supabase";
import { unstable_cache } from "next/cache";

// ============================================
// MAIN EPISODE QUERY - HEAVILY OPTIMIZED
// ============================================

export async function getEpisodeFullData(slug: string) {
  return unstable_cache(
    async () => {
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

        const drama = episode.drama as any;

        // Limit relations manually (Supabase doesn't support nested limit)
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

        // Calculate prev/next in-memory (more efficient than 2 extra queries)
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
    ["episode-full-data", slug],
    {
      revalidate: 300, // 5 minutes (episodes change occasionally)
      tags: ["episodes", `episode-${slug}`],
    }
  )();
}

// ============================================
// SIMPLIFIED EPISODE QUERY - FOR BASIC INFO
// ============================================

export async function getEpisodeBySlug(slug: string) {
  return unstable_cache(
    async () => {
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
              production:Production(id, name),
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
    ["episode-by-slug", slug],
    {
      revalidate: 300, // 5 minutes
      tags: ["episodes", `episode-${slug}`],
    }
  )();
}

// ============================================
// LATEST EPISODES - CACHED WITH PAGINATION
// ============================================

export async function getLatestEpisodes(limit?: number, offset?: number) {
  const actualLimit = limit || 12;
  const actualOffset = offset || 0;

  // Generate unique cache key for pagination
  const cacheKey = ["episodes-latest", actualLimit, actualOffset].join("-");

  return unstable_cache(
    async () => {
      try {
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
    },
    [cacheKey],
    {
      revalidate: 60, // 1 minute (homepage content, should be fresh)
      tags: ["episodes", "episodes-latest"],
    }
  )();
}

// ============================================
// ADJACENT EPISODES - CACHED PER DRAMA
// ============================================

export async function getAdjacentEpisodes(
  dramaId: string,
  currentEpisodeNum: number
) {
  return unstable_cache(
    async () => {
      try {
        // Single query with OR condition (more efficient than 2 queries)
        const { data: episodes, error } = await supabase
          .from("Episode")
          .select("id, slug, episodeNum")
          .eq("dramaId", dramaId)
          .in("episodeNum", [currentEpisodeNum - 1, currentEpisodeNum + 1])
          .order("episodeNum", { ascending: true });

        if (error) throw error;

        const prev =
          episodes?.find((ep) => ep.episodeNum === currentEpisodeNum - 1) ||
          null;
        const next =
          episodes?.find((ep) => ep.episodeNum === currentEpisodeNum + 1) ||
          null;

        return {
          success: true,
          prev,
          next,
        };
      } catch (error) {
        return {
          success: false,
          prev: null,
          next: null,
          error: "Failed to fetch adjacent episodes",
        };
      }
    },
    ["episodes-adjacent", dramaId, currentEpisodeNum.toString()],
    {
      revalidate: 300, // 5 minutes
      tags: ["episodes", `drama-${dramaId}-episodes`],
    }
  )();
}

// ============================================
// EPISODES BY DRAMA ID - CACHED
// ============================================

export async function getEpisodesByDramaId(dramaId: string) {
  return unstable_cache(
    async () => {
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
    },
    ["episodes-by-drama-id", dramaId],
    {
      revalidate: 180, // 3 minutes
      tags: ["episodes", `drama-${dramaId}-episodes`],
    }
  )();
}

// ============================================
// EPISODES BY DRAMA SLUG - CACHED
// ============================================

export async function getEpisodesByDramaSlug(dramaSlug: string) {
  return unstable_cache(
    async () => {
      try {
        // Single query with join (more efficient than 2 queries)
        const { data: episodes, error } = await supabase
          .from("Episode")
          .select(
            `
            id,
            slug,
            episodeNum,
            releaseDate,
            videoUrl,
            drama:Drama!inner(id)
          `
          )
          .eq("drama.slug", dramaSlug)
          .order("episodeNum", { ascending: true });

        if (error) throw error;

        if (!episodes || episodes.length === 0) {
          return {
            success: false,
            episodes: [],
            error: "Drama not found or no episodes",
          };
        }

        // Clean up the nested drama object (we only needed it for filtering)
        const cleanEpisodes = episodes.map(({ drama, ...ep }: any) => ep);

        return { success: true, episodes: cleanEpisodes };
      } catch (error) {
        return {
          success: false,
          episodes: [],
          error: "Failed to fetch episodes",
        };
      }
    },
    ["episodes-by-drama-slug", dramaSlug],
    {
      revalidate: 180, // 3 minutes
      tags: ["episodes", `drama-slug-${dramaSlug}-episodes`],
    }
  )();
}

// ============================================
// ALL EPISODE SLUGS - FOR STATIC GENERATION
// ============================================

export async function getAllEpisodeSlugs() {
  return unstable_cache(
    async () => {
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
    },
    ["episodes-all-slugs"],
    {
      revalidate: 600, // 10 minutes (rarely changes, used for build)
      tags: ["episodes", "episodes-slugs"],
    }
  )();
}

// ============================================
// POPULAR EPISODE SLUGS - FOR STATIC PARAMS
// ============================================

export async function getPopularEpisodeSlugs(limit: number = 50) {
  return unstable_cache(
    async () => {
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
    },
    ["episodes-popular-slugs", limit.toString()],
    {
      revalidate: 300, // 5 minutes
      tags: ["episodes", "episodes-popular"],
    }
  )();
}

// ============================================
// EPISODE METADATA - FOR SEO
// ============================================

// Types untuk response
interface Cast {
  cast: {
    id: string;
    name: string;
  };
  character?: string;
}

interface Director {
  director: {
    id: string;
    name: string;
  };
}

interface Writer {
  writer: {
    id: string;
    name: string;
  };
}

interface Network {
  network: {
    id: string;
    name: string;
  };
}

interface Production {
  id: string;
  name: string;
}

interface Drama {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  status: string;
  releaseDate: string;
  isPopular: boolean;
  totalEpisode?: number;
  airTime?: string;
  casts?: Cast[];
  directors?: Director[];
  writers?: Writer[];
  networks?: Network[];
  production?: Production | null;
}

interface Episode {
  id: string;
  slug: string;
  episodeNum: number;
  videoUrl: string;
  releaseDate: string;
  drama: Drama;
}

interface PrevNextEpisode {
  slug: string;
  episodeNum: number;
}

interface EpisodeMetadataResponse {
  success: boolean;
  episode?: Episode;
  prev?: PrevNextEpisode | null;
  next?: PrevNextEpisode | null;
}

// Internal function tanpa cache (untuk revalidation)
async function _getEpisodeMetadata(
  slug: string
): Promise<EpisodeMetadataResponse> {
  try {
    // Call RPC function
    const { data, error } = await supabase.rpc("get_episode_metadata", {
      episode_slug: slug,
    });

    if (error) {
      console.error("Error fetching episode metadata:", error);
      return { success: false };
    }

    if (!data || !data.success) {
      return { success: false };
    }

    return data as EpisodeMetadataResponse;
  } catch (error) {
    console.error("Unexpected error in getEpisodeMetadata:", error);
    return { success: false };
  }
}

export async function getEpisodeMetadata(
  slug: string
): Promise<EpisodeMetadataResponse> {
  const getCachedMetadata = unstable_cache(
    async (episodeSlug: string) => _getEpisodeMetadata(episodeSlug),
    [`episode-metadata-${slug}`], // cache key
    {
      revalidate: 3600, // revalidate setiap 1 jam (3600 detik)
      tags: [`episode-${slug}`, "episode-metadata"], // tags untuk on-demand revalidation
    }
  );

  return getCachedMetadata(slug);
}

// Optional: Helper function untuk fetch hanya basic episode info
export async function getBasicEpisodeInfo(slug: string) {
  try {
    const { data, error } = await supabase
      .from("Episode")
      .select(
        `
        id,
        slug,
        episodeNum,
        videoUrl,
        releaseDate,
        drama:Drama(
          id,
          title,
          slug,
          thumbnail
        )
      `
      )
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching basic episode info:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in getBasicEpisodeInfo:", error);
    return null;
  }
}
// ============================================
// ALL EPISODES - ADMIN WITH PAGINATION
// ============================================

export async function getAllEpisodes(page: number = 1, limit: number = 20) {
  // Generate cache key with pagination
  const cacheKey = ["episodes-all", page, limit].join("-");

  return unstable_cache(
    async () => {
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
    },
    [cacheKey],
    {
      revalidate: 60, // 1 minute (admin dashboard)
      tags: ["episodes", "episodes-admin"],
    }
  )();
}

// ============================================
// EPISODE COUNT BY DRAMA - CACHED
// ============================================

export async function getEpisodeCountByDrama(dramaId: string) {
  return unstable_cache(
    async () => {
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
    },
    ["episode-count-by-drama", dramaId],
    {
      revalidate: 180, // 3 minutes
      tags: ["episodes", `drama-${dramaId}-count`],
    }
  )();
}

export async function getEpisodeForPublic(slug: string) {
  return unstable_cache(
    async () => {
      try {
        const { data: episode, error } = await supabase
          .from("Episode")
          .select(
            `
            *,
            drama:Drama!inner(
              id,
              slug,
              title,
              thumbnail,
              description,
              status,
              totalEpisode,
              airTime,
              production:Production(id, name),
              casts:DramaCast(id, character, cast:Cast(id, name)),
              directors:DramaDirector(id, director:Director(id, name)),
              writers:DramaWriter(id, writer:Writer(id, name)),
              novelAuthors:DramaNovelAuthor(id, novelTitle, novelAuthor:NovelAuthor(id, name)),
              networks:DramaNetwork(id, network:Network(id, name))
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

        const drama = episode.drama as any;

        // Limit relations
        drama.casts = drama.casts?.slice(0, 5) || [];
        drama.directors = drama.directors?.slice(0, 2) || [];
        drama.writers = drama.writers?.slice(0, 2) || [];
        drama.novelAuthors = drama.novelAuthors?.slice(0, 1) || [];
        drama.networks = drama.networks?.slice(0, 2) || [];

        // ✅ Get ALL episodes for list (lightweight)
        const { data: allEpisodes } = await supabase
          .from("Episode")
          .select("id, slug, episodeNum, releaseDate")
          .eq("dramaId", drama.id)
          .order("episodeNum", { ascending: true });

        // ✅ Safe handling - default to empty array
        const episodes = allEpisodes || [];

        // Find prev/next from episodes
        const currentIndex = episodes.findIndex(
          (ep) => ep.episodeNum === episode.episodeNum
        );

        const prev = currentIndex > 0 ? episodes[currentIndex - 1] : null;
        const next =
          currentIndex < episodes.length - 1
            ? episodes[currentIndex + 1]
            : null;

        return {
          success: true,
          episode,
          prev,
          next,
          allEpisodes: episodes, // ✅ Now guaranteed not null
        };
      } catch (error) {
        return {
          success: false,
          episode: null,
          prev: null,
          next: null,
          allEpisodes: [], // ✅ Added
        };
      }
    },
    ["episode-public", slug],
    { revalidate: 3600, tags: ["episodes", `episode-${slug}`] }
  )();
}

export async function getLatestEpisodesForPublic(limit = 12, offset = 0) {
  const cacheKey = ["episodes-latest-public", limit, offset].join("-");

  return unstable_cache(
    async () => {
      try {
        const {
          data: episodes,
          error,
          count,
        } = await supabase
          .from("Episode")
          .select(
            `
            id,
            slug,
            episodeNum,
            releaseDate,
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
          .range(offset, offset + limit - 1);

        if (error) throw error;

        return {
          success: true,
          episodes: episodes || [],
          total: count || 0,
          hasMore: offset + (episodes?.length || 0) < (count || 0),
        };
      } catch (error) {
        return {
          success: false,
          episodes: [],
          total: 0,
          hasMore: false,
        };
      }
    },
    [cacheKey],
    { revalidate: 300, tags: ["episodes", "episodes-latest"] }
  )();
}
