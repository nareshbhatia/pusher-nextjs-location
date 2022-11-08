/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Set strict mode to false to avoid seeing double updates during development
  // Normally this should be set to true
  reactStrictMode: false,
};

module.exports = nextConfig;
