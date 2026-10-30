---
name: release-audit
description: Perform an evidence-based release readiness audit before production release.
---

# Release Audit Skill

## Workflow
1. Confirm release scope, environment, commit/revision and acceptance criteria.
2. Review changes, dependencies, migrations, secrets handling and configuration.
3. Run lint, type check, unit/integration/E2E tests and production build where available.
4. Review security, accessibility, SEO, performance, error handling and observability.
5. Verify backup/restore and rollback plans for production changes.
6. Run a production smoke-test plan after deployment.
7. Classify findings as blocker, high, medium, low, or accepted risk.
8. Produce a go/no-go recommendation with evidence.

## MQTech release blockers
- Public request submission fails or loses valid requests.
- Unauthenticated users can access admin data/actions.
- Customer private data is exposed through public IDs or lookup.
- Production secrets are committed or exposed.
- Production database migration has no tested recovery plan where data loss is possible.
- Domain/canonical configuration is misleading or staging is indexable unintentionally.
- Critical checks are claimed passed without execution evidence.
- Existing Fly.io resources are at risk without explicit approval and a verified recovery plan.

## Output
- Scope and revision.
- Checks run and results.
- Findings and severity.
- Known limitations.
- Go/no-go recommendation.
- Post-release monitoring checklist.
