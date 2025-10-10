/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // Temporarily disable standalone for simpler Docker build
  // output: 'standalone',
  experimental: {
    // Enable server components by default
    serverComponentsExternalPackages: [],
  },
  // Skip static generation for pages that need runtime env vars
  trailingSlash: false,
  // Disable static optimization for auth pages during build
  generateBuildId: async () => {
    return 'village-management-platform'
  },
};

export default nextConfig;