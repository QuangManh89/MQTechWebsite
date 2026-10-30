# Quality Gates

A gate is passed only when its check ran successfully and the result was inspected.

## Baseline gates
- Formatting/linting passes.
- TypeScript type checking passes.
- Unit/integration tests relevant to the change pass.
- Production build passes.
- Critical user flows have automated or documented verification.
- No secrets are committed.
- No known high-severity security issue is ignored without an explicit risk decision.
- Accessibility and responsive behavior are reviewed for UI changes.
- SEO metadata, canonical URLs, robots behavior, sitemap, and structured data are checked when relevant.

## Reporting
For each gate report:
- Exact command or procedure.
- Exit status/result.
- What was and was not covered.
- Any skipped check and why.
- Known risk remaining.

Do not hide failing or flaky checks. Do not change tests merely to make them pass without validating the expected behavior.
