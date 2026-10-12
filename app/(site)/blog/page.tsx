import type { Metadata } from 'next';
import { listPublishedPosts, listPublishedTags } from '@/lib/server/content';
import { BlogList } from '@/components/blog/BlogList';
import { ScrollReveal } from '@/components/general/ScrollReveal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog | Codegiyu',
  description: 'Thoughts on engineering, product development, and lessons learned.',
  alternates: { canonical: '/blog' },
  openGraph: {
    type: 'website',
    title: 'Blog | Codegiyu',
    description: 'Thoughts on engineering, product development, and lessons learned.',
    url: '/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Codegiyu',
    description: 'Thoughts on engineering, product development, and lessons learned.',
  },
};

export default async function BlogPage() {
  const [posts, tags] = await Promise.all([listPublishedPosts(), listPublishedTags()]);
  return (
    <div className="w-full">
      <div className="border-b border-white/[0.06] py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <p className="text-ash text-xs font-semibold uppercase tracking-widest mb-3">Writing</p>
            <h1 className="font-montserrat font-black text-4xl md:text-5xl lg:text-6xl text-light mb-4 leading-[1.1]">
              Engineering &amp; Reflections
            </h1>
            <div className="w-12 h-[3px] bg-red mb-6" />
            <p className="text-ash text-lg max-w-2xl leading-relaxed">
              Thoughts on building products, shipping code, and lessons from 3+ years in tech.
            </p>
          </ScrollReveal>
        </div>
      </div>
      <div className="container py-16">
        <BlogList initialPosts={posts} tags={tags} />
      </div>
    </div>
  );
}
