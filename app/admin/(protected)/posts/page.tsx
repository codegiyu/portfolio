'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/types/general';
import { formatDate } from '@/lib/utils';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from 'lucide-react';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchPosts() {
    try {
      const res = await fetch('/api/blog?scope=admin');
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
      setError('Posts could not be loaded. Try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  async function handleDelete(slug: string) {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    setDeleting(slug);
    setError(null);
    try {
      const res = await fetch(`/api/blog/${slug}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.slug !== slug));
      } else {
        setError('Post could not be deleted. Try again.');
      }
    } catch {
      setError('Post could not be deleted. Try again.');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-montserrat font-black text-2xl text-light">Blog Posts</h2>
          {!loading && (
            <p className="text-ash text-sm mt-1">
              {posts.length} post{posts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red text-light text-sm font-semibold font-montserrat hover:opacity-90 transition-all">
          <PlusIcon className="size-4" />
          New Post
        </Link>
      </div>

      {error && (
        <p role="alert" className="mb-6 text-sm text-red">
          {error}
        </p>
      )}

      <div className="border border-white/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-dark/50">
              <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-ash/50">
                Title
              </th>
              <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-ash/50 hidden md:table-cell">
                Date
              </th>
              <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-ash/50 hidden sm:table-cell">
                Status
              </th>
              <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-ash/50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-ash">
                  <div className="inline-block w-6 h-6 border-2 border-white/10 border-t-red rounded-full animate-spin" />
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-ash">
                  No posts yet.{' '}
                  <Link
                    href="/admin/posts/new"
                    className="text-red hover:underline underline-offset-4">
                    Create your first post
                  </Link>
                </td>
              </tr>
            ) : (
              posts.map(post => (
                <tr
                  key={post.slug}
                  className="border-b border-white/[0.04] hover:bg-dark/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-light line-clamp-1">{post.title}</p>
                    <p className="text-xs text-ash/50 mt-0.5 font-mono">{post.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-ash hidden md:table-cell">
                    {formatDate(post.date)}
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 border ${
                        post.published
                          ? 'border-green-700/50 text-green-400 bg-green-900/10'
                          : 'border-white/10 text-ash/50'
                      }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        aria-label={`View ${post.title}`}
                        className="text-ash hover:text-red transition-colors"
                        title="View">
                        <EyeIcon className="size-4" />
                      </Link>
                      <Link
                        href={`/admin/posts/${post.slug}/edit`}
                        className="text-ash hover:text-red transition-colors"
                        title="Edit"
                        aria-label={`Edit ${post.title}`}>
                        <PencilIcon className="size-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.slug)}
                        disabled={deleting === post.slug}
                        className="text-ash hover:text-red transition-colors disabled:opacity-50"
                        title="Delete"
                        aria-label={`Delete ${post.title}`}>
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
