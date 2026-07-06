# FiberGuard V1 — Execution Checklist

**Deadline:** July 15, 2026 23:59 UTC · **Target finish:** ~July 12  
**Category:** Gone in 60ms — Category 2: Node, Routing, Cross-Chain, and Diagnostics Infrastructure

Progress tracker only. Product context → [README.md](README.md). Coding conventions → `.cursor/rules/`.

**Execution:** Every task maps to a Phase → section → checkbox here. Work phases **0 → 7** in order; confirm with the user before advancing phases. Decompose large items into ordered sub-steps ([decomposition guide](https://mathsgenie.co.uk/gcse/computer-science/edexcel/decomposition-and-abstraction-to-solve-problems/revision-guides)). See `.cursor/rules/goals-execution.mdc`.

---

## Phase 0 — Pre-flight (Day 1 morning)

- [x] Register on CKBoost (hackathon platform)
- [x] Install Node.js ≥ 20, pnpm ≥ 9
- [x] Install and start Fiber node (FNN) with JSON-RPC on `http://127.0.0.1:8227`
- [x] Verify node responds: `curl` or SDK `getNodeInfo()` — `./scripts/verify-node.sh` (v0.9.0-rc5, pubkey `02e87dde…`)
- [x] Ensure at least one channel in `ChannelReady` (or document demo setup script) — see [docs/demo-setup.md](docs/demo-setup.md) (0 channels now; Options A/B to open)
- [x] Optional: second node or test invoice for payment failure demos — steps in [docs/demo-setup.md](docs/demo-setup.md#optional--second-node-for-failure-demos)

---

## Phase 1 — Monorepo foundation (Day 1)

- [x] Root `package.json` with scripts: `dev`, `build`, `test`, `lint`, `typecheck`
- [x] `pnpm-workspace.yaml` (`apps/*`, `packages/*`)
- [x] `turbo.json` pipeline (`build`, `dev`, `test`, `lint`, `typecheck`)
- [x] Root `tsconfig.base.json` (strict mode)
- [x] Biome shared config (lint + format)
- [x] `.gitignore`, `.env.example`
- [x] Package stubs with `@fiberguard/*` naming:
  - [x] `packages/shared`
  - [x] `packages/fiber-rpc`
  - [x] `packages/diagnostics`
  - [x] `apps/web`
  - [x] `apps/vscode` (stub only — no work yet)
- [x] `pnpm install` and `pnpm build` succeed across workspace

---

## Phase 2 — Core packages (Days 2–3)

### `packages/shared`

- [x] `Diagnostic` type (`code`, `severity`, `title`, `explanation`, `remediation`, `context`)
- [x] Domain types: `ChannelInfo`, `PeerInfo`, `PaymentInfo`, `NodeHealth`
- [x] `bigint` amount formatters (no floating-point for balances)
- [x] Severity helpers / constants

### `packages/fiber-rpc`

- [x] Wrap `@ckb-ccc/fiber` `FiberSDK` (per `.cursor/rules/fiber-rpc.mdc`)
- [x] Typed methods: `getNodeInfo`, `listChannels`, `listPeers`, `parseInvoice`, `getPayment`
- [x] Structured `FiberRpcError` with method name + sanitized context
- [x] Configurable endpoint + timeout; default `http://127.0.0.1:8227`
- [x] Connectivity smoke test script or Vitest integration test (`FIBER_INTEGRATION=1`)

### `packages/diagnostics`

- [x] `assessNodeHealth(nodeInfo, channels, peers)` → health score + `Diagnostic[]`
- [x] `diagnosePaymentFailure(payment, channels?, peers?)` → `Diagnostic[]` from `failedError` patterns
- [x] `canIPay(invoice, channels, peers, nodeInfo)` → `{ probability, blockers: Diagnostic[] }`
- [x] `getRecommendations(health, channels, peers)` → rebalance / peer / capacity hints
- [x] Vitest unit tests with fixture RPC responses (no node required for CI)
- [x] At least one integration test against live node (documented, skippable in CI)

---

## Phase 3 — Web app scaffold (Day 5 morning)

- [x] Next.js App Router in `apps/web`
- [x] shadcn/ui init — components in `apps/web/components/ui/`
- [x] Install core shadcn components: `Card`, `Badge`, `Table`, `Tabs`, `Alert`, `Skeleton`, `Button`, `Input`, `Dialog`
- [x] App layout: sidebar nav (Dashboard, Channels, Peers, Payments, Can I Pay?)
- [x] `FIBER_RPC_URL` env var; never call Fiber RPC from browser directly
- [x] API route handlers (or Server Actions) proxying `@fiberguard/fiber-rpc`

---

## Phase 4 — Web dashboard features (Days 5–8)

### Dashboard (health at a glance)

- [x] Health summary card: green/yellow/red from `assessNodeHealth`
- [x] Node info: version, pubkey, peer count, channel count
- [x] Top diagnostics + recommendations panel
- [x] Node unreachable state: actionable copy ("Is your Fiber node running on port 8227?")

### Channels

- [x] Channel table: ID, state, local/remote balance, capacity
- [x] Liquidity bar or ratio per channel
- [x] Highlight non-`ChannelReady` channels with warning badges

### Peers

- [x] Peer list with connection status
- [x] Empty peer state with remediation hint

### Payments + diagnostics (differentiator)

- [x] Payment list (recent; status badges)
- [x] Payment detail view with `diagnosePaymentFailure` output
- [x] Never show raw `failedError` alone — always paired with `Diagnostic`

### Can I Pay? (differentiator)

- [x] Input for invoice string
- [x] `parseInvoice` preview (amount, currency, description)
- [x] Success probability + blocker list from `canIPay`
- [x] Clear CTA copy: what to fix before `sendPayment`

### UX polish

- [x] Loading skeletons on lists
- [x] Stale-data indicator if poll interval exceeded
- [x] Responsive layout; dashboard readable in < 10 seconds

---

## Phase 5 — VS Code extension (Days 9–10)

- [x] Extension scaffold: `package.json` manifest, esbuild bundle, `pnpm --filter fiberguard-vscode dev` (package renamed — VS Code manifests cannot use scoped names)
- [x] Setting: `fiberguard.nodeUrl` (default `http://127.0.0.1:8227`)
- [x] Activity bar icon + sidebar tree view (channels / peers)
- [x] Commands:
  - [x] `FiberGuard: Node Status`
  - [x] `FiberGuard: Can I Pay?` (input box for invoice)
  - [x] `FiberGuard: Diagnose Payment` (payment hash input)
- [x] Output channel `FiberGuard` for diagnostic text (same copy as web)
- [x] `showErrorMessage` / progress for long RPC calls
- [x] Reuse `@fiberguard/diagnostics` — no duplicated analysis logic
- [x] Native VS Code UI only (Codicons, theme colors — no shadcn)

---

## Phase 6 — Integration and hardening (Day 11)

- [ ] Full demo script written and rehearsed (health → failed payment → can-i-pay)
- [ ] `pnpm build` clean on all packages
- [ ] `pnpm test` passes (diagnostics unit tests)
- [x] README updated: real commands, env vars, demo prerequisites
- [x] Document **working vs simulated vs future** explicitly
- [ ] Fix any RPC method name mismatches found against live Fiber version

---

## Phase 7 — Hackathon submission (Day 12)

- [x] Project summary + **Category 2** stated in README
- [ ] Team members listed
- [ ] Open-source repo public and runnable
- [ ] Demo video recorded (3–5 min): problem → dashboard → payment diagnostic → can-i-pay → VS Code
- [x] Runnable demo instructions in README (hosted Vercel URL + optional local node)
- [x] Technical breakdown (architecture diagram, package responsibilities)
- [x] Fiber infrastructure gap explanation (why FiberGuard vs Dashboard/Studio)
- [x] Future roadmap section
- [x] License chosen (MIT — see [LICENSE](LICENSE))
- [ ] CKBoost submission form completed
- [ ] AI allowance claim filed if applicable ($20 rebate)