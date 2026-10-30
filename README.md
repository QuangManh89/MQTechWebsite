# MQTech Production Skills System

A reusable, safety-first agent engineering system for the MQTech Computer Service website, designed for Google Antigravity and adaptable to other agentic coding environments.

## What is included

- `.agents/rules/`: project-wide non-negotiable standards.
- `.agents/skills/`: focused workflows with explicit inputs, outputs, guardrails, and acceptance criteria.
- `docs/`: business context, architecture principles, deployment safety, and quality gates.
- `scripts/`: suggested local verification commands (adapt to the actual package manager and project).
- `SYSTEM_MANIFEST.md`: inventory and rollout plan.

## Important compatibility note

Antigravity's exact discovery behavior can vary by version and workspace configuration. Before relying on this layout, verify the installed version's current official documentation. If Antigravity does not automatically discover `.agents/rules/` or `.agents/skills/`, use its supported project rules/skills setup to register or relocate these files. Do not assume the directory structure alone activates every instruction.

## Safe adoption

1. Back up or commit the existing workspace.
2. Inspect the current project before copying files.
3. Merge these rules and skills into the workspace; do not overwrite existing user work.
4. Review `docs/FLYIO_SAFETY.md` before any hosting changes.
5. Start with `project-planning` and `architecture-design`.
6. Do not delete existing Fly.io resources during planning.
7. Run checks and inspect results before claiming a gate passed.

## Naming

The skill names in this package are project-defined. Some workflows can reference external tools such as Playwright, ESLint, TypeScript, or framework documentation, but this package does not claim that every skill is a pre-existing third-party skill or that installing this package installs those tools.

## Recommended initial rollout

- P0: `project-planning`, `architecture-design`, `security-review`, `local-seo`, `flyio-deployment`
- P1: `nextjs-development`, `database-engineering`, `design-system`, `frontend-quality`
- P2/P3: `backend-api`, `e2e-testing`, `technical-seo`
- P4: `release-audit`, `flyio-deployment`

The `release-audit` and deployment workflows should remain gated by explicit human approval for production-impacting actions.
