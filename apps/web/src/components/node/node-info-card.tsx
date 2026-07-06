'use client';

import type { FiberNodeSummary } from '@fiberguard/fiber-rpc';
import { CopyableTruncatedText } from '@/components/data/copyable-text';

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
          <dd>
            <CopyableTruncatedText value={node.pubkey} head={8} tail={6} className="text-xs" />
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
