/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — SPA mode, no Node.js server required
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}

module.exports = nextConfig
