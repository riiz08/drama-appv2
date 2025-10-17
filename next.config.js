/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "cdn.mangeakkk.my.id",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/latest-update",
        destination: "/drama?sort=latest",
        permanent: true, // 301 redirect
      },
      {
        source: "/popular",
        destination: "/drama?sort=popular",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
