const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.mangeakkk.my.id",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },

  reactStrictMode: true,
  poweredByHeader: false,

  async redirects() {
    return [
      // Redirect old URL structures to new structure
      {
        source: "/watch/:slug(.*)-full-episod-:episode",
        destination: "/:slug-episode-:episode",
        permanent: true,
        statusCode: 301,
      },
      {
        source: "/:slug(.*)-full-episod-:episode",
        destination: "/:slug-episode-:episode",
        permanent: true,
        statusCode: 301,
      },
      {
        source: "/browse",
        destination: "/drama",
        permanent: true,
        statusCode: 301,
      },
      {
        source: "/drama/detail/:slug*",
        destination: "/drama/:slug*",
        permanent: true,
        statusCode: 301,
      },
      {
        source: "/drama/watch/:slug*",
        destination: "/:slug*",
        permanent: true,
        statusCode: 301,
      },
      {
        source: "/watch/:slug*",
        destination: "/:slug*",
        permanent: true,
        statusCode: 301,
      },
      // BARU: Redirect /episode/* ke root
      {
        source: "/episode/:slug*",
        destination: "/:slug*",
        permanent: true,
        statusCode: 301,
      },
      {
        source: "/latest-update",
        destination: "/drama?sort=latest",
        permanent: true,
        statusCode: 301,
      },
      {
        source: "/popular",
        destination: "/drama?sort=popular",
        permanent: true,
        statusCode: 301,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
