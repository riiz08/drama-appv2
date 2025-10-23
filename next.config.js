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

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  reactStrictMode: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(woff|woff2|ttf|otf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
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
        source: "/drama/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=259200, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/:slug((?!api|_next|static).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=259200, stale-while-revalidate=604800",
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
      },
      {
        source: "/drama/watch/:slug*",
        destination: "/:slug*",
        permanent: true,
      },
      {
        source: "/watch/:slug*",
        destination: "/:slug*",
        permanent: true,
      },
      {
        source: "/latest-update",
        destination: "/drama?sort=latest",
        permanent: true,
      },
      {
        source: "/popular",
        destination: "/drama?sort=popular",
        permanent: true,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
