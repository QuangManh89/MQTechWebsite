# Architecture Rules

- Use the simplest architecture that satisfies current requirements.
- Preferred stack: Next.js App Router, TypeScript strict mode, Tailwind CSS, PostgreSQL.
- Confirm the actual repository state before assuming framework versions, ORM, package manager, or deployment topology.
- Keep UI, domain logic, persistence, and infrastructure concerns separated enough to test independently.
- Validate inputs at trust boundaries and enforce authorization on the server.
- Use typed domain models and consistent error handling.
- Do not add microservices, queues, Redis, Kubernetes, or extra infrastructure without a documented need.
- Do not create database tables or abstractions solely for hypothetical future features.
- Keep admin access separate from public customer flows.
- Treat appointment request submission and appointment confirmation as different states.
- Generate unpredictable public request reference codes; never expose sequential database IDs.
- Design for future staff roles without building a complex role-management UI prematurely.
