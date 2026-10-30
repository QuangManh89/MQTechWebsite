---
name: e2e-testing
description: Design reliable end-to-end tests for high-value user journeys with Playwright or an equivalent approved tool.
---

# E2E Testing Skill

## Workflow
1. Identify critical journeys and business risks.
2. Use stable role/name/test selectors rather than fragile styling selectors.
3. Prepare isolated test data and cleanup strategy.
4. Cover success, validation failure, authorization failure and important edge cases.
5. Avoid depending on real customer data, external messaging, or production services.
6. Run tests against a controlled environment and inspect traces/screenshots on failure.
7. Report flaky tests honestly and fix root causes rather than adding arbitrary sleeps.

## MQTech critical flows
- Customer submits a valid repair request.
- Invalid or oversized inputs are rejected.
- Spam/rate-limit behavior is handled.
- Public request submission is clearly labeled as awaiting confirmation.
- Unauthenticated visitor cannot access admin routes or APIs.
- Admin can filter a request and update status.
- Unauthorized user cannot read or mutate another request.
- Appointment confirmation creates a clear status/history record.
- Responsive request form works on mobile viewport.

## Do not
- Run destructive test cleanup against production.
- Use real customer phone numbers or addresses in test fixtures.
