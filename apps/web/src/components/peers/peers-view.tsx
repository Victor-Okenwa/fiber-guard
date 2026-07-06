'use client';

import { CopyableTruncatedText } from '@/components/data/copyable-text';
import { StaleIndicator } from '@/components/data/stale-indicator';
import { TableSkeleton } from '@/components/data/table-skeleton';
import { NodeUnreachableAlert } from '@/components/node/node-unreachable-alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePoll } from '@/hooks/use-poll';
import { fetchPeers } from '@/lib/api-client';

const POLL_MS = 15_000;

export function PeersView() {
  const { data, error, isLoading, lastFetchedAt } = usePoll(fetchPeers, {
    intervalMs: POLL_MS,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Peers</h1>
          <p className="text-muted-foreground">Connected peers and connection status.</p>
        </div>
        <StaleIndicator lastFetchedAt={lastFetchedAt} intervalMs={POLL_MS} />
      </div>

      {isLoading && !data && <TableSkeleton columns={3} />}

      {error && !data && <NodeUnreachableAlert />}

      {data && data.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No peers connected. Use connect_peer to add public testnet nodes — see docs/demo-setup.md.
        </p>
      )}

      {data && data.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pubkey</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((peer) => (
                <TableRow key={peer.pubkey}>
                  <TableCell className="text-xs">
                    <CopyableTruncatedText value={peer.pubkey} head={8} tail={6} />
                  </TableCell>
                  <TableCell className="max-w-xs text-xs">
                    <CopyableTruncatedText value={peer.address} head={16} tail={10} />
                  </TableCell>
                  <TableCell>
                    <Badge>Connected</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
