# Security and Privacy Rules

- Never store a customer's computer login password, Windows password, email password, or other device credentials in the public form or ordinary service-request records.
- Collect only data necessary to respond to and fulfil the service request.
- Validate all client input again on the server. Use schema validation and sensible length limits.
- Enforce admin authentication and authorization on the server for every protected action.
- Use secure session handling, rate limiting, abuse prevention, safe error messages, and appropriate CSRF protections for the chosen architecture.
- Parameterize database operations through a reputable ORM/query API; never build SQL from untrusted strings.
- Keep secrets in the hosting platform's secret store or local ignored environment files. Never commit secrets.
- Avoid logging full phone numbers, addresses, tokens, session IDs, or sensitive request details unless necessary and protected.
- Use secure cookies and HTTPS in production.
- Prevent IDOR: possession of a predictable request ID/code must not reveal private customer data.
- Maintain dependencies and review security advisories.
- Document data retention, deletion, backup, and restore procedures.
- Do not claim compliance with a law or security standard without evidence and appropriate review.
