# FiberGuard for VS Code

Fiber node diagnostics in your editor: health checks, channels, peers, payment failure analysis, and **Can I Pay?** previews.

Works with any editor that supports VS Code extensions (VS Code, VSCodium, Cursor, Gitpod, and others via [Open VSX](https://open-vsx.org/)).

## Features

- **Node Explorer** — sidebar tree with actions, channels, and peers
- **Health Details** — health score, diagnostics, and recommendations
- **Can I Pay?** — check invoice success probability before sending
- **Diagnose Payment** — structured failure analysis for a payment hash
- **View All Payments** — table of recent payments with amount, fee, and status
- **Copy helpers** — copy pubkeys, addresses, and payment hashes from the tree

## Requirements

- A running [Fiber](https://github.com/nervosnetwork/fiber) node with JSON-RPC enabled (default port `8227`)

## Extension Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `fiberguard.nodeUrl` | `http://127.0.0.1:8227` | Fiber node JSON-RPC endpoint |

## Usage

1. Install the extension from the marketplace.
2. Open the **FiberGuard** activity bar (shield icon).
3. Set `fiberguard.nodeUrl` if your node is not on the default URL.
4. Use toolbar actions or the command palette (`FiberGuard: …`).

## Development

From the monorepo root:

```bash
pnpm --filter fiberguard-vscode dev
```

Press **F5** in VS Code with the repo open to launch an Extension Development Host.

## Links

- [FiberGuard repository](https://github.com/Victor-Okenwa/fiber-guard)
- [Fiber documentation](https://github.com/nervosnetwork/fiber)
