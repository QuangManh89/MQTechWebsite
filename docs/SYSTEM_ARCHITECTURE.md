# System Architecture Principles

## Initial shape
Prefer one Next.js application with server-side business logic and a PostgreSQL database unless verified requirements justify another design.

## Boundaries
- Public UI: services, contact, request form, informational content.
- Server application: validation, request creation, admin authentication/authorization, status transitions.
- Persistence: relational data, migrations, backups.
- Operations: logs, health checks, deployment configuration, secrets management.

## Key domain rules
- A submitted service request is not a confirmed appointment.
- Public reference codes must be random/unpredictable.
- Do not expose private request details by code alone.
- Do not collect customer computer passwords.
- Keep customer accounts out of scope initially.
- Keep admin authorization server-side.

## Architecture decisions to document
- ORM and migration strategy.
- Session/authentication method.
- Request and appointment state model.
- Spam/rate-limiting strategy.
- Whether service catalog is database-managed or code-managed.
- Logging/monitoring approach.
- Backup, restore and retention policy.
