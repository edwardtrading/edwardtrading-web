/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Videos are large and rarely change; cache them in the browser and CDN
        // for a week so repeat views replay without re-downloading. Upload a
        // replacement under a new file name to change one immediately.
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400"
          }
        ]
      }
    ];
  },
  async redirects() {
    // Retired URLs. Permanent redirects pass their search value to the new page.
    return [
      {
        source: "/associated-companies",
        destination: "/partner-companies",
        permanent: true
      },
      {
        source: "/diversey-taski",
        destination: "/partner-companies",
        permanent: true
      }
    ];
  },
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
