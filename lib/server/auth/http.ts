import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ConfigError, getAuthConfig } from '@/lib/server/env';
import { ADMIN_SESSION_COOKIE, LEGACY_SESSION_COOKIE } from './constants';
import { getValidSession } from './store';

export type AuthorizationResult =
  | { ok: true; token: string }
  | { ok: false; status: 401 | 403 | 503; reason: string };

export function isSameOrigin(request: Request, appUrl: string): boolean {
  const origin = request.headers.get('origin');
  return !!origin && origin === new URL(appUrl).origin;
}

export async function authorizeAdminRequest(
  request: Request,
  options: { requireSameOrigin?: boolean } = {}
): Promise<AuthorizationResult> {
  let appUrl: string;
  try {
    appUrl = getAuthConfig().appUrl;
  } catch (error) {
    if (error instanceof ConfigError) return { ok: false, status: 503, reason: error.code };
    return { ok: false, status: 503, reason: 'AUTH_CONFIG_UNAVAILABLE' };
  }

  if (options.requireSameOrigin && !isSameOrigin(request, appUrl)) {
    return { ok: false, status: 403, reason: 'CSRF_ORIGIN_REJECTED' };
  }

  const token = request.headers
    .get('cookie')
    ?.match(new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE}=([^;]+)`))?.[1];
  if (!token) return { ok: false, status: 401, reason: 'SESSION_MISSING' };

  try {
    if (!(await getValidSession(token))) {
      return { ok: false, status: 401, reason: 'SESSION_INVALID' };
    }
    return { ok: true, token };
  } catch {
    return { ok: false, status: 503, reason: 'AUTH_STORE_UNAVAILABLE' };
  }
}

export async function getAdminPageAuthorization(): Promise<AuthorizationResult> {
  try {
    getAuthConfig();
  } catch (error) {
    if (error instanceof ConfigError) return { ok: false, status: 503, reason: error.code };
    return { ok: false, status: 503, reason: 'AUTH_CONFIG_UNAVAILABLE' };
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return { ok: false, status: 401, reason: 'SESSION_MISSING' };
  try {
    if (!(await getValidSession(token))) {
      return { ok: false, status: 401, reason: 'SESSION_INVALID' };
    }
    return { ok: true, token };
  } catch {
    return { ok: false, status: 503, reason: 'AUTH_STORE_UNAVAILABLE' };
  }
}

export function redirectForAdminAuthorization(
  result: Extract<AuthorizationResult, { ok: false }>
): never {
  redirect(
    result.status === 503
      ? '/admin?reason=temporarily-unavailable'
      : '/admin?reason=session-expired'
  );
}

export { ADMIN_SESSION_COOKIE, LEGACY_SESSION_COOKIE };
