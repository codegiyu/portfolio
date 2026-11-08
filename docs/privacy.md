# Privacy and data handling

This portfolio keeps public telemetry deliberately small. The public `/privacy` page is the visitor-facing summary; this document is the operational detail for maintainers.

## Data flows

| Data                                                              | Purpose                                 | Storage and retention                                           |
| ----------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------- |
| Contact name, email, and message                                  | Reply to a visitor                      | SMTP mailbox policy; not stored in Firestore                    |
| Page-view and CV-download counters                                | Understand aggregate portfolio interest | Firestore `analyticsDaily`, up to 90 days                       |
| Coarse country, browser, device, route, and referrer host buckets | Aggregate dashboard breakdowns          | Same daily aggregate document, up to 90 days                    |
| Raw IP address                                                    | Ephemeral abuse control only            | Never persisted; rate-limit key is one-way hashed and TTL-bound |
| Admin session                                                     | Protect content mutations               | Hashed session record and secure cookie until expiry/revocation |
| Uploaded media                                                    | Serve published portfolio assets        | R2 object plus owner reference until replacement/deletion       |

Analytics requests are ignored until the visitor explicitly opts in. Known crawler user agents are skipped, and client-side route tracking is consent-gated and session-deduplicated. The server never calls an external IP geolocation service.

## Retention and deletion

Run the aggregate cleanup in a controlled environment:

```bash
npm run analytics:cleanup
npm run analytics:cleanup -- --apply
```

The command is a dry run by default. `--apply` performs deletion. The optional `--purge-legacy` flag deletes the former raw `analytics` and `cv-downloads` collections; use it only together with `--apply` after reviewing a backup.

## Maintainer rules

- Do not log message bodies, email addresses, tokens, cookies, raw IPs, or full user-agent strings.
- Do not add persistent visitor identifiers or fingerprinting.
- Do not expose raw Firestore analytics documents through admin APIs.
- Review retention and privacy wording whenever telemetry fields change.
