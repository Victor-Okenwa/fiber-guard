# FiberGuard

**Diagnostics, monitoring, and reliability for Fiber nodes on Nervos CKB.**

FiberGuard helps node operators and developers understand what is happening in their Fiber node, why payments fail, and how to improve reliability — through a web dashboard and a VS Code extension.

Built for [**Gone in 60ms: Fiber Network Infrastructure Hackathon**](https://talk.nervos.org/t/gone-in-60ms-fiber-network-infrastructure-hackathon-announcement/10418) — **Category 2:** Node, Routing, Cross-Chain, and Diagnostics Infrastructure.

### Live demo

The web dashboard is hosted on **Vercel** and connects to a [public Fiber testnet node](https://www.fiber.world/docs/quick-start/connect-nodes) for live RPC data — no local Fiber node required to try the hosted URL.

> Add your Vercel deployment URL here after deploy, e.g. `https://fiberguard.vercel.app`

For your own node, run locally (see [Development](#development)) or set `FIBER_RPC_URL` to your RPC endpoint. Deployment details: [docs/deploy-vercel.md](docs/deploy-vercel.md).

---

## Background

### What is Fiber?

[Fiber](https://github.com/nervosnetwork/fiber) is a Lightning-style payment channel network built on [Nervos CKB](https://nervos.org). It enables fast, low-cost off-chain payments:

1. Users **open channels** by locking funds on-chain.
2. Payments move **instantly off-chain** through the channel graph.
3. The network supports **multiple assets** and aims to **interoperate with Bitcoin Lightning**.

### What is FiberGuard?

FiberGuard sits beside a running Fiber node and turns raw RPC data into **actionable insight**:

| Feature | Description |
|--------|-------------|
| **Health dashboard** | Node status, channels, liquidity, peers, route quality |
| **Payment diagnostics** | Clear English explanations when payments fail |
| **"Can I Pay?"** | Predicts payment success probability before sending |
| **Route tools** | Simulation and testing for path selection |
| **Recommendations** | Rebalance suggestions, peer issues, liquidity gaps |
| **VS Code extension** | Inspect and interact with your node from the editor |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FiberGuard                              │
├──────────────────────────┬──────────────────────────────────────┤
│   apps/web (Next.js)     │   apps/vscode (VS Code extension)    │
│   Dashboard & tools      │   Editor-integrated diagnostics      │
└────────────┬─────────────┴──────────────────┬──────────────────┘
             │                                │
             ▼                                ▼
┌────────────────────────────────────────────────────────────────┐
│                      packages/                                  │
│  ┌─────────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────┐  │
│  │ fiber-rpc   │ │ ckb-rpc  │ │ diagnostics  │ │ shared     │  │
│  │ Fiber JSON  │ │ CKB      │ │ failures,    │ │ types,     │  │
│  │ RPC client  │ │ testnet  │ │ can-i-pay,   │ │ utils      │  │
│  └──────┬──────┘ └────┬─────┘ │ routing      │ └────────────┘  │
│         │             │       └──────────────┘                   │
└─────────┼─────────────┼──────────────────────────────────────────┘
          │             │
          ▼             ▼
   ┌──────────────┐  ┌──────────────┐
   │ Fiber node   │  │ CKB testnet  │
   │ :8227 RPC    │  │ RPC          │
   └──────────────┘  └──────────────┘
```

### Design principles

- **TypeScript everywhere** — strict mode, shared types across apps and packages.
- **Single RPC layer** — all Fiber/CKB calls go through `packages/`; apps never duplicate clients.
- **Diagnostics as a library** — `packages/diagnostics` is UI-agnostic so web and VS Code share the same logic.
- **Human-first errors** — every failure path should answer: what happened, why, and what to do next.
- **Bigints for money** — channel capacities and balances use `bigint`, never floating-point.

---

## Repository structure

```
fibergaurd/
├── apps/
│   ├── web/                 # Next.js dashboard
│   └── vscode/              # VS Code extension
├── packages/
│   ├── fiber-rpc/           # Fiber JSON-RPC client
│   ├── ckb-rpc/             # CKB testnet RPC client
│   ├── diagnostics/         # Payment analysis, can-i-pay, routing
│   └── shared/              # Shared types, constants, formatters
├── docs/
│   ├── demo-setup.md        # Local node + channel demo scenarios
│   └── deploy-vercel.md       # Vercel + public testnet RPC hosting
├── .cursor/rules/           # AI/editor coding rules for this project
└── README.md
```

---

## Prerequisites

### Try the hosted dashboard (no setup)

Open the Vercel URL above. It uses `FIBER_RPC_URL=http://18.162.235.225:8227` (public Fiber testnet node).

### Local development

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (repo pins `pnpm@10.18.3` via Corepack)
- A running **Fiber node** with JSON-RPC on port **8227** (for local dev and VS Code extension)
- Access to **CKB testnet** RPC (optional; for on-chain context)

### Running a Fiber node (local)

Refer to the [Fiber documentation](https://www.fiber.world/docs) for installation. FiberGuard defaults to a local RPC endpoint:

```
http://127.0.0.1:8227
```

Verify connectivity:

```bash
./scripts/verify-node.sh
# or manually:
curl -X POST http://127.0.0.1:8227 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"node_info","params":[],"id":1}'
```

For channel setup and demo scenarios, see [docs/demo-setup.md](docs/demo-setup.md).

---

## Development

```bash
# Install dependencies
pnpm install

# Start the web dashboard (dev)
pnpm dev:web
# or: pnpm --filter @fiberguard/web dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint and typecheck
pnpm lint
pnpm typecheck
pnpm format   # auto-fix with Biome
```

Copy `apps/web/.env.local.example` to `apps/web/.env.local` for local environment variables.

### Environment variables

| Variable | Local default | Description |
|----------|---------------|-------------|
| `FIBER_RPC_URL` | `http://127.0.0.1:8227` | Fiber JSON-RPC endpoint (server-side only) |
| `CKB_RPC_URL` | `https://testnet.ckbapp.dev/` | CKB testnet RPC |
| `GROQ_API_KEY` | *(unset)* | Optional — AI-augmented diagnostic explanations |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model when API key is set |

**Vercel (hosted demo):** set `FIBER_RPC_URL=http://18.162.235.225:8227` and `ENABLE_EXPERIMENTAL_COREPACK=1`. See [docs/deploy-vercel.md](docs/deploy-vercel.md).

### Deploy to Vercel

1. Import the repo; set **Root Directory** to `apps/web`.
2. Enable **Include files outside Root Directory**.
3. Set environment variables (see [docs/deploy-vercel.md](docs/deploy-vercel.md)).
4. `apps/web/vercel.json` configures pnpm workspace install and Turbo build.

### VS Code extension

```bash
# Bundle the extension (esbuild)
pnpm --filter fiberguard-vscode build

# Or watch mode during development
pnpm --filter fiberguard-vscode dev
```

Then press **F5** in VS Code (launch config "Run FiberGuard Extension") to open an Extension Development Host with FiberGuard loaded. The activity bar shows a **FiberGuard** view (channels + peers), and the Command Palette exposes `FiberGuard: Node Status`, `FiberGuard: Can I Pay?`, and `FiberGuard: Diagnose Payment`.

Extension setting: `fiberguard.nodeUrl` — Fiber RPC URL (default `http://127.0.0.1:8227`).

---

## Packages

### `@fiberguard/fiber-rpc`

Typed JSON-RPC client for the Fiber node. All dashboard and extension calls flow through this package.

### `@fiberguard/ckb-rpc`

CKB testnet RPC client for on-chain data: funding transactions, confirmations, UTXOs.

### `@fiberguard/diagnostics`

Core intelligence layer:

- Payment failure classification and plain-English explanations
- "Can I Pay?" success probability estimation
- Route simulation and quality scoring
- Rebalance and liquidity recommendations

### `@fiberguard/shared`

Shared TypeScript types, constants, and utilities (e.g. amount formatting).

---

## Cursor rules

Project-specific AI guidance lives in [`.cursor/rules/`](.cursor/rules/):

| Rule | Scope |
|------|-------|
| `fiberguard-context.mdc` | Product problem, solution, users, journeys, scope (always on) |
| `fiberguard-project.mdc` | Architecture, monorepo layout, coding principles (always on) |
| `goals-execution.mdc` | Map tasks to [GOALS.md](GOALS.md); hierarchical phases, decomposition (always on) |
| `documentation-references.mdc` | Official docs to consult for tasks, debugging, questions (always on) |
| `typescript-standards.mdc` | TypeScript best practices |
| `fiber-rpc.mdc` | RPC client and diagnostics conventions |
| `nextjs-dashboard.mdc` | Web dashboard patterns |
| `vscode-extension.mdc` | VS Code extension patterns |

---

## What works today

| Surface | Status | Notes |
|---------|--------|-------|
| Web dashboard (Vercel) | **Working** | Live RPC via public Fiber testnet node |
| Web dashboard (local) | **Working** | Requires local FNN on `:8227` |
| Health, channels, peers | **Working** | Real RPC data |
| Payment failure diagnostics | **Working** | Against node payment history |
| Can I Pay? | **Working** | Invoice parse + liquidity/blocker analysis |
| VS Code extension | **Working** | Local node via `fiberguard.nodeUrl` |
| Groq AI explanations | **Optional** | Needs `GROQ_API_KEY`; falls back to static diagnostics |
| Route simulation | **Future** | Planned |
| CKB on-chain context (`ckb-rpc`) | **Future** | Package stub; env var reserved |
| Alerting / uptime monitoring | **Future** | Post-hackathon |

### Why FiberGuard?

[Fiber Dashboard](https://www.fiber.world/showcase) and [Fiber Studio](https://www.fiber.world/showcase) focus on network visibility and node setup. FiberGuard targets **reliability engineering** — plain-English payment failure diagnosis, pre-flight “Can I Pay?” checks, and actionable remediation for operators and developers building on Fiber.

---

## Future features

Planned work beyond the hackathon MVP. These stay in **Category 2** (node, routing, and diagnostics infrastructure) — reusable tooling for operators and Fiber app developers, not consumer wallet or merchant products.

### Routing and payments

| Feature | Description |
|---------|-------------|
| **Route simulation** | Dry-run routing without sending; show hop path, fees, and per-hop liquidity constraints before `sendPayment`. |
| **Route quality analytics** | Track success rate, latency, and failure patterns per peer and channel over time. |
| **Payment pre-flight API** | Shared `@fiberguard/diagnostics` endpoint for wallets and apps to call before initiating payments. |
| **Invoice batch checks** | Validate multiple invoices or recurring payment targets in one pass for agent and game flows. |

### On-chain and node context

| Feature | Description |
|---------|-------------|
| **CKB on-chain context** | Surface funding confirmations, pending opens, and force-close progress via `packages/ckb-rpc` so off-chain failures are not misread as payment bugs. |
| **Channel lifecycle timeline** | Unified view of pending → ready → closing states with plain-English status and next steps. |
| **Multi-node profiles** | Switch between local dev, testnet demo, and operator nodes from dashboard and VS Code settings. |

### Monitoring and alerting

| Feature | Description |
|---------|-------------|
| **Health alerts** | Notify when peers disconnect, channels leave `ChannelReady`, or liquidity drops below thresholds. |
| **Payment failure digests** | Overnight summaries of failed payments with top diagnostics and recommended fixes. |
| **Uptime and SLO views** | Simple reliability metrics for nodes used in routing or app backends. |

### Developer experience

| Feature | Description |
|---------|-------------|
| **VS Code inline diagnostics** | Squiggles and quick-fix hints when Fiber RPC config or invoice strings look invalid in the editor. |
| **Local test scenarios** | Scripted demo flows (healthy node, dry channel, unreachable peer) for hackathon and CI smoke tests. |
| **Groq explanations (expanded)** | Optional AI summaries for complex multi-hop failures, with deterministic diagnostics always shown first. |

### Ecosystem

| Feature | Description |
|---------|-------------|
| **Embeddable diagnostics widget** | Drop-in React components from shared packages for other Fiber dashboards and tools. |
| **Open metrics export** | Prometheus-friendly health and routing stats for operators who already run observability stacks. |

---

## Roadmap

- [x] Monorepo scaffold (pnpm workspaces, TypeScript, Biome, Turborepo)
- [x] `packages/shared`, `fiber-rpc`, `diagnostics`
- [x] Web dashboard — health, channels, peers, payments, can-i-pay
- [x] VS Code extension — node status, can-i-pay, payment diagnose
- [x] Vercel hosted demo (public testnet RPC)
- [ ] Route simulation tools — see [Future features](#future-features)
- [ ] CKB on-chain context in dashboard — see [Future features](#future-features)
- [ ] Alerting for unhealthy nodes / weak routes — see [Future features](#future-features)

---

## Contributing

1. Follow the Cursor rules in `.cursor/rules/`.
2. Keep changes focused — smallest correct diff.
3. Add tests for diagnostics logic in `packages/diagnostics`.
4. User-facing strings must be clear English, not raw RPC errors.

---

## License

[MIT](LICENSE)

---

## Links

### Official documentation

| Resource | URL |
|----------|-----|
| CKB Docs | https://docs.nervos.org/docs |
| Fiber Docs | https://www.fiber.world/docs |
| Fiber JavaScript SDK | https://www.fiber.world/docs/build/sdk/js |
| Fiber Showcase (community projects) | https://www.fiber.world/showcase |
| TypeScript Best Practices (W3Schools) | https://www.w3schools.com/typescript/typescript_best_practices.php |
| TypeScript Handbook: Do's and Don'ts | https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html |

### Other

- [Fiber (GitHub)](https://github.com/nervosnetwork/fiber)
- [Nervos CKB](https://nervos.org)
- [Gone in 60ms Hackathon](https://talk.nervos.org/t/gone-in-60ms-fiber-network-infrastructure-hackathon-announcement/10418)
