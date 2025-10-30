const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
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

  async headers() {
    return [
      // Cache untuk static assets (gambar)
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache untuk fonts
      {
        source: "/:all*(woff|woff2|ttf|otf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache untuk Next.js optimized images
      {
        source: "/_next/image",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Redirect old URL structures to new structure
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
