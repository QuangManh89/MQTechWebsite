---
name: security-review
description: Threat-model a feature or release and verify practical security controls.
---

# Security Review Skill

## Workflow
1. Identify assets, trust boundaries, actors, entry points and likely abuse cases.
2. Review authentication, authorization, input validation, output encoding, data access and secrets.
3. Test object-level access controls and privilege escalation paths.
4. Review rate limits, spam controls, session/cookie settings, CSRF, file upload and dependency risks as applicable.
5. Check error messages and logs for information leakage.
6. Verify security-relevant tests and report residual risk.
7. Prioritize findings by severity, exploitability and impact; include reproducible evidence.

## MQTech threat focus
- Spam or automated flooding of public request forms.
- Unauthorized access to customer phone numbers, addresses and repair notes.
- Admin account compromise.
- IDOR through request IDs or lookup codes.
- Secrets accidentally committed or logged.
- Unsafe data migration or accidental destruction of existing Fly.io resources.

## Output format
Finding, severity, affected surface, evidence, impact, recommended fix, verification method, residual risk.

Do not claim the application is secure merely because no obvious issue was noticed.
