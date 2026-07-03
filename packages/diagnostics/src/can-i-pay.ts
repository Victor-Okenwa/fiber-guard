import type { ChannelInfo, Diagnostic, ParsedInvoice, PeerInfo } from '@fiberguard/shared';
import { DIAGNOSTIC_CODES } from '@fiberguard/shared';
import type { NodeInfoInput } from './assess-node-health.js';

export interface CanIPayResult {
  probability: number;
  blockers: Diagnostic[];
}

export function canIPay(
  invoice: ParsedInvoice,
  channels: ChannelInfo[],
  peers: PeerInfo[],
  nodeInfo: NodeInfoInput,
): CanIPayResult {
  const blockers: Diagnostic[] = [];
  let probability = 100;

  if (!invoice.amount || invoice.amount <= 0n) {
    blockers.push({
      code: DIAGNOSTIC_CODES.INVOICE_PARSE_ERROR,
      severity: 'error',
      title: 'Invalid invoice amount',
      explanation: 'The invoice does not contain a valid positive amount.',
      remediation: 'Verify the invoice string and parse it again with parseInvoice.',
    });
    return { probability: 0, blockers };
  }

  if (peers.length === 0) {
    probability -= 40;
    blockers.push({
      code: DIAGNOSTIC_CODES.NO_PEERS,
      severity: 'error',
      title: 'No peers connected',
      explanation: 'Without peers, multi-hop routing is unlikely to succeed.',
      remediation: 'Connect to public Fiber testnet nodes before paying.',
    });
  }

  const readyChannels = channels.filter((c) => c.stateName === 'ChannelReady' && c.enabled);
  if (readyChannels.length === 0) {
    probability -= 50;
    blockers.push({
      code: DIAGNOSTIC_CODES.NO_CHANNELS,
      severity: 'error',
      title: 'No routable channels',
      explanation: 'You need at least one enabled ChannelReady channel to send payments.',
      remediation: 'Open and fund a channel, then wait for ChannelReady.',
    });
  }

  const totalOutbound = readyChannels.reduce((sum, c) => sum + c.localBalance, 0n);
  if (readyChannels.length > 0 && totalOutbound < invoice.amount) {
    probability -= 35;
    blockers.push({
      code: DIAGNOSTIC_CODES.INSUFFICIENT_LIQUIDITY,
      severity: 'error',
      title: 'Insufficient outbound liquidity',
      explanation: `Total outbound liquidity (${totalOutbound} shannons) is less than invoice amount (${invoice.amount} shannons).`,
      remediation: 'Rebalance channels or receive inbound liquidity before paying.',
      context: {
        outboundLiquidity: String(totalOutbound),
        invoiceAmount: String(invoice.amount),
      },
    });
  }

  if (nodeInfo.pendingChannelCount > 0n) {
    probability -= 10;
    blockers.push({
      code: DIAGNOSTIC_CODES.CHANNEL_NOT_READY,
      severity: 'warning',
      title: 'Channels still opening',
      explanation: 'Pending channels may not be usable for routing yet.',
      remediation: 'Wait for pending channels to reach ChannelReady.',
    });
  }

  if (blockers.some((b) => b.severity === 'error')) {
    probability = Math.min(probability, 40);
  }

  return {
    probability: Math.max(0, Math.min(100, probability)),
    blockers,
  };
}
