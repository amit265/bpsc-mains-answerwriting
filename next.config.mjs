/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {},  // changed from true → {}
    turbo: {},          // changed from true → {}
  },
  serverExternalPackages: ["your-package-name"], // moved outside
};

export default nextConfig;
