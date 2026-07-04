import type { FiberNodeSummary } from '@fiberguard/fiber-rpc';

function truncateKey(value: string, head = 8, tail = 6): string {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

interface NodeInfoCardProps {
  node: FiberNodeSummary;
}

export function NodeInfoCard({ node }: NodeInfoCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <p className="text-sm font-medium">Node info</p>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Version</dt>
          <dd className="font-mono">{node.version}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Pubkey</dt>
          <dd className="font-mono text-xs" title={node.pubkey}>
            {truncateKey(node.pubkey)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Peers</dt>
          <dd className="tabular-nums">{String(node.peerCount)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Channels</dt>
          <dd className="tabular-nums">{String(node.channelCount)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Pending channels</dt>
          <dd className="tabular-nums">{String(node.pendingChannelCount)}</dd>
        </div>
      </dl>
    </div>
  );
}
