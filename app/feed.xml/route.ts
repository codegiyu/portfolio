import { NextResponse } from 'next/server';
import { getAllBlogPosts } from '@/lib/blog';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://portfolio-codegiyu.vercel.app';

export async function GET() {
  const posts = getAllBlogPosts();

  const items = posts
    .map(
      post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.tags.map(t => `<category><![CDATA[${t}]]></category>`).join('\n      ')}
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
    <managingEditor>edward@codegiyu.dev (Edward-Precious Omegbu)</managingEditor>
    <webMaster>edward@codegiyu.dev (Edward-Precious Omegbu)</webMaster>
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
