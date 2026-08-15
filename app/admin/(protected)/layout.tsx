import type { ReactNode } from 'react';
import { getAdminPageAuthorization, redirectForAdminAuthorization } from '@/lib/server/auth/http';

export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const authorization = await getAdminPageAuthorization();
  if (!authorization.ok) redirectForAdminAuthorization(authorization);
  return children;
}
