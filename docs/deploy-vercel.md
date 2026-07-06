# Deploy FiberGuard Web to Vercel

Hosted dashboard setup using a **public Fiber testnet node** for live RPC data (no VPS or local node required for the public URL).

## Hosted demo (Option 3)

The Vercel deployment sets `FIBER_RPC_URL` to a public Fiber testnet node:

```
FIBER_RPC_URL=http://18.162.235.225:8227
```

This is [Fiber testnet public node 1](https://www.fiber.world/docs/quick-start/connect-nodes). The dashboard shows **that node's** live health, channels, peers, and payments — useful for judges and visitors without running FNN locally.

> **Note:** Data on the hosted URL is from the public testnet node, not your local node. For your own node, run the dashboard locally or point `FIBER_RPC_URL` at your RPC endpoint.

Verify the public node responds:

```bash
curl -s http://18.162.235.225:8227 \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"node_info","params":[],"id":1}'
```

## Vercel project settings

| Setting | Value |
|---------|-------|
| **Root Directory** | `apps/web` |
| **Framework** | Next.js |
| **Include files outside Root Directory** | Enabled |

`apps/web/vercel.json` sets install and build commands for the pnpm workspace:

- **Install:** `cd ../.. && corepack enable && pnpm install`
- **Build:** `cd ../.. && pnpm turbo run build --filter=@fiberguard/web`

Add this environment variable in **Vercel → Settings → Environment Variables**:

| Variable | Production value |
|----------|------------------|
| `FIBER_RPC_URL` | `http://18.162.235.225:8227` |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1` |
| `GROQ_API_KEY` | *(optional)* server-side AI explanations |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` *(optional)* |

`GROQ_API_KEY` is optional — without it, diagnostics still work using static copy from `@fiberguard/diagnostics`.

## Why the custom install command?

The monorepo uses pnpm **catalog** dependencies (`catalog:` in `pnpm-workspace.yaml`). Vercel must install from the **repo root** with **pnpm 10** (via Corepack). A plain `pnpm install` in `apps/web` fails with:

```
ERR_PNPM_SPEC_NOT_SUPPORTED_BY_ANY_RESOLVER  @biomejs/biome@catalog: isn't supported
```

## Local development vs hosted

| | Local (`pnpm dev:web`) | Vercel (hosted) |
|--|------------------------|-----------------|
| `FIBER_RPC_URL` | `http://127.0.0.1:8227` | `http://18.162.235.225:8227` |
| Node required | Your local FNN | None |
| VS Code extension | Uses `fiberguard.nodeUrl` (local) | N/A |

Copy `apps/web/.env.local.example` to `apps/web/.env.local` for local dev.

## References

- [Connect Public Nodes](https://www.fiber.world/docs/quick-start/connect-nodes)
- [Demo environment setup](./demo-setup.md)
- [Vercel monorepo docs](https://vercel.com/docs/monorepos)
