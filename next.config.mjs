/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.HAWKINS_BUILD_DIR || ".next",
  reactStrictMode: true,
  transpilePackages: ["three"],
};

export default nextConfig;
