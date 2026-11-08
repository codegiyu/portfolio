# Phase 1 security and dependency notes

## Dependency audit exception

The production audit is gated at high severity with:

```text
npm audit --omit=dev --audit-level=high
```

The current remaining findings are moderate transitive findings (currently reported through
`baseline-browser-mapping` and `sprintf-js`/`gray-matter`). The high-severity production
findings in Next.js, Nodemailer, Firebase Admin, gRPC, multipart parsing, and source-map
dependencies have been resolved with compatible updates and lockfile overrides. The remaining
fix suggestions either require a breaking package change or have no safe direct fix.

Revisit this exception on dependency upgrades. Do not use `npm audit fix --force` as remediation.

## Authentication storage

Authentication records are stored in `authMagicLinks`, `authSessions`, and `authRateLimits`.
Only SHA-256 token/key hashes and expiry/revocation metadata are persisted. Configure Firestore
TTL policies on each collection's `expiresAt` field; authorization does not rely on TTL deletion
and always checks expiry explicitly.

Authentication failures are logged with stable error codes and variable names only. Raw tokens,
service-account JSON, SMTP credentials, and admin email addresses must never be logged.

## Deployment and recovery checklist

Phase 3 also adds consent-gated aggregate analytics, server-owned media keys, strict upload
signatures, environment-aware indexing headers, and redacted runtime diagnostics. See
`docs/privacy.md`, `docs/operations.md`, and `docs/deployment.md` for the current controls.

Before enabling admin access in a preview or production environment:

1. Set validated `ADMIN_EMAIL`, `NEXT_PUBLIC_APP_URL`, SMTP variables, and
   `FIREBASE_SERVICE_ACCOUNT_JSON`; add R2 variables only where uploads are enabled.
2. Configure Firestore TTL policies for `authMagicLinks.expiresAt`, `authSessions.expiresAt`,
   and `authRateLimits.expiresAt`. Expiry is still checked in application code because TTL
   deletion is asynchronous.
3. Rotate the legacy `MAGIC_LINK_SECRET` to a fresh, unused value before deployment. Do not
   restore code that can issue legacy tokens or uses a development fallback.
4. In a test mailbox, verify login, single-use replay rejection, session expiry, same-origin
   mutation enforcement, logout revocation, and unauthorized API responses.
5. If SMTP or Firestore is unavailable, keep public content available while admin operations
   fail closed with the documented generic responses.
6. For rollback, use the hardened/auth-disabled floor and fix forward; never roll back to the
   legacy token implementation. Remove the rotated legacy secret after the rollback window.

No production deployment, Firestore mutation, email send, commit, push, or pull request is part
of this implementation pass.
