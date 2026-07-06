'use client';

import { formatCkbFromShannons, parseHexAmount } from '@fiberguard/shared';
import { LiquidityBar } from '@/components/channels/liquidity-bar';
import { CopyableTruncatedText } from '@/components/data/copyable-text';
import { StaleIndicator } from '@/components/data/stale-indicator';
import { TablePagination } from '@/components/data/table-pagination';
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
import { useClientPagination } from '@/hooks/use-client-pagination';
import { usePoll } from '@/hooks/use-poll';
import { fetchChannels } from '@/lib/api-client';

const POLL_MS = 15_000;

export function ChannelsView() {
  const { data, error, isLoading, lastFetchedAt } = usePoll(fetchChannels, {
    intervalMs: POLL_MS,
  });
  const pagination = useClientPagination(data);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Channels</h1>
          <p className="text-muted-foreground">Channel state, balances, and liquidity.</p>
        </div>
        <StaleIndicator lastFetchedAt={lastFetchedAt} intervalMs={POLL_MS} />
      </div>

      {isLoading && !data && <TableSkeleton columns={6} />}

      {error && !data && <NodeUnreachableAlert />}

      {data && data.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No channels open. See docs/demo-setup.md to open a ChannelReady channel.
        </p>
      )}

      {data && data.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel ID</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Remote</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Liquidity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.pageItems.map((ch) => {
                const notReady = ch.stateName !== 'ChannelReady';
                return (
                  <TableRow key={ch.channelId}>
                    <TableCell className="text-xs">
                      <CopyableTruncatedText value={ch.channelId} head={8} tail={4} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={notReady ? 'destructive' : 'secondary'}>
                          {ch.stateName}
                        </Badge>
                        {!ch.enabled && <Badge variant="outline">Disabled</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm tabular-nums">
                      {formatCkbFromShannons(parseHexAmount(ch.localBalance as unknown as string))}
                    </TableCell>
                    <TableCell className="font-mono text-sm tabular-nums">
                      {formatCkbFromShannons(parseHexAmount(ch.remoteBalance as unknown as string))}
                    </TableCell>
                    <TableCell className="font-mono text-sm tabular-nums">
                      {formatCkbFromShannons(parseHexAmount(ch.capacity as unknown as string))}
                    </TableCell>
                    <TableCell className="min-w-32">
                      <LiquidityBar
                        localBalance={String(ch.localBalance)}
                        capacity={String(ch.capacity)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination
            rangeLabel={pagination.rangeLabel}
            hasPrevious={pagination.hasPrevious}
            hasNext={pagination.hasNext}
            onPrevious={pagination.goPrevious}
            onNext={pagination.goNext}
          />
        </div>
      )}
    </div>
  );
}
