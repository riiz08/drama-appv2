import { MetadataRoute } from "next";
import { getDramaSitemapData } from "@/app/actions/drama/seo";
import { getAllEpisodeSlugs } from "@/app/actions/episode";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mangeakkk.my.id";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/browse?status=ONGOING`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/browse?status=TAMAT`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Drama pages
  const dramaResult = await getDramaSitemapData();
  const dramaPages: MetadataRoute.Sitemap = dramaResult.success
    ? dramaResult.data.map((drama) => ({
        url: `${baseUrl}/drama/${drama.slug}`,
        lastModified: drama.lastModified,
        changeFrequency: "daily" as const,
        priority: 0.8,
      }))
    : [];

  // Episode pages
  const episodeResult = await getAllEpisodeSlugs();
  const episodePages: MetadataRoute.Sitemap = episodeResult.success
    ? episodeResult.slugs.map((slug) => ({
        url: `${baseUrl}/episode/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }))
    : [];

  return [...staticPages, ...dramaPages, ...episodePages];
}
