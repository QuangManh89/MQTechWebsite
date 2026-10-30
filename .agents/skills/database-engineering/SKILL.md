---
name: database-engineering
description: Design reliable relational data models, migrations, indexes, and recovery practices.
---

# Database Engineering Skill

## Workflow
1. Review actual database, ORM and migration state before changing schema.
2. Model entities from current workflows, not speculative features.
3. Define primary/foreign keys, unique constraints, nullability, indexes and deletion behavior.
4. Consider transaction boundaries and concurrent updates.
5. Plan additive and reversible migrations where practical.
6. Identify backup, restore, retention and privacy requirements.
7. Test migrations against representative data and inspect generated SQL where appropriate.

## MQTech candidate entities
- service_categories / services, if content needs database administration.
- service_requests.
- appointments only if their lifecycle differs materially from the request lifecycle.
- request_status_history.
- admin_users.
- audit_logs only for meaningful administrative/security events.

Do not require all candidate tables. Choose the smallest model that supports the approved workflows.

## Safety
- Never reset or drop a production database as a convenience.
- Do not place secrets or device passwords in records.
- Do not use sequential IDs as public lookup tokens.
- Document how backups are restored, not just how they are created.
