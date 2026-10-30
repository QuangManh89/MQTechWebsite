# Fly.io Safety Checklist

The user has an existing application on Fly.io and wants to rebuild from scratch. This does not authorize deletion of unspecified resources.

## Inventory before change
- [ ] Confirm organization and exact app name.
- [ ] Identify Machines and deployment method.
- [ ] Identify volumes, attachments and data stored on them.
- [ ] Identify database type and whether it is managed or app-hosted.
- [ ] Identify backups and test a restore where feasible.
- [ ] Record secrets names only; never copy secret values into this document.
- [ ] Identify domains, certificates, DNS and dependent services.
- [ ] Identify repository, CI/CD and current deployment process.
- [ ] Estimate downtime and recurring cost implications.

## Before replacing
- [ ] New app and database design reviewed.
- [ ] Backup verified and recovery steps documented.
- [ ] Environment variables and secrets re-created securely.
- [ ] Domain ownership and DNS changes confirmed.
- [ ] Health checks and smoke tests prepared.
- [ ] Rollback plan reviewed.
- [ ] User explicitly approved the exact destructive actions.

## Never
- Delete resources just because the app is described as old.
- Assume app, database, volume, and domain lifecycles are identical.
- Print secrets in logs or reports.
- Run destructive commands during P0.
