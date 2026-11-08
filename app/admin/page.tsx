import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Logo } from '@/components/atoms/Logo';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { ADMIN_SESSION_COOKIE } from '@/lib/server/auth/constants';
import { getValidSession } from '@/lib/server/auth/store';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  // If the visitor already has a valid session, skip the login page entirely.
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (token && (await getValidSession(token))) {
      redirect('/admin/posts');
    }
  } catch {
    // Session check failure is non-fatal here — just show the login form.
  }

  return (
    <div className="min-h-screen bg-darkBg flex flex-col items-center px-4 py-10">
      <header>
        <Logo size="large" />
      </header>

      <main className="flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-light">Admin Panel</h1>
            <p className="text-ash mt-2">Sign in to manage your blog posts</p>
          </div>

          <AdminLoginForm />
        </div>
      </main>

      <footer>
        <p className="text-ash text-sm">
          &copy; {new Date().getFullYear()} Codegiyu. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
