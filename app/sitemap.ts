import { MetadataRoute } from "next";
import { getDramaSitemapData } from "@/app/actions/drama/seo";
import { getAllEpisodeSlugs } from "@/app/actions/episode";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mangeakkk.my.id";

  // Static pages - Core navigation only
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/drama`,
      lastModified: new Date(),
      changeFrequency: "daily", // New dramas/episodes added daily
      priority: 0.9,
    },
    // REMOVED: Query parameter pages (duplicate content)
  ];

  // Drama pages - Detail pages for each drama
  const dramaResult = await getDramaSitemapData();
  const dramaPages: MetadataRoute.Sitemap = dramaResult.success
    ? dramaResult.data.map((drama) => ({
        url: `${baseUrl}/drama/${drama.slug}`,
        lastModified: drama.lastModified,
        changeFrequency: "weekly" as const, // Changes when new episodes added
        priority: 0.7, // Lower than episodes (episodes are main content)
      }))
    : [];

  // Episode pages - Main content, highest priority
  const episodeResult = await getAllEpisodeSlugs();
  const episodePages: MetadataRoute.Sitemap = episodeResult.success
    ? episodeResult.episodes.map((episode) => ({
        url: `${baseUrl}/${episode.slug}`,
        lastModified: episode.updatedAt, // Real update date, not current date
        changeFrequency: "weekly" as const, // Rarely changes after publication
        priority: 0.8, // HIGH - episodes are your main content
      }))
    : [];

  return [...staticPages, ...dramaPages, ...episodePages];
}
