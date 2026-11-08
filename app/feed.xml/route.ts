import { NextResponse } from 'next/server';
import { listPublishedPosts } from '@/lib/server/content';
import { siteOrigin } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

function xml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export async function GET() {
  const SITE_URL = siteOrigin();
  const posts = await listPublishedPosts();
  const items = posts
    .map(
      post => `
    <item>
      <title>${xml(post.title)}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description>${xml(post.excerpt)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.tags.map(tag => `<category>${xml(tag)}</category>`).join('\n      ')}
    </item>`
    )
    .join('');
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Codegiyu — Engineering &amp; Reflections</title>
    <link>${SITE_URL}/blog</link>
    <description>Thoughts on building products, shipping code, and lessons from 3+ years in tech.</description>
    <language>en-GB</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
