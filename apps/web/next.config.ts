import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@fiberguard/shared', '@fiberguard/fiber-rpc', '@fiberguard/diagnostics'],
};

export default nextConfig;
