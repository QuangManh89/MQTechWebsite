---
name: project-planning
description: Turn a business request into scoped, testable requirements and phased work. Use before implementation or when scope changes.
---

# Project Planning Skill

## Inputs
- User request and approved project context.
- Current repository state.
- Existing docs, constraints, and acceptance criteria.

## Workflow
1. Inspect repository status and relevant files before proposing edits.
2. Restate the objective, user roles, and observable outcomes.
3. Separate requirements into must-have, should-have, later, and explicitly out of scope.
4. Identify dependencies, risks, unknowns, and assumptions.
5. Define acceptance criteria that can be tested or inspected.
6. Break work into small phases with clear deliverables and approval gates.
7. Ask only questions that block a safe or materially correct decision; otherwise mark assumptions.

## MQTech context
- Public website for a local computer-repair service.
- Customers submit repair/appointment requests.
- Staff manually confirm appointments by phone or Zalo.
- One admin initially; possible staff roles later.
- Existing Fly.io resources must be inventoried before destructive changes.

## Outputs
- Requirements summary.
- Scope and exclusions.
- Acceptance criteria.
- Risk/decision log.
- Phased plan.

## Do not
- Start broad implementation during a planning-only phase.
- Treat a submitted request as a confirmed appointment.
- Invent business details.
- Claim unverified external state.
