---
name: architecture-design
description: Design a maintainable application architecture based on verified requirements and constraints.
---

# Architecture Design Skill

## Workflow
1. Inspect current code, dependencies, runtime, deployment and project conventions.
2. Map user journeys to application components and data boundaries.
3. Compare simple viable options; document why the chosen approach fits.
4. Define server/client responsibilities, data access boundaries, authentication, validation, error handling and observability.
5. Identify failure modes, privacy risks, migration implications and operational costs.
6. Document trade-offs and decisions before implementation.

## MQTech defaults
- Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL are preferences, not excuses to ignore an existing approved architecture.
- Keep one deployable application unless evidence supports splitting it.
- Separate public request intake from authenticated admin operations.
- Use an unpredictable public request reference code.
- Avoid unnecessary customer accounts and full CRM features.

## Outputs
- Component boundaries.
- Data flow and trust boundaries.
- Architecture decisions with alternatives.
- Risks and acceptance criteria.

## Quality bar
A new abstraction or service must solve a documented current problem or a credible near-term requirement.
