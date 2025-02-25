/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['api.dicebear.com'],
  },
}

module.exports = nextConfig 