import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getBlogPostBySlug } from '@/lib/blog';
import { requireAdmin } from '@/lib/server/auth/guard';

const BLOG_DIRECTORY = path.join(process.cwd(), 'content', 'blog');

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = getBlogPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await requireAdmin(request, { requireSameOrigin: true });
  if (denied) return denied;

  try {
    const { slug } = await params;
    const filePath = path.join(BLOG_DIRECTORY, `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const { title, excerpt, date, tags, coverImage, author, published, content } =
      await request.json();

    const frontmatter = [
      '---',
      `title: "${title}"`,
      `date: "${date}"`,
      `tags: [${(tags || []).map((t: string) => `"${t}"`).join(', ')}]`,
      `excerpt: "${excerpt || ''}"`,
      `coverImage: "${coverImage || ''}"`,
      `author: "${author || 'Edward-Precious Omegbu'}"`,
      `published: ${published !== false}`,
      '---',
      '',
    ].join('\n');

    fs.writeFileSync(filePath, frontmatter + content, 'utf-8');

    return NextResponse.json({ message: 'Post updated', slug }, { status: 200 });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const denied = await requireAdmin(request, { requireSameOrigin: true });
  if (denied) return denied;

  try {
    const { slug } = await params;
    const filePath = path.join(BLOG_DIRECTORY, `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({ message: 'Post deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
