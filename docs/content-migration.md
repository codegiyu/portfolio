# Content migration and cutover

Phase 2 treats Firestore as the production authority for projects, blog posts, and editable settings. The files under `content/` are migration inputs and local fixtures only.

## Commands

Create a backup before any production mutation:

```bash
npm run content:backup -- backups/phase-2-before-migration
```

Validate without writing:

```bash
npm run content:migrate -- --dry-run
```

Apply only after reviewing the dry-run report:

```bash
npm run content:migrate -- --apply
npm run content:verify
```

Use `--force` only when an identified Firestore conflict has been reviewed and should intentionally be replaced by the local source.

## Cutover

1. Deploy the migration tooling and write-freeze support.
2. Run the dry run and resolve invalid input or conflicts.
3. Set `CONTENT_WRITES_FROZEN=true`.
4. Export Firestore.
5. Apply the migration and verify counts, slugs, status, timestamps, and schema versions.
6. Deploy the Firestore-authoritative application.
7. Smoke-test public and admin reads and writes.
8. Remove the freeze by setting `CONTENT_WRITES_FROZEN=false`.

The freeze is a temporary operational guard, not a content fallback. Production never falls back to local JSON or MDX when Firestore is unavailable.

## Rollback

Freeze writes again and export the current Firestore state before rollback. Deploy the previous release while writes remain frozen. Preserve both exports so the next attempt can restore or reconcile any post-cutover changes.
