# Deployment and rollback runbook

## Preconditions

1. Confirm the intended `rebrand` branch and an intentional worktree state. The current production deployment is the Vercel project at `https://portfolio-codegiyu.vercel.app`; there is no custom-domain or infrastructure migration step.
2. Run `npm ci` and `npm run release:check`.
3. Confirm variable names are present without printing their values. Production uses `VERCEL_ENV=production`; preview uses `VERCEL_ENV=preview` and separate Firebase/R2/SMTP credentials.
4. Confirm `NEXT_PUBLIC_APP_URL=https://portfolio-codegiyu.vercel.app` in the Vercel production environment.
5. Confirm Firebase rules and indexes are committed and deployable.
6. Confirm the R2 public origin, bucket, retention, and admin credentials.
7. Confirm SMTP host, port, TLS mode, sender, recipient, and a controlled test mailbox.

## Firestore index preflight

The public project and post repositories use compound filters and ordering. Deploy the committed indexes and wait until the Firebase console reports `READY` before considering public routes healthy:

```bash
npm run firebase:deploy:indexes
npm run firebase:verify
npm run content:verify
```

`firebase:verify` is read-only. It executes each compound query used by the public content repository against the configured Firebase project and fails if an index is missing or still provisioning.

The deploy command is intentionally not run by local code checks because it mutates an external Firebase project.

## Preview

1. Deploy the preview with non-production secrets and isolated content.
2. Assert `X-Robots-Tag: noindex, nofollow` and confirm no production canonical appears in rendered metadata.
3. Run public navigation, 404, contact validation, consent, admin auth, upload validation, and `/api/health` smoke tests.
4. Review enforced CSP browser violations and logs for secrets or personal data.

## Production

1. Back up Firestore content with `npm run content:backup`.
2. Freeze content writes with the deployment control used by the hosting environment.
3. Deploy/verify Firestore indexes, then merge the reviewed `rebrand` branch into `main`; Vercel will redeploy the production project from `main`.
4. Verify `/api/health`, `/`, `/projects`, `/blog`, one detail route, `/feed.xml`, `/sitemap.xml`, and `/robots.txt`.
5. Verify admin login/logout, a controlled contact delivery, analytics consent, and one safe upload/replacement/delete flow.
6. Remove the write freeze and monitor runtime logs and synthetic checks for 24–48 hours.

## Rollback

Trigger rollback or fix-forward for public 5xx responses, unreadable content, broken authentication, failed contact delivery, unsafe/unremovable uploads, or incorrect indexing headers.

1. Freeze content writes.
2. Export the current Firestore state and preserve both pre- and post-deploy backups.
3. Roll back the application deployment or fix forward; never roll back below the Phase 1 authentication floor.
4. Preserve R2 objects during rollback; do not bulk-delete them.
5. Verify public reads, admin auth, contact, analytics, uploads, and cache invalidation.
6. Reconcile content changes before reopening writes.
