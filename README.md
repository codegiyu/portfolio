# Codegiyu Portfolio

Production portfolio for Edward-Precious Omegbu, built with Next.js, React, Tailwind CSS, Firestore, and Cloudflare R2.

## Local development

Use Node 22 and npm 10.9.8, then install dependencies and configure the server variables from `.env.example`:

```bash
npm ci
npm run dev
```

The application requires a Firebase Admin service account for content and authentication. SMTP, R2, and the public application URL are also required for their respective features. Never commit `.env.local` or service-account JSON.

## Release checks

Run the complete local gate before opening a release:

```bash
npm run release:check
```

This checks formatting, lint, fonts, TypeScript, unit tests, the production build, and high-severity production dependencies. The GitHub workflow in `.github/workflows/ci.yml` runs the same blocking checks for pull requests and pushes to `rebrand` or `main`.

## Content operations

Content is authoritative in Firestore. Use the scripts below with the intended environment variables loaded:

```bash
npm run content:backup
npm run content:verify
npm run content:migrate -- --dry-run
npm run content:migrate -- --apply
```

Deploy and verify the required composite indexes before testing public routes:

```bash
npm run firebase:deploy:indexes
npm run firebase:verify
npm run content:verify
```

The exact pre-deploy, backup, smoke-test, and rollback sequence is in [`docs/deployment.md`](docs/deployment.md).

## Privacy and assets

Analytics is first-party, consent-gated, aggregate-only, and bounded to 90 days. It does not persist raw IP addresses or raw event rows. The privacy notice is in [`docs/privacy.md`](docs/privacy.md) and is rendered at `/privacy`.

Admin uploads accept JPEG, PNG, WebP, and PDF files only. Keys are server-owned under `assets/{folder}/...`; replacing or deleting content performs best-effort cleanup of referenced R2 objects. Run `npm run analytics:cleanup` for a dry run, then use `npm run analytics:cleanup -- --apply` only after review; see [`docs/operations.md`](docs/operations.md).

Use `npm run assets:reconcile` to produce a non-destructive report of R2 objects that are not referenced by current Firestore content.

## Documentation

- [`docs/deployment.md`](docs/deployment.md) — preview, production, backup, and rollback runbooks
- [`docs/operations.md`](docs/operations.md) — health checks, indexes, retention, and incident response
- [`docs/privacy.md`](docs/privacy.md) — collected data, purpose, access, and retention
- [`docs/testing.md`](docs/testing.md) — test strategy and launch gates
- [`docs/content-migration.md`](docs/content-migration.md) — Firestore migration and verification
- [`docs/security-audit.md`](docs/security-audit.md) — accepted dependency audit exception

`WEEK1_PROGRESS.md` is retained as a historical project note; it is not the current architecture reference.
