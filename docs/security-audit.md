# Phase 1 security and dependency notes

## Dependency audit exception

The production audit is gated at high severity with:

```text
npm audit --omit=dev --audit-level=high
```

The current remaining findings are moderate and originate from Firebase Admin's optional
`@google-cloud/storage` dependency chain (`teeny-request`, `retry-request`, `gaxios`, and
their nested `uuid`). The application imports Firebase Admin only for App initialization and
Firestore; it does not import or call the Storage client. npm's suggested remediation is a
downgrade to Firebase Admin 10.3.0, which is rejected because it is a breaking downgrade and
would discard the current Node 22/Firebase Admin compatibility.

Revisit this exception whenever Firebase Admin or the Google Cloud Storage dependency chain
publishes a compatible fix. Do not use `npm audit fix --force` as remediation.

## Authentication storage

Authentication records are stored in `authMagicLinks`, `authSessions`, and `authRateLimits`.
Only SHA-256 token/key hashes and expiry/revocation metadata are persisted. Configure Firestore
TTL policies on each collection's `expiresAt` field; authorization does not rely on TTL deletion
and always checks expiry explicitly.

Authentication failures are logged with stable error codes and variable names only. Raw tokens,
service-account JSON, SMTP credentials, and admin email addresses must never be logged.

## Deployment and recovery checklist

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
