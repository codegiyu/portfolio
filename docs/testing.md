# Testing and launch gates

## Local blocking checks

```bash
npm run format:check
npm run lint
npm run fonts:check
npm run typecheck
npm test
npm run build:check
npm run audit:prod
```

The same checks run in `.github/workflows/ci.yml`. The production audit currently permits only
the documented moderate transitive exception; high and critical production findings fail the gate.

## Required browser validation before launch

Run an isolated preview with seeded non-production data and verify:

- public navigation from home to project and blog detail pages;
- mobile menu, keyboard focus, filter selected state, reduced motion, loading, error, and 404 states;
- contact validation, success, network failure, duplicate submission, and honeypot behavior;
- consent before analytics and aggregate-only dashboard output;
- admin auth, CRUD conflict handling, upload signature rejection, replacement, and deletion;
- preview `noindex`, route canonicals, OG metadata, sitemap, RSS, and security headers;
- `/api/health` and the deployment smoke-test sequence.

Use a Firebase emulator or dedicated Firebase project. Never run browser tests with production collections or credentials.

Run the Playwright suite only with an isolated preview URL:

```bash
E2E_BASE_URL=https://preview.example.com npm run test:e2e
```

Run the mobile Lighthouse gate against the same isolated preview:

```bash
LIGHTHOUSE_URL=https://preview.example.com npm run lighthouse:check
```

The Lighthouse gate enforces 90+ performance, accessibility, and SEO scores,
plus LCP ≤ 2.5s and CLS ≤ 0.10. It writes reports under `output/lighthouse/`.
