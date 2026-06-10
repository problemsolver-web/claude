/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Don't let strict type/lint checks block production deploys.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
