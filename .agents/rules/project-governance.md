# Project Governance Rules

## Scope and approvals
- Work only within the user's requested scope and the current approved phase.
- During P0, inspect, document, and propose. Do not implement the full website.
- Do not advance to the next phase when an explicit approval gate is required.
- Record assumptions and unresolved questions instead of inventing business facts.
- Prefer small, reviewable changes with clear acceptance criteria.

## Truthfulness
- Never claim a test, build, scan, deployment, or audit passed unless it was actually run and its output inspected.
- Distinguish verified facts, assumptions, recommendations, and unknowns.
- Do not fabricate domain availability, business address, phone number, opening hours, reviews, prices, certifications, or customer testimonials.

## Destructive operations
- Never delete, destroy, reset, overwrite, or migrate production data/resources without explicit, specific user approval after presenting scope, impact, and recovery options.
- Never execute destructive Fly.io commands during P0.
- Before destructive changes, inventory dependencies, verify backups, and document a rollback or recovery plan.
- Do not print or expose secret values in logs, reports, or terminal output.

## Dependency hygiene
- Inspect the existing project and package manager before changing files or dependencies.
- Avoid unnecessary dependencies and broad dependency upgrades.
- Check official documentation and compatibility before adopting versions or APIs.
- Review third-party skills and scripts before trusting them.

## Completion reports
For meaningful work, report files changed, decisions made, checks executed with results, known limitations, and next actions.
