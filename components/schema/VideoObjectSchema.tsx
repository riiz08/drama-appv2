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
  const getFormattedDate = () => {
    try {
      const date =
        episode.releaseDate instanceof Date
          ? episode.releaseDate
          : new Date(episode.releaseDate);

      // Cek jika date valid
      if (isNaN(date.getTime())) {
        const now = new Date();
        return now.toISOString().replace("Z", "+08:00");
      }

      // Set waktu ke jam tayang drama (22:00 waktu Malaysia)
      date.setHours(22, 0, 0, 0);

      // Format dengan timezone offset Malaysia
      // Output: 2025-11-27T22:00:00+08:00
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;
    } catch (error) {
      const now = new Date();
      return now.toISOString().replace("Z", "+08:00");
    }
  };

  const uploadDate = getFormattedDate();
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
