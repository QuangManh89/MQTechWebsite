# Suggested verification commands

Adapt these commands to the package manager and scripts actually present in `package.json`. Do not create fake passing checks or assume scripts exist.

Typical checks for a Next.js/TypeScript project may include:
- `npm run lint`
- `npx tsc --noEmit`
- `npm test`
- `npx playwright test`
- `npm run build`

Use the lockfile's package manager (npm, pnpm, yarn, or bun) rather than mixing package managers.
