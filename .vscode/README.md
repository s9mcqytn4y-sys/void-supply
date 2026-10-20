# VOID Supply | VS Code Workspace Operation
Audit reference: ../docs/audit-admin-architecture-2026-10-20.md.

Existing workspace settings, snippets and MCP definitions were not automatically rewritten. Agent must inspect .vscode/settings.json, mcp.json, tasks.json, launch.json and extensions.json before changing them.

- Editor/linter settings are developer ergonomics, never a substitute for project CI.
- Treat .vscode/mcp.json as sensitive configuration; do not put API keys, access tokens, database URLs or personal Gmail app passwords in tracked files. Use local environment variables or secure secret stores.
- Run npm ci, npm run typecheck, npm run lint, npm test, npm run build, npm run test:e2e as relevant.
- Next.js is production runtime; Vite config is used for Vitest. Do not change bundlers to fix unrelated issues.
- Link documentation with repository-relative paths rather than local file:/// URLs.
- Document any workspace changes in the PR and keep local personal preferences out of committed shared config.
