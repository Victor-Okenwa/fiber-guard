import type { Channel, CkbInvoice, NodeInfo, PaymentResult, PeerInfo } from '@ckb-ccc/fiber';
import {
  type ChannelInfo,
  channelCapacity,
  type ParsedInvoice,
  type PaymentInfo,
  parseHexAmount,
  type PeerInfo as SharedPeerInfo,
} from '@fiberguard/shared';

export function mapNodeInfo(info: NodeInfo) {
  return {
    version: info.version,
    pubkey: info.pubkey,
    peerCount: parseHexAmount(info.peersCount),
    channelCount: parseHexAmount(info.channelCount),
    pendingChannelCount: parseHexAmount(info.pendingChannelCount),
  };
}

export function mapChannel(channel: Channel): ChannelInfo {
  const localBalance = parseHexAmount(channel.localBalance);
  const remoteBalance = parseHexAmount(channel.remoteBalance);
  return {
    channelId: String(channel.channelId),
    pubkey: channel.pubkey,
    stateName: channel.state.stateName,
    localBalance,
    remoteBalance,
    capacity: channelCapacity(localBalance, remoteBalance),
    isPublic: channel.isPublic,
    enabled: channel.enabled,
  };
}

export function mapPeer(peer: PeerInfo): SharedPeerInfo {
  return {
    pubkey: peer.pubkey,
    address: peer.address,
  };
}

export function mapPayment(payment: PaymentResult): PaymentInfo {
  return {
    paymentHash: String(payment.paymentHash),
    status: payment.status,
    fee: parseHexAmount(payment.fee),
    failedError: payment.failedError,
    createdAt: parseHexAmount(payment.createdAt),
    lastUpdatedAt: parseHexAmount(payment.lastUpdatedAt),
  };
}

export function mapParsedInvoice(invoice: string, parsed: CkbInvoice): ParsedInvoice {
  const descriptionAttr = parsed.data.attrs.find(
    (attr): attr is { description: string } => 'description' in attr,
  );

  return {
    invoice,
    amount: parsed.amount ? parseHexAmount(parsed.amount) : undefined,
    currency: parsed.currency,
    description: descriptionAttr?.description,
    paymentHash: String(parsed.data.paymentHash),
  };
}
