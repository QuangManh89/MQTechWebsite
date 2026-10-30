---
name: flyio-deployment
description: Prepare and operate a safe, observable Fly.io deployment with verified rollback and data recovery.
---

# Fly.io Deployment Skill

## P0: inventory only
Before changing an existing Fly.io environment, inventory:
- App names and organization.
- Machines and deployment configuration.
- Volumes and their attachment state.
- Database type, cluster, relationships and backups.
- Secrets names (never values), environment variables and network configuration.
- Custom domains, certificates and DNS.
- CI/CD and source repository.
- Costs, retention requirements and recovery options.

Do not destroy, reset, detach, or recreate anything during inventory.

## Before production deployment
1. Verify the correct Fly.io organization and target app.
2. Verify the domain is owned and DNS plan is understood.
3. Confirm database backup and restoration procedure.
4. Confirm required secrets are present without printing values.
5. Build and test the exact release artifact.
6. Define health checks, logs, monitoring, rollback, and post-deploy smoke tests.
7. Obtain explicit approval for production-impacting actions.

## Destructive-action gate
Before any deletion or replacement, provide:
- Exact resources affected.
- Data and downtime impact.
- Dependency inventory.
- Backup/restore evidence.
- Rollback or recovery plan.
- Exact command(s) for approval.

Never execute destructive commands without explicit approval tied to the named resources and stated consequences.

## Deployment notes
- Do not assume every Fly.io database option has the same lifecycle or backup guarantees.
- Do not assume an app deletion automatically deletes or preserves every related resource.
- Verify current official Fly.io documentation for the exact resource type and CLI version.
- Keep secrets out of source control and reports.
