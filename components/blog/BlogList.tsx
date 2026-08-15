'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/types/general';
import { formatDate } from '@/lib/utils';
import { StaggerReveal } from '@/components/general/ScrollReveal';
import { SearchIcon } from 'lucide-react';

interface BlogListProps {
  initialPosts: BlogPost[];
  tags: string[];
}

export function BlogList({ initialPosts, tags }: BlogListProps) {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return initialPosts.filter(post => {
      const matchesSearch =
        !search ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchesTag = !activeTag || post.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }, [initialPosts, search, activeTag]);

  return (
    <div>
      {/* Search + Filters */}
      <div className="flex flex-col gap-4 mb-12">
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ash/40" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-3 bg-dark border border-white/[0.06] text-light placeholder-ash/40 text-sm focus:outline-none focus:border-red/50 transition-colors font-poppins"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <TagButton active={activeTag === null} onClick={() => setActiveTag(null)}>
            All
          </TagButton>
          {tags.map(tag => (
            <TagButton
              key={tag}
              active={activeTag === tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}>
              {tag}
            </TagButton>
          ))}
        </div>
      </div>

      {/* Posts */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-ash text-lg">No posts found.</p>
          <button
            onClick={() => {
              setSearch('');
              setActiveTag(null);
            }}
            className="mt-4 text-sm text-red hover:underline underline-offset-4">
            Clear filters
          </button>
        </div>
      ) : (
        <StaggerReveal className="divide-y divide-white/[0.06]" stagger={0.06} y={14}>
          {filtered.map(post => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </StaggerReveal>
      )}
    </div>
  );
}

function TagButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold font-montserrat transition-all ${
        active
          ? 'bg-red text-light border border-red'
          : 'border border-white/10 text-ash hover:border-red/50 hover:text-red'
      }`}>
      {children}
    </button>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col md:flex-row gap-6 py-10 hover:bg-dark/30 transition-colors -mx-4 px-4">
      {/* Text */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] font-black uppercase tracking-wider text-ash/50">
              {tag}
            </span>
          ))}
          <span className="text-[10px] text-ash/30">·</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ash/50">
            {post.readingTime} min read
          </span>
        </div>

        <h2 className="font-montserrat font-black text-xl md:text-2xl text-light group-hover:text-red transition-colors leading-[1.3] line-clamp-2">
          {post.title}
        </h2>

        <p className="text-ash text-sm leading-relaxed line-clamp-2 max-w-prose">{post.excerpt}</p>

        <p className="text-xs text-ash/40 font-semibold mt-auto pt-2">{formatDate(post.date)}</p>
      </div>

      {/* Arrow */}
      <div className="hidden md:flex items-center self-center text-ash/20 group-hover:text-red transition-colors text-2xl font-light">
        →
      </div>
    </Link>
  );
}
