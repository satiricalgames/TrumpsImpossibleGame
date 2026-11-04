import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'TrumpsImpossibleGame';
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
const basePath = configuredBasePath
  ? `/${configuredBasePath.replace(/^\/+|\/+$/g, '')}`
  : isGitHubPages
    ? `/${repositoryName}`
    : '';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: isGitHubPages ? '.next-pages' : 'out',
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: {
    // Keep static prerendering single-threaded so builds are reliable from
    // OneDrive-synchronised Windows folders as well as in Cloudflare CI.
    cpus: 1,
  },
};

export default nextConfig;
