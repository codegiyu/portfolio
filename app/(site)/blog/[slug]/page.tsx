import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublishedPostBySlug } from '@/lib/server/content';
import { BlogPostContent } from '@/components/blog/BlogPostContent';
import { siteOrigin } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { robots: { index: false, follow: false } };
  return {
    title: `${post.title} | Codegiyu`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      url: `${siteOrigin()}/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author ?? 'Edward-Precious Omegbu'],
      tags: post.tags,
      images: post.coverImage ? [post.coverImage] : ['/images/codegiyu-wide.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      images: post.coverImage ? [post.coverImage] : ['/images/codegiyu-wide.jpg'],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();
  return <BlogPostContent post={post} />;
}
