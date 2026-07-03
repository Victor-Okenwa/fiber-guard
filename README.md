# FiberGuard

**Diagnostics, monitoring, and reliability for Fiber nodes on Nervos CKB.**

FiberGuard helps node operators and developers understand what is happening in their Fiber node, why payments fail, and how to improve reliability — through a web dashboard and a VS Code extension.

Built for the [**Gone in 60ms: Fiber Network Infrastructure Hackathon**](https://nervos.org).

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
├── .cursor/rules/           # AI/editor coding rules for this project
└── README.md
```

> **Status:** Phase 1 complete — pnpm + Turborepo monorepo with `@fiberguard/*` package stubs. Next: Phase 2 core packages.

---

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (recommended package manager for the monorepo)
- A running **Fiber node** with JSON-RPC enabled (default port **8227**)
- Access to **CKB testnet** RPC (for on-chain context)

### Running a Fiber node

Refer to the [Fiber documentation](https://github.com/nervosnetwork/fiber) for installation and configuration. FiberGuard expects a local RPC endpoint:

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

For channel setup before payment demos, see [docs/demo-setup.md](docs/demo-setup.md).

---

## Development

> Commands below will be updated once the monorepo is scaffolded.

```bash
# Install dependencies
pnpm install

# Start the web dashboard (dev)
pnpm --filter @fiberguard/web dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint and typecheck
pnpm lint
pnpm typecheck
pnpm format   # auto-fix with Biome
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FIBER_RPC_URL` | `http://127.0.0.1:8227` | Fiber node JSON-RPC endpoint |
| `CKB_RPC_URL` | *(testnet URL)* | CKB testnet RPC endpoint |

Copy `.env.example` to `.env.local` in `apps/web` once available.

### VS Code extension

```bash
# Build and launch extension dev host
pnpm --filter @fiberguard/vscode dev
```

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

## Roadmap

- [x] Monorepo scaffold (pnpm workspaces, TypeScript, Biome)
- [x] `packages/shared` — domain types, formatters, diagnostic codes
- [x] `packages/fiber-rpc` — typed client wrapping `@ckb-ccc/fiber`
- [x] `packages/diagnostics` — health, payment failure, can-i-pay logic
- [ ] Web dashboard — node health and channel overview
- [ ] Payment failure diagnostics
- [ ] "Can I Pay?" checker
- [ ] Route simulation tools
- [ ] Actionable recommendations
- [ ] VS Code extension

---

## Contributing

1. Follow the Cursor rules in `.cursor/rules/`.
2. Keep changes focused — smallest correct diff.
3. Add tests for diagnostics logic in `packages/diagnostics`.
4. User-facing strings must be clear English, not raw RPC errors.

---

## License

TBD

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
- [Gone in 60ms Hackathon](https://nervos.org)
