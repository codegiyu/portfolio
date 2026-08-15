'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Link from 'next/link';
import { ArrowLeftIcon, ClockIcon, CalendarIcon } from 'lucide-react';
import { BlogPost } from '@/lib/types/general';
import { formatDate } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/[*_`]/g, '');
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    items.push({ id, text, level });
  }
  return items;
}

export function BlogPostContent({ post }: { post: BlogPost }) {
  const toc = extractToc(post.content);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-20% 0% -70% 0%' }
    );
    document.querySelectorAll('h2[id], h3[id]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full">
      {/* Back link */}
      <div className="container py-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-ash hover:text-red transition-colors font-semibold">
          <ArrowLeftIcon className="size-4" />
          Back to Blog
        </Link>
      </div>

      {/* Post header */}
      <div className="border-b border-white/[0.06] pb-10">
        <div className="container max-w-4xl">
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="text-xs font-semibold px-2 py-1 border border-white/10 text-ash rounded">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="font-montserrat font-black text-3xl md:text-4xl lg:text-5xl text-light leading-[1.2] mb-6">
            {post.title}
          </h1>
          <p className="text-ash text-lg leading-relaxed mb-6 max-w-2xl">{post.excerpt}</p>
          <div className="flex flex-wrap items-center gap-5 text-xs text-ash/70 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="size-3.5" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon className="size-3.5" />
              {post.readingTime} min read
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container py-12 lg:py-16">
        <div className="flex gap-14 items-start">
          {/* Article */}
          <article className="flex-1 min-w-0 max-w-[72ch]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => {
                  const id = String(children)
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-');
                  return (
                    <h2
                      id={id}
                      className="font-montserrat font-black text-2xl md:text-3xl text-light mt-12 mb-5 scroll-mt-24">
                      {children}
                    </h2>
                  );
                },
                h3: ({ children }) => {
                  const id = String(children)
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-');
                  return (
                    <h3
                      id={id}
                      className="font-montserrat font-bold text-xl text-light mt-8 mb-4 scroll-mt-24">
                      {children}
                    </h3>
                  );
                },
                p: ({ children }) => (
                  <p className="text-ash leading-[1.85] mb-5 text-[15px]">{children}</p>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red hover:underline underline-offset-4 font-medium">
                    {children}
                  </a>
                ),
                ul: ({ children }) => <ul className="my-5 space-y-2 ml-4">{children}</ul>,
                ol: ({ children }) => (
                  <ol className="my-5 space-y-2 ml-4 list-decimal">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-ash text-[15px] leading-[1.8] flex gap-2">
                    <span className="text-red mt-[0.4em] flex-shrink-0">›</span>
                    <span>{children}</span>
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-[3px] border-red pl-5 my-6 italic text-ash/80">
                    {children}
                  </blockquote>
                ),
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isBlock = match !== null;
                  if (isBlock) {
                    return (
                      <div className="my-6 rounded-sm overflow-hidden border border-white/[0.06]">
                        <div className="flex items-center justify-between bg-dark/80 px-4 py-2 border-b border-white/[0.06]">
                          <span className="text-xs text-ash/60 uppercase tracking-wider font-semibold">
                            {match[1]}
                          </span>
                        </div>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            background: '#1E1F23',
                            fontSize: '13px',
                            padding: '1.25rem',
                          }}>
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }
                  return (
                    <code
                      className="bg-dark border border-white/10 text-light/90 px-1.5 py-0.5 rounded text-[13px] font-mono"
                      {...props}>
                      {children}
                    </code>
                  );
                },
                hr: () => <hr className="border-white/[0.06] my-10" />,
                strong: ({ children }) => (
                  <strong className="text-light font-bold">{children}</strong>
                ),
                em: ({ children }) => <em className="text-ash/90 italic">{children}</em>,
              }}>
              {post.content}
            </ReactMarkdown>

            {/* Author */}
            <div className="mt-16 pt-8 border-t border-white/[0.06] flex items-start gap-4">
              <div className="w-12 h-12 bg-dark border border-white/10 rounded-sm flex-shrink-0 flex items-center justify-center text-red font-black font-lobster text-xl">
                C
              </div>
              <div>
                <p className="font-semibold font-montserrat text-light text-sm">
                  Edward-Precious Omegbu
                </p>
                <p className="text-ash text-xs mt-0.5">Fullstack Product Engineer · Codegiyu</p>
                <div className="flex gap-4 mt-2">
                  <a
                    href="https://x.com/TheLonerider20"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-ash/60 hover:text-red transition-colors">
                    Twitter
                  </a>
                  <a
                    href="https://github.com/codegiyu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-ash/60 hover:text-red transition-colors">
                    GitHub
                  </a>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="mt-8 flex items-center gap-4">
              <span className="text-xs text-ash/40 uppercase tracking-wider font-semibold">
                Share
              </span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://portfolio-codegiyu.vercel.app/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-ash hover:text-red transition-colors border border-white/10 hover:border-red/40 px-3 py-1.5 rounded-sm">
                Share on X
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="text-xs font-semibold text-ash hover:text-red transition-colors border border-white/10 hover:border-red/40 px-3 py-1.5 rounded-sm">
                Copy link
              </button>
            </div>
          </article>

          {/* Sidebar TOC */}
          {toc.length > 0 && (
            <aside className="hidden xl:block w-56 flex-shrink-0 sticky top-24 self-start">
              <p className="text-[10px] font-black uppercase tracking-widest text-ash/50 mb-4">
                On this page
              </p>
              <nav className="space-y-1">
                {toc.map(item => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block text-xs leading-relaxed transition-colors py-1 ${
                      item.level === 3 ? 'pl-3' : ''
                    } ${
                      activeId === item.id ? 'text-red font-semibold' : 'text-ash/60 hover:text-ash'
                    }`}>
                    {item.text}
                  </a>
                ))}
              </nav>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
