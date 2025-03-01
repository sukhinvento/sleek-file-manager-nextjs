
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  webpack: (config) => {
    // Add support for processing process.env variables in browser
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      process: require.resolve('process/browser') 
    };
    return config;
  },
}

module.exports = nextConfig
