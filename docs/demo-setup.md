# FiberGuard — Demo Environment Setup

Phase 0 deliverable: get at least one **`ChannelReady`** channel (or run these steps before payment / can-i-pay demos).

**Current node (verified):** `http://127.0.0.1:8227` · Fiber `0.9.0-rc5` · data dir `~/fiber-fnn/my-fnn`

---

## Quick verify

```bash
chmod +x scripts/verify-node.sh
./scripts/verify-node.sh
```

---

## Option A — Two local nodes (recommended for full demos)

Best for: payment success, payment failure, can-i-pay, and VS Code extension demos with a controllable second party.

Follow the official [Basic Transfer Example](https://www.fiber.world/docs/quick-start/basic-transfer).

### Sub-steps

| # | Action | Notes |
|---|--------|-------|
| A.1 | Use binaries in `~/fiber/node1` and `~/fiber/node2` (or copy from `~/fiber-fnn/my-fnn`) | Node 1 RPC `:8227`, Node 2 RPC `:8237` |
| A.2 | Create CKB keys for **both** nodes (`ckb-cli account new` + export to `ckb/key`) | See Fiber docs — key file is 64-char hex, no `0x` |
| A.3 | Fund **both** addresses from [Nervos testnet faucet](https://faucet.nervos.org) | ~500+ CKB per node for channel funding |
| A.4 | Start Node 1 | `cd ~/fiber/node1 && FIBER_SECRET_KEY_PASSWORD='…' ./fnn -c config.yml -d .` |
| A.5 | Start Node 2 | `cd ~/fiber/node2 && FIBER_SECRET_KEY_PASSWORD='…' ./fnn -c config.yml -d .` |
| A.6 | Connect Node 1 → Node 2 | `fnn-cli peer connect_peer --pubkey <node2_pubkey> --address "/ip4/127.0.0.1/tcp/8238"` |
| A.7 | Open channel (500 CKB) | `fnn-cli channel open_channel --pubkey <node2_pubkey> --funding-amount 50000000000 --public true` |
| A.8 | Accept on Node 2 | `fnn-cli --url http://127.0.0.1:8237 channel accept_channel --temporary-channel-id <id>` |
| A.9 | Wait for `ChannelReady` | Poll `./scripts/verify-node.sh` until `ChannelReady: 1` |
| A.10 | Create test invoice on Node 2 | For optional payment-failure / success demos |

```bash
export NO_PROXY=127.0.0.1,localhost
./fnn-cli channel list_channels
./fnn-cli --url http://127.0.0.1:8237 channel list_channels
```

---

## Option B — Channel with public testnet node

Best for: single-node FiberGuard dashboard when you only run one local FNN.

Follow [Connect Public Nodes](https://www.fiber.world/docs/quick-start/connect-nodes).

### Sub-steps

| # | Action |
|---|--------|
| B.1 | Ensure local node has **≥ 10,000 CKB** on testnet (faucet) |
| B.2 | Connect to public node1: `/ip4/18.162.235.225/tcp/8119/p2p/QmXen3eUHhywmutEzydCsW4hXBoeVmdET2FJvMX69XJ1Eo` |
| B.3 | `open_channel` with **≥ 500 CKB** (`0xba43b7400` shannons) — public node auto-accept min is ~438 CKB |
| B.4 | Poll until `ChannelReady` (on-chain funding confirmation takes minutes) |

```bash
export NO_PROXY=127.0.0.1,localhost,18.162.235.225
FNN_CLI=~/fiber-fnn/my-fnn/fnn-cli

# Public node1 pubkey (fetch fresh if needed)
PUBKEY=$(curl -s http://18.162.235.225:8227 -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"node_info","params":[],"id":1}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['pubkey'])")

$FNN_CLI peer connect_peer \
  --address "/ip4/18.162.235.225/tcp/8119/p2p/QmXen3eUHhywmutEzydCsW4hXBoeVmdET2FJvMX69XJ1Eo"

$FNN_CLI channel open_channel \
  --pubkey "$PUBKEY" \
  --funding-amount 50000000000 \
  --public true
```

---

## Option C — Dashboard-only (no channel yet)

FiberGuard **health, peers, and node info** work with **zero channels**. Payment diagnostics and can-i-pay need at least one `ChannelReady` channel or realistic fixture data in tests.

| Feature | Works without channel? |
|---------|------------------------|
| Node health dashboard | Yes |
| Peer list | Yes |
| Channel table (empty state) | Yes |
| Payment failure diagnostics | Needs failed payment history or fixtures |
| Can I Pay? | Needs channel liquidity or graph context |

---

## Option D — Hosted Vercel demo (public testnet RPC)

Best for: hackathon judges and visitors — **no local Fiber node required**.

The production dashboard on Vercel uses a public Fiber testnet node's JSON-RPC:

```
FIBER_RPC_URL=http://18.162.235.225:8227
```

Set this in Vercel environment variables. The dashboard shows live data from that public node (channels, peers, payments, health).

| Aspect | Detail |
|--------|--------|
| Setup | See [docs/deploy-vercel.md](deploy-vercel.md) |
| Data source | Public testnet node 1 — not your local FNN |
| Local dev | Keep `FIBER_RPC_URL=http://127.0.0.1:8227` in `apps/web/.env.local` |
| VS Code extension | Still uses your local node via `fiberguard.nodeUrl` |

```bash
# Verify public RPC before deploying
curl -s http://18.162.235.225:8227 \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"node_info","params":[],"id":1}'
```

---

## Optional — Second node for failure demos

For **payment failure** scenarios (insufficient liquidity, unreachable peer):

1. Run two local nodes (Option A)
2. Attempt payment larger than channel capacity, or
3. Disconnect peer before `sendPayment`

Document the invoice / payment hash used in demo video notes.

---

## Environment notes

| Variable | Purpose |
|----------|---------|
| `NO_PROXY=127.0.0.1,localhost` | Prevents proxy 503 errors with `fnn-cli` |
| `FIBER_RPC_URL` | `http://127.0.0.1:8227` locally; `http://18.162.235.225:8227` on Vercel |
| `FIBER_SECRET_KEY_PASSWORD` | Required when starting `fnn` |

## References

- [Run a Fiber Node](https://www.fiber.world/docs/quick-start/run-a-node)
- [Basic Transfer Example](https://www.fiber.world/docs/quick-start/basic-transfer)
- [Connect Public Nodes](https://www.fiber.world/docs/quick-start/connect-nodes)
- [Deploy to Vercel](deploy-vercel.md)
- [JavaScript SDK](https://www.fiber.world/docs/build/sdk/js)
