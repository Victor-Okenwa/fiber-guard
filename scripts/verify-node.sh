#!/usr/bin/env bash
# FiberGuard Phase 0 — verify local Fiber node JSON-RPC
# Usage: ./scripts/verify-node.sh [RPC_URL]
# Default: http://127.0.0.1:8227

set -euo pipefail

RPC_URL="${1:-http://127.0.0.1:8227}"
export NO_PROXY="127.0.0.1,localhost,${NO_PROXY:-}"

echo "FiberGuard node verification"
echo "Endpoint: $RPC_URL"
echo ""

rpc() {
  local method="$1"
  local params="${2:-[]}"
  curl -sf -X POST "$RPC_URL" \
    -H "Content-Type: application/json" \
    -d "{\"jsonrpc\":\"2.0\",\"method\":\"$method\",\"params\":$params,\"id\":1}"
}

echo "1. node_info"
NODE_INFO="$(rpc node_info)"
if ! echo "$NODE_INFO" | python3 -c "import sys,json; d=json.load(sys.stdin); assert 'result' in d" 2>/dev/null; then
  echo "   FAIL — node did not return a valid node_info response"
  echo "$NODE_INFO"
  exit 1
fi

echo "$NODE_INFO" | python3 -c "
import sys, json
r = json.load(sys.stdin)['result']
print(f\"   OK — version: {r.get('version')}\")
print(f\"   pubkey: {r.get('pubkey')}\")
print(f\"   peers: {int(r.get('peers_count', '0x0'), 16)}\")
print(f\"   channels: {int(r.get('channel_count', '0x0'), 16)}\")
print(f\"   pending channels: {int(r.get('pending_channel_count', '0x0'), 16)}\")
"

echo ""
echo "2. list_channels"
CHANNELS="$(rpc list_channels '[{}]')"
echo "$CHANNELS" | python3 -c "
import sys, json
channels = json.load(sys.stdin).get('result', {}).get('channels', [])
ready = [c for c in channels if c.get('state', {}).get('state_name') == 'ChannelReady']
print(f\"   total: {len(channels)}, ChannelReady: {len(ready)}\")
for ch in channels:
    state = ch.get('state', {}).get('state_name', 'unknown')
    cid = ch.get('channel_id', ch.get('temporary_channel_id', '?'))[:18]
    print(f\"   - {cid}... state={state}\")
if not ready:
    print('   WARN — no ChannelReady channel. Run docs/demo-setup.md before payment demos.')
"

echo ""
echo "3. list_peers"
PEERS="$(rpc list_peers '[{}]')"
echo "$PEERS" | python3 -c "
import sys, json
peers = json.load(sys.stdin).get('result', {}).get('peers', [])
print(f\"   connected peers: {len(peers)}\")
for p in peers[:5]:
    print(f\"   - {p.get('pubkey', '?')[:20]}... @ {p.get('address', '?')[:40]}\")
"

echo ""
echo "Verification complete."
