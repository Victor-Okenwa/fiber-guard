# FiberGuard V1 — Execution Checklist

**Deadline:** July 15, 2026 23:59 UTC · **Target finish:** ~July 12  
**Category:** Gone in 60ms — Category 2: Node, Routing, Cross-Chain, and Diagnostics Infrastructure

Progress tracker only. Product context → [README.md](README.md). Coding conventions → `.cursor/rules/`.

---

## Phase 0 — Pre-flight (Day 1 morning)

- [x] Register on CKBoost (hackathon platform)
- [x] Install Node.js ≥ 20, pnpm ≥ 9
- [x] Install and start Fiber node (FNN) with JSON-RPC on `http://127.0.0.1:8227`
- [ ] Verify node responds: `curl` or SDK `getNodeInfo()`
- [ ] Ensure at least one channel in `ChannelReady` (or document demo setup script)
- [ ] Optional: second node or test invoice for payment failure demos

---

## Phase 1 — Monorepo foundation (Day 1)

- [ ] Root `package.json` with scripts: `dev`, `build`, `test`, `lint`, `typecheck`
- [ ] `pnpm-workspace.yaml` (`apps/*`, `packages/*`)
- [ ] `turbo.json` pipeline (`build`, `dev`, `test`, `lint`, `typecheck`)
- [ ] Root `tsconfig.base.json` (strict mode)
- [ ] ESLint + Prettier shared config
- [ ] `.gitignore`, `.env.example`
- [ ] Package stubs with `@fiberguard/*` naming:
  - [ ] `packages/shared`
  - [ ] `packages/fiber-rpc`
  - [ ] `packages/diagnostics`
  - [ ] `apps/web`
  - [ ] `apps/vscode` (stub only — no work yet)
- [ ] `pnpm install` and `pnpm build` succeed across workspace

---

## Phase 2 — Core packages (Days 2–3)

### `packages/shared`

- [ ] `Diagnostic` type (`code`, `severity`, `title`, `explanation`, `remediation`, `context`)
- [ ] Domain types: `ChannelInfo`, `PeerInfo`, `PaymentInfo`, `NodeHealth`
- [ ] `bigint` amount formatters (no floating-point for balances)
- [ ] Severity helpers / constants

### `packages/fiber-rpc`

- [ ] Wrap `@ckb-ccc/fiber` `FiberSDK` (per `.cursor/rules/fiber-rpc.mdc`)
- [ ] Typed methods: `getNodeInfo`, `listChannels`, `listPeers`, `parseInvoice`, `getPayment`
- [ ] Structured `FiberRpcError` with method name + sanitized context
- [ ] Configurable endpoint + timeout; default `http://127.0.0.1:8227`
- [ ] Connectivity smoke test script or Vitest integration test

### `packages/diagnostics`

- [ ] `assessNodeHealth(nodeInfo, channels, peers)` → health score + `Diagnostic[]`
- [ ] `diagnosePaymentFailure(payment, channels?, peers?)` → `Diagnostic[]` from `failedError` patterns
- [ ] `canIPay(invoice, channels, peers, nodeInfo)` → `{ probability, blockers: Diagnostic[] }`
- [ ] `getRecommendations(health, channels, peers)` → rebalance / peer / capacity hints
- [ ] Vitest unit tests with fixture RPC responses (no node required for CI)
- [ ] At least one integration test against live node (documented, skippable in CI)

---

## Phase 3 — Web app scaffold (Day 5 morning)

- [ ] Next.js App Router in `apps/web`
- [ ] shadcn/ui init — components in `apps/web/components/ui/`
- [ ] Install core shadcn components: `Card`, `Badge`, `Table`, `Tabs`, `Alert`, `Skeleton`, `Button`, `Input`, `Dialog`
- [ ] App layout: sidebar nav (Dashboard, Channels, Peers, Payments, Can I Pay?)
- [ ] `FIBER_RPC_URL` env var; never call Fiber RPC from browser directly
- [ ] API route handlers (or Server Actions) proxying `@fiberguard/fiber-rpc`

---

## Phase 4 — Web dashboard features (Days 5–8)

### Dashboard (health at a glance)

- [ ] Health summary card: green/yellow/red from `assessNodeHealth`
- [ ] Node info: version, pubkey, peer count, channel count
- [ ] Top diagnostics + recommendations panel
- [ ] Node unreachable state: actionable copy ("Is your Fiber node running on port 8227?")

### Channels

- [ ] Channel table: ID, state, local/remote balance, capacity
- [ ] Liquidity bar or ratio per channel
- [ ] Highlight non-`ChannelReady` channels with warning badges

### Peers

- [ ] Peer list with connection status
- [ ] Empty peer state with remediation hint

### Payments + diagnostics (differentiator)

- [ ] Payment list (recent; status badges)
- [ ] Payment detail view with `diagnosePaymentFailure` output
- [ ] Never show raw `failedError` alone — always paired with `Diagnostic`

### Can I Pay? (differentiator)

- [ ] Input for invoice string
- [ ] `parseInvoice` preview (amount, currency, description)
- [ ] Success probability + blocker list from `canIPay`
- [ ] Clear CTA copy: what to fix before `sendPayment`

### UX polish

- [ ] Loading skeletons on lists
- [ ] Stale-data indicator if poll interval exceeded
- [ ] Responsive layout; dashboard readable in < 10 seconds

---

## Phase 5 — VS Code extension (Days 9–10)

- [ ] Extension scaffold: `package.json` manifest, esbuild bundle, `pnpm --filter @fiberguard/vscode dev`
- [ ] Setting: `fiberguard.nodeUrl` (default `http://127.0.0.1:8227`)
- [ ] Activity bar icon + sidebar tree view (channels / peers)
- [ ] Commands:
  - [ ] `FiberGuard: Node Status`
  - [ ] `FiberGuard: Can I Pay?` (input box for invoice)
  - [ ] `FiberGuard: Diagnose Payment` (payment hash input)
- [ ] Output channel `FiberGuard` for diagnostic text (same copy as web)
- [ ] `showErrorMessage` / progress for long RPC calls
- [ ] Reuse `@fiberguard/diagnostics` — no duplicated analysis logic
- [ ] Native VS Code UI only (Codicons, theme colors — no shadcn)

---

## Phase 6 — Integration and hardening (Day 11)

- [ ] Full demo script written and rehearsed (health → failed payment → can-i-pay)
- [ ] `pnpm build` clean on all packages
- [ ] `pnpm test` passes (diagnostics unit tests)
- [ ] README updated: real commands, env vars, demo prerequisites
- [ ] Document **working vs simulated vs future** explicitly
- [ ] Fix any RPC method name mismatches found against live Fiber version

---

## Phase 7 — Hackathon submission (Day 12)

- [ ] Project summary + **Category 2** stated in README
- [ ] Team members listed
- [ ] Open-source repo public and runnable
- [ ] Demo video recorded (3–5 min): problem → dashboard → payment diagnostic → can-i-pay → VS Code
- [ ] Runnable demo instructions in README (local Fiber node required)
- [ ] Technical breakdown (architecture diagram, package responsibilities)
- [ ] Fiber infrastructure gap explanation (why FiberGuard vs Dashboard/Studio)
- [ ] Future roadmap section
- [ ] License chosen (e.g. MIT)
- [ ] CKBoost submission form completed
- [ ] AI allowance claim filed if applicable ($20 rebate)