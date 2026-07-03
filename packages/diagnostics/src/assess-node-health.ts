import type { ChannelInfo, Diagnostic, NodeHealth, PeerInfo } from '@fiberguard/shared';
import { DIAGNOSTIC_CODES, healthStatusFromScore } from '@fiberguard/shared';

export interface NodeInfoInput {
  version: string;
  pubkey: string;
  peerCount: bigint;
  channelCount: bigint;
  pendingChannelCount: bigint;
}

export function assessNodeHealth(
  nodeInfo: NodeInfoInput,
  channels: ChannelInfo[],
  peers: PeerInfo[],
): NodeHealth {
  const diagnostics: Diagnostic[] = [];
  let score = 100;

  if (peers.length === 0) {
    score -= 25;
    diagnostics.push({
      code: DIAGNOSTIC_CODES.NO_PEERS,
      severity: 'warning',
      title: 'No connected peers',
      explanation:
        'Your node is not connected to any peers. Multi-hop payments and network reachability require peer connections.',
      remediation:
        'Connect to public testnet nodes or peers using connect_peer. See docs/demo-setup.md.',
    });
  }

  if (channels.length === 0) {
    score -= 30;
    diagnostics.push({
      code: DIAGNOSTIC_CODES.NO_CHANNELS,
      severity: 'warning',
      title: 'No payment channels',
      explanation:
        'You have no open channels. Off-chain payments and routing require at least one ChannelReady channel.',
      remediation: 'Open a channel with a peer and wait until state is ChannelReady.',
    });
  }

  if (nodeInfo.pendingChannelCount > 0n) {
    score -= 15;
    diagnostics.push({
      code: DIAGNOSTIC_CODES.CHANNEL_NOT_READY,
      severity: 'info',
      title: 'Channels pending',
      explanation: `${nodeInfo.pendingChannelCount} channel(s) are still opening or funding on-chain.`,
      remediation: 'Wait for on-chain funding confirmation before sending payments.',
      context: { pendingChannelCount: String(nodeInfo.pendingChannelCount) },
    });
  }

  const notReady = channels.filter((c) => c.stateName !== 'ChannelReady');
  if (notReady.length > 0) {
    score -= 10 * Math.min(notReady.length, 3);
    diagnostics.push({
      code: DIAGNOSTIC_CODES.CHANNEL_NOT_READY,
      severity: 'warning',
      title: 'Channels not ready',
      explanation: `${notReady.length} channel(s) are not in ChannelReady state.`,
      remediation: 'Resolve pending funding or acceptance before relying on these channels.',
      context: { channelIds: notReady.map((c) => c.channelId) },
    });
  }

  const disabled = channels.filter((c) => !c.enabled);
  if (disabled.length > 0) {
    score -= 10;
    diagnostics.push({
      code: DIAGNOSTIC_CODES.CHANNEL_DISABLED,
      severity: 'warning',
      title: 'Disabled channels',
      explanation: `${disabled.length} channel(s) are disabled and will not forward payments.`,
      remediation: 'Re-enable channels via update_channel if they should be routable.',
    });
  }

  const readyChannels = channels.filter((c) => c.stateName === 'ChannelReady');
  const totalOutbound = readyChannels.reduce((sum, c) => sum + c.localBalance, 0n);
  if (readyChannels.length > 0 && totalOutbound === 0n) {
    score -= 20;
    diagnostics.push({
      code: DIAGNOSTIC_CODES.LOW_OUTBOUND_LIQUIDITY,
      severity: 'error',
      title: 'No outbound liquidity',
      explanation:
        'All ChannelReady channels have zero local balance. You cannot send payments until liquidity is on your side.',
      remediation: 'Receive a payment inbound or rebalance channels to restore outbound capacity.',
    });
  }

  const normalizedScore = Math.max(0, Math.min(100, score));
  return {
    score: normalizedScore,
    status: healthStatusFromScore(normalizedScore),
    diagnostics,
  };
}
