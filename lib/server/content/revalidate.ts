import 'server-only';

import { revalidatePath, revalidateTag } from 'next/cache';

export function invalidateProject(slug: string) {
  revalidateTag('projects', { expire: 0 });
  revalidateTag(`project:${slug}`, { expire: 0 });
  revalidatePath('/');
  revalidatePath('/projects');
  revalidatePath(`/projects/${slug}`);
  revalidatePath('/sitemap.xml');
}

export function invalidatePost(slug: string) {
  revalidateTag('posts', { expire: 0 });
  revalidateTag(`post:${slug}`, { expire: 0 });
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/feed.xml');
  revalidatePath('/sitemap.xml');
}

export function invalidateSettings() {
  revalidateTag('settings', { expire: 0 });
  revalidatePath('/');
}
