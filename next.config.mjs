/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false, crypto: false }
    config.experiments = { ...config.experiments, asyncWebAssembly: true }
    return config
  },
}
export default nextConfig
