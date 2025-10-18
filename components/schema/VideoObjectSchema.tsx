// components/schema/video-object-schema.tsx

interface VideoObjectSchemaProps {
  episode: {
    slug: string;
    episodeNum: number;
    videoUrl: string;
    releaseDate: Date | string;
    drama: {
      title: string;
      slug: string;
      description: string;
      thumbnail: string;
    };
  };
}

export function VideoObjectSchema({ episode }: VideoObjectSchemaProps) {
  const uploadDate =
    episode.releaseDate instanceof Date
      ? episode.releaseDate.toISOString()
      : new Date(episode.releaseDate).toISOString();

  // Plain object - no TypeScript type restrictions
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${episode.drama.title} - Episod ${episode.episodeNum}`,
    description: episode.drama.description,
    thumbnailUrl: episode.drama.thumbnail,
    uploadDate: uploadDate,
    contentUrl: episode.videoUrl,
    embedUrl: `https://mangeakkk.my.id/${episode.slug}`,
    url: `https://mangeakkk.my.id/${episode.slug}`,

    // Part of series
    partOfSeries: {
      "@type": "TVSeries",
      name: episode.drama.title,
      url: `https://mangeakkk.my.id/drama/${episode.drama.slug}`,
    },

    // Episode info
    episodeNumber: episode.episodeNum,

    // Publisher info
    publisher: {
      "@type": "Organization",
      name: "Mangeakkk Drama",
      logo: {
        "@type": "ImageObject",
        url: "https://mangeakkk.my.id/logo/logo.png",
      },
    },

    // Additional properties
    inLanguage: "ms-MY",
    isFamilyFriendly: true,
    potentialAction: {
      "@type": "WatchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://mangeakkk.my.id/${episode.slug}`,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
