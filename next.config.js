/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Removed - not compatible with dynamic API routes
  images: {
    unoptimized: true,
  },
}
module.exports = nextConfig