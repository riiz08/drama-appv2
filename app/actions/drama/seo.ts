"use server";

import { supabase } from "@/lib/supabase";

// Get all drama slugs for static generation
export async function getAllDramaSlugs() {
  try {
    const { data: dramas, error } = await supabase.from("Drama").select("slug");

    if (error) throw error;

    return {
      success: true,
      slugs: dramas?.map((d) => d.slug) || [],
    };
  } catch (error) {
    return {
      success: false,
      slugs: [],
      error: "Failed to fetch drama slugs",
    };
  }
}

// Get drama metadata for SEO
export async function getDramaMetadata(slug: string) {
  try {
    const { data: drama, error } = await supabase
      .from("Drama")
      .select(
        `
        id,
        title,
        slug,
        description,
        thumbnail,
        releaseDate,
        status,
        totalEpisode,
        airTime,
        updatedAt
      `
      )
      .eq("slug", slug)
      .single();

    if (error || !drama) {
      return { success: false, metadata: null };
    }

    // Get episode count
    const { count } = await supabase
      .from("Episode")
      .select("*", { count: "exact", head: true })
      .eq("dramaId", drama.id);

    return {
      success: true,
      metadata: {
        title: drama.title,
        description: drama.description,
        image: drama.thumbnail,
        releaseDate: drama.releaseDate,
        status: drama.status,
        totalEpisodes: drama.totalEpisode || count || 0,
        lastUpdated: drama.updatedAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      metadata: null,
      error: "Failed to fetch drama metadata",
    };
  }
}

// Get sitemap data for all dramas
export async function getDramaSitemapData() {
  try {
    const { data: dramas, error } = await supabase
      .from("Drama")
      .select("slug, updatedAt")
      .order("updatedAt", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: (dramas || []).map((d) => ({
        slug: d.slug,
        lastModified: d.updatedAt,
      })),
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: "Failed to fetch sitemap data",
    };
  }
}
