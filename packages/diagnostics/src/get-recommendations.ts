import type { ChannelInfo, Diagnostic, NodeHealth, PeerInfo } from '@fiberguard/shared';
import { DIAGNOSTIC_CODES } from '@fiberguard/shared';

export function getRecommendations(
  health: NodeHealth,
  channels: ChannelInfo[],
  peers: PeerInfo[],
): Diagnostic[] {
  const recommendations: Diagnostic[] = [];

  const hasNoPeers = health.diagnostics.some((d) => d.code === DIAGNOSTIC_CODES.NO_PEERS);
  if (hasNoPeers || peers.length < 2) {
    recommendations.push({
      code: DIAGNOSTIC_CODES.PEER_UNREACHABLE,
      severity: 'info',
      title: 'Connect more peers',
      explanation: 'More peer connections improve routing options and payment reliability.',
      remediation:
        'Use connect_peer to add public testnet nodes (see Fiber Connect Public Nodes guide).',
    });
  }

  const readyChannels = channels.filter((c) => c.stateName === 'ChannelReady');
  for (const channel of readyChannels) {
    const outboundRatio =
      channel.capacity > 0n ? Number((channel.localBalance * 100n) / channel.capacity) : 0;
    if (outboundRatio < 20) {
      recommendations.push({
        code: DIAGNOSTIC_CODES.LOW_OUTBOUND_LIQUIDITY,
        severity: 'warning',
        title: 'Rebalance suggested',
        explanation: `Channel ${channel.channelId.slice(0, 10)}… has low outbound liquidity (${outboundRatio}% local).`,
        remediation:
          'Receive inbound payments or shift liquidity so more capacity is on your side for sending.',
        context: { channelId: channel.channelId, outboundRatio },
      });
    }
    if (outboundRatio > 80) {
      recommendations.push({
        code: DIAGNOSTIC_CODES.LOW_OUTBOUND_LIQUIDITY,
        severity: 'info',
        title: 'Inbound capacity low',
        explanation: `Channel ${channel.channelId.slice(0, 10)}… is skewed toward outbound — receiving may fail.`,
        remediation: 'Consider rebalancing if you expect inbound payments on this channel.',
        context: { channelId: channel.channelId, outboundRatio },
      });
    }
  }

  if (readyChannels.length === 0 && channels.length > 0) {
    recommendations.push({
      code: DIAGNOSTIC_CODES.CHANNEL_NOT_READY,
      severity: 'warning',
      title: 'Wait for channels to become ready',
      explanation: 'Channels exist but none are ChannelReady yet.',
      remediation: 'Complete funding and acceptance flows before sending payments.',
    });
  }

  return recommendations;
}
