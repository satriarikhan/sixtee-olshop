/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['10.20.101.110', 'localhost'],
};

export default nextConfig;
