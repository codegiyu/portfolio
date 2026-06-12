import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAllBlogPosts, getBlogPostsByTag, searchBlogPosts } from '@/lib/blog';
import { isValidMagicLinkToken } from '@/lib/firebase';

const BLOG_DIRECTORY = path.join(process.cwd(), 'content', 'blog');

function requireAdmin(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value;
  return !!token && isValidMagicLinkToken(token, process.env.MAGIC_LINK_SECRET || 'dev-secret');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tag = searchParams.get('tag');
    const query = searchParams.get('q');

    let posts;

    if (query) {
      posts = searchBlogPosts(query);
    } else if (tag) {
      posts = getBlogPostsByTag(tag);
    } else {
      posts = getAllBlogPosts();
    }

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug, title, excerpt, date, tags, coverImage, author, published, content } =
      await request.json();

    if (!slug || !title || !content) {
      return NextResponse.json({ error: 'slug, title, and content are required' }, { status: 400 });
    }

    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(slug)) {
      return NextResponse.json(
        { error: 'slug must be lowercase alphanumeric with hyphens only' },
        { status: 400 }
      );
    }

    const filePath = path.join(BLOG_DIRECTORY, `${slug}.mdx`);
    if (fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
    }

    const frontmatter = [
      '---',
      `title: "${title}"`,
      `date: "${date || new Date().toISOString().split('T')[0]}"`,
      `tags: [${(tags || []).map((t: string) => `"${t}"`).join(', ')}]`,
      `excerpt: "${excerpt || ''}"`,
      `coverImage: "${coverImage || ''}"`,
      `author: "${author || 'Edward-Precious Omegbu'}"`,
      `published: ${published !== false}`,
      '---',
      '',
    ].join('\n');

    fs.writeFileSync(filePath, frontmatter + content, 'utf-8');

    return NextResponse.json({ message: 'Post created', slug }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
