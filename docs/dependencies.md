# FiberGuard — Dependency Catalog

Shared dependency versions are defined once in [`pnpm-workspace.yaml`](../pnpm-workspace.yaml) under `catalog:`. Workspace packages reference them with `"catalog:"` instead of repeating version ranges.

## Catalog (single source of truth)

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | `^5.8.3` | Strict TS across all workspaces |
| `tsup` | `^8.5.0` | ESM build + `.d.ts` for packages/apps |
| `vitest` | `^3.2.4` | Unit/integration tests |
| `turbo` | `^2.5.4` | Monorepo task orchestration |
| `@biomejs/biome` | `^2.0.0` | Lint + format (root only) |
| `@ckb-ccc/fiber` | `^0.0.0-canary-20260505020844` | Fiber SDK (`fiber-rpc` only) |

## Where each dependency is declared

### Root (`fiberguard`)

| Dependency | Role |
|------------|------|
| `@biomejs/biome` | `pnpm lint`, `pnpm format` for entire repo |
| `turbo` | `pnpm build`, `pnpm test`, `pnpm typecheck` |
| `typescript` | Available at root; version pinned via catalog |
| `vitest` | Available at root; version pinned via catalog |

### All packages + app stubs (`shared`, `fiber-rpc`, `diagnostics`, `web`, `vscode`)

| Dependency | Role |
|------------|------|
| `typescript` | `tsc --noEmit` per workspace |
| `tsup` | `pnpm build` bundle to `dist/` |
| `vitest` | `pnpm test` per workspace |

> Each workspace still **declares** tools it uses (so `tsc`/`vitest`/`tsup` resolve under pnpm), but **versions** come from the catalog — no drift across `^5.8.3` copies.

### Workspace-only runtime deps

| Package | Used in | Type |
|---------|---------|------|
| `@fiberguard/shared` | `fiber-rpc`, `diagnostics`, `web`, `vscode` | `workspace:*` |
| `@fiberguard/fiber-rpc` | `diagnostics`, `web`, `vscode` | `workspace:*` |
| `@fiberguard/diagnostics` | `web`, `vscode` | `workspace:*` |
| `@ckb-ccc/fiber` | `fiber-rpc` | `catalog:` |

## Adding a new shared dependency

1. Add the version to `catalog:` in `pnpm-workspace.yaml`
2. Reference `"catalog:"` in each workspace `package.json` that needs it
3. Run `pnpm install` from repo root

## Intentionally not duplicated

| Tool | Location | Why |
|------|----------|-----|
| `@biomejs/biome` | Root only | Single lint/format config in `biome.json` |
| `turbo` | Root only | Orchestrates all workspace tasks |
| `next` | Not yet | Phase 3 — `apps/web` only when scaffolded |
| `@types/vscode` | Not yet | Phase 5 — `apps/vscode` only |
