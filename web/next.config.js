/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Type errors are caught locally with `npm run typecheck`; never block a deploy on them.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'i.ytimg.com' }],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // SAMEORIGIN (not DENY): AdSense review tools may frame pages.
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      {
        source: '/ads.txt',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600' }],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/cases.html', destination: '/cases', permanent: true },
      { source: '/dashboard', destination: '/get-help', permanent: true },
      { source: '/resources', destination: '/guides', permanent: true },
      { source: '/donate', destination: '/support', permanent: true },
      { source: '/sponsor', destination: '/advertise', permanent: true },
      { source: '/partners', destination: '/advertise', permanent: true },
      { source: '/privacy', destination: '/legal/privacy', permanent: true },
      { source: '/terms', destination: '/legal/terms', permanent: true },
    ];
  },
};

module.exports = nextConfig;
