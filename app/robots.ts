import { MetadataRoute } from 'next';
import { isIndexableEnvironment, siteOrigin } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const indexable = isIndexableEnvironment();
  const siteUrl = siteOrigin();
  return {
    rules: [
      {
        userAgent: '*',
        allow: indexable ? '/' : undefined,
        disallow: indexable ? ['/admin', '/api/'] : ['/'],
      },
    ],
    sitemap: indexable ? `${siteUrl}/sitemap.xml` : undefined,
    host: indexable ? siteUrl : undefined,
  };
}
