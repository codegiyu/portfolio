import 'server-only';

import { unstable_cache } from 'next/cache';

export async function cachedContent<T>(
  loader: () => Promise<T>,
  keyParts: string[],
  tags: string[],
  revalidate = 300
): Promise<T> {
  if (process.env.NODE_ENV === 'test') return loader();
  return unstable_cache(loader, keyParts, { tags, revalidate })();
}
