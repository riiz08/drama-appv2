/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "cdn.mangeakkk.my.id",
      },
    ],
  },
};

module.exports = nextConfig;
