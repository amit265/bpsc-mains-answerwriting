/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: false, // optional
      serverComponentsExternalPackages: [], // optional
      turbo: false, // ❗ This disables Turbopack
    }
}
export default nextConfig;
