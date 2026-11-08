# Operations

## Health and monitoring

`GET /api/health` is a no-secret liveness check and returns `{ "status": "ok" }` with `Cache-Control: no-store`. Configure an external synthetic check for that endpoint and `/`.

Run `npm run config:verify` in the deployment environment before release. It validates required configuration shape without printing credential values.

Runtime logs should contain stable event codes and operation names only. Contact failures must not include message content or addresses; authentication failures must not include tokens or emails; analytics and rate-limit diagnostics must not include raw IPs.

## Analytics retention

Aggregate analytics is stored in `analyticsDaily` and is bounded to 90 days by the cleanup script:

```bash
npm run analytics:cleanup
npm run analytics:cleanup -- --apply
```

Run it from a scheduled, authenticated maintenance environment after reviewing the default dry run. Take a backup before using `--purge-legacy --apply`.

## Asset reconciliation

Every new upload uses a server-owned key and the owning content reference should retain the public URL. Replacement and deletion invoke best-effort R2 cleanup. If an R2 deletion fails, preserve the failure code in logs and reconcile manually; do not delete all objects by prefix.

Run the reconciliation report from an environment with Firestore and R2 access:

```bash
npm run assets:reconcile
```

The command lists potential orphan keys and never deletes objects. Review each candidate against a backup and published content before removing it manually.

## Incident priorities

- P0: public routes 5xx, unsafe public media, or authentication outage — freeze writes and roll back/fix forward immediately.
- P1: contact delivery outage, broken metadata/indexing policy, or cache invalidation failure — deploy a targeted fix and verify the affected journey.
- P2: dashboard/retention/reporting issue — preserve logs, run the dry-run cleanup, and schedule correction.
