/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk'],
  },
  images: {
    domains: ['*'],
    unoptimized: true,
  },
  // Use 'standalone' output when building for Electron desktop packaging
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
}

module.exports = nextConfig
