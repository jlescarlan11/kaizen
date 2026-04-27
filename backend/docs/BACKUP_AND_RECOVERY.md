# Backup and Recovery

## Backup strategy

Kaizen's primary database is PostgreSQL hosted on Render.  Render performs
**daily automated backups** of every managed Postgres instance and retains
them for **7 days** on the free/starter tier (longer on paid plans).  These
snapshots are stored in Render's managed storage and can be restored through
the dashboard in a few clicks.

> **Minimum viable, not production-grade.** Seven days of automated backups
> is the absolute floor.  Before handling real user data, add an off-site
> copy (see below) so a single platform incident cannot wipe all recovery
> points simultaneously.

## Off-site copy (recommended)

Schedule a nightly `pg_dump` that ships a compressed archive to an S3-compatible
bucket (AWS S3, Backblaze B2, Cloudflare R2, etc.).  Example cron line for a
Linux/container environment:

```bash
# /etc/cron.d/kaizen-pg-backup — runs at 02:00 UTC every day
0 2 * * *  app  pg_dump "$DATABASE_URL" \
    | gzip \
    | aws s3 cp - "s3://kaizen-backups/daily/kaizen-$(date +\%Y-\%m-\%d).sql.gz" \
    --storage-class STANDARD_IA
```

Replace `aws s3 cp` with the equivalent CLI for your chosen provider.
Retain at least 30 daily snapshots and 12 monthly snapshots (grandfather-
father-son rotation is a safe starting point).

## Restore procedure

### From the Render dashboard (primary path)

1. Open the Render dashboard → **Databases** → select the Kaizen database.
2. Click **Backups** in the left nav.
3. Locate the desired snapshot and click **Restore**.
4. Render provisions a new database from the snapshot; update the
   `DATABASE_URL` environment variable in the Kaizen web service to point to
   the new instance, then trigger a redeploy.

**Estimated time-to-recover:** ~5 minutes for the database restore, plus
~3–5 minutes for the application redeploy.  Total RTO: ~10 minutes under
normal conditions.

### From an off-site dump

```bash
# Decompress and pipe directly into psql
aws s3 cp "s3://kaizen-backups/daily/kaizen-YYYY-MM-DD.sql.gz" - \
    | gunzip \
    | psql "$TARGET_DATABASE_URL"
```

Verify row counts on key tables (`users`, `budgets`, `transactions`) after
restore.

## DR drill cadence

Schedule a **yearly disaster-recovery drill**:

1. Restore the most recent automated backup to an isolated staging database.
2. Point the staging application environment at the restored database.
3. Run the smoke-test suite (auth flow, budget CRUD, transaction CRUD).
4. Document outcomes and any gaps in this file.

## Migration safety

Flyway migrations in this project are **forward-only** (see
`CODING_STANDARDS.md` §2.10).  For any destructive migration
(`DROP COLUMN`, `DROP TABLE`, `TRUNCATE`):

1. Capture a table-level dump **before** applying the migration:

   ```bash
   pg_dump --table=<affected_table> "$DATABASE_URL" \
       | gzip > /tmp/<affected_table>-pre-migration.sql.gz
   ```

2. Apply the migration via the normal deployment pipeline.
3. Keep the pre-migration dump for at least 30 days in the off-site bucket.
