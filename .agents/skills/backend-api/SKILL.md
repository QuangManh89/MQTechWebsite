---
name: backend-api
description: Design and implement secure, validated server endpoints for the product's business workflows.
---

# Backend API Skill

## Workflow
1. Define endpoint purpose, caller, authorization, input schema, response schema and error semantics.
2. Validate input on the server and impose length/size limits.
3. Authenticate and authorize before exposing protected data or mutating state.
4. Use a consistent response/error model without leaking internal details.
5. Consider rate limits, spam, replay, concurrency, idempotency and abuse cases.
6. Add tests for valid, invalid, unauthorized and boundary inputs.
7. Document behavior and any compatibility implications.

## MQTech request intake
- Public request submission must be rate-limited and validated.
- Do not trust client-supplied price, status, staff identity or confirmation flags.
- Appointment requests are not confirmed until staff explicitly confirms them.
- Never accept device passwords or email credentials in the request payload.
- Avoid revealing whether a private customer record exists through error differences.
- Public reference codes must be unpredictable and must not act as the only authorization for private details.

## Outputs
Endpoint contract, validation schema, authorization policy, tests, operational notes.
