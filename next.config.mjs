/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  experimental: {
    serverActions: {
      // Editors upload product photos and brand logos straight from a phone or
      // camera, which are routinely several megabytes. The 1MB default rejects
      // those with an opaque server error.
      bodySizeLimit: "12mb"
    }
  }
};

export default nextConfig;
