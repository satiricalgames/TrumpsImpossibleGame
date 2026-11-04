import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
const basePath = configuredBasePath
  ? `/${configuredBasePath.replace(/^\/+|\/+$/g, '')}`
  : '';

const privateToolPaths = [
  '/admin/',
  '/question-editor/',
  '/weekly-editor/',
  '/rotating-orders-editor/',
  '/executive-metrics-editor/',
  '/jokes-editor/',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: `${basePath}/`,
      disallow: privateToolPaths.map((path) => `${basePath}${path}`),
    },
  };
}
