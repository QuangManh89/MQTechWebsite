---
name: nextjs-development
description: Implement and maintain Next.js App Router applications using current framework conventions.
---

# Next.js Development Skill

## Workflow
1. Inspect installed Next.js version and official docs for version-specific behavior.
2. Identify server and client component boundaries; default to server components unless browser interactivity requires client code.
3. Keep secrets, privileged data access and authorization on the server.
4. Use route handlers/server actions according to the project's chosen API pattern; avoid duplicate pathways without need.
5. Add explicit loading, error, not-found and form submission states where relevant.
6. Use metadata APIs and framework-supported image/font handling appropriately.
7. Verify build, lint, types and relevant tests after changes.

## Rules
- Do not expose server secrets through public environment variables.
- Do not assume caching behavior; configure and test it based on data freshness and framework version.
- Avoid fetching the same data redundantly.
- Validate mutations server-side and protect admin endpoints.
- Follow official docs for the installed version, not stale examples copied from unrelated projects.

## Outputs
- Small focused changes.
- Tests or verification notes.
- Updated documentation for non-obvious decisions.
