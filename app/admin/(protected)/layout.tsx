import type { ReactNode } from 'react';
import { getAdminPageAuthorization, redirectForAdminAuthorization } from '@/lib/server/auth/http';
import { AdminShell } from '@/components/admin/AdminShell';
import { getPublicSettings } from '@/lib/server/content/settings';

export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const authorization = await getAdminPageAuthorization();
  if (!authorization.ok) redirectForAdminAuthorization(authorization);

  let adminName = 'Admin';
  let profileImage = '';
  try {
    const settings = await getPublicSettings();
    adminName = settings.about.name ?? 'Admin';
    profileImage = settings.about.profileImage ?? '';
  } catch {
    // non-fatal — shell still renders without profile data
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? '';

  return (
    <AdminShell adminName={adminName} adminEmail={adminEmail} profileImage={profileImage}>
      {children}
    </AdminShell>
  );
}
