export const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const ADMIN_SESSION_COOKIE = 'admin_session';
export const LEGACY_SESSION_COOKIE = 'admin_token';
export const AUTH_COLLECTIONS = {
  links: 'authMagicLinks',
  sessions: 'authSessions',
  rateLimits: 'authRateLimits',
} as const;
