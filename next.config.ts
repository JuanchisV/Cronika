import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.linkareer.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'community-filepreview.spline.design',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
