/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production
  compress: true,
  
  // Experimental features for better chunk handling
  experimental: {
    optimizePackageImports: ['framer-motion', 'lottie-react'],
  },
  
  // Allow cross-origin requests ONLY in development mode
  // This setting is IGNORED in production builds
  // IP 26.141.179.69 is likely a remote tunnel (ngrok, Cloudflare Tunnel, etc.)
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: [
      'http://26.141.179.69',
      'https://26.141.179.69',
      'http://localhost',
      'https://localhost',
      'http://127.0.0.1',
      'https://127.0.0.1',
    ],
  }),
};

module.exports = nextConfig;


