/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: false,
  /** Dev only: allow HMR when the site is opened from another device on your LAN (Next 16 blocks cross-origin dev assets by default). */
  allowedDevOrigins: ["192.168.1.7"],
};

export default nextConfig;
