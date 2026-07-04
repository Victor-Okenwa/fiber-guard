import { FiberSDK } from '@ckb-ccc/fiber';
import type { ChannelInfo, ParsedInvoice, PaymentInfo, PeerInfo } from '@fiberguard/shared';
import { DEFAULT_FIBER_RPC_URL } from './constants.js';
import { wrapRpcCall } from './errors.js';
import type {
  FiberListPaymentsResponse,
  ListPaymentsParams,
  ListPaymentsResult,
} from './list-payments.js';
import { mapChannel, mapNodeInfo, mapParsedInvoice, mapPayment, mapPeer } from './mappers.js';

export interface FiberClientConfig {
  endpoint?: string;
  timeout?: number;
}

export interface FiberNodeSummary {
  version: string;
  pubkey: string;
  peerCount: bigint;
  channelCount: bigint;
  pendingChannelCount: bigint;
}

export interface FiberClient {
  readonly endpoint: string;
  getNodeInfo(): Promise<FiberNodeSummary>;
  listChannels(): Promise<ChannelInfo[]>;
  listPeers(): Promise<PeerInfo[]>;
  parseInvoice(invoice: string): Promise<ParsedInvoice>;
  getPayment(paymentHash: string): Promise<PaymentInfo>;
  listPayments(params?: ListPaymentsParams): Promise<ListPaymentsResult>;
}

export function createFiberClient(config: FiberClientConfig = {}): FiberClient {
  const endpoint = config.endpoint ?? DEFAULT_FIBER_RPC_URL;
  const sdk = new FiberSDK({ endpoint, timeout: config.timeout ?? 10_000 });

  return {
    endpoint,

    getNodeInfo() {
      return wrapRpcCall('getNodeInfo', endpoint, async () => {
        const info = await sdk.getNodeInfo();
        return mapNodeInfo(info);
      });
    },

    listChannels() {
      return wrapRpcCall('listChannels', endpoint, async () => {
        const channels = await sdk.listChannels();
        return channels.map(mapChannel);
      });
    },

    listPeers() {
      return wrapRpcCall('listPeers', endpoint, async () => {
        const peers = await sdk.listPeers();
        return peers.map(mapPeer);
      });
    },

    parseInvoice(invoice: string) {
      return wrapRpcCall('parseInvoice', endpoint, async () => {
        const parsed = await sdk.parseInvoice({ invoice });
        return mapParsedInvoice(invoice, parsed);
      });
    },

    getPayment(paymentHash: string) {
      return wrapRpcCall('getPayment', endpoint, async () => {
        const payment = await sdk.getPayment({ paymentHash });
        return mapPayment(payment);
      });
    },

    listPayments(params: ListPaymentsParams = {}) {
      return wrapRpcCall('listPayments', endpoint, async () => {
        const rpcParams: Record<string, unknown> = {};
        if (params.status !== undefined) rpcParams.status = params.status;
        if (params.limit !== undefined) rpcParams.limit = params.limit;
        if (params.after !== undefined) rpcParams.after = params.after;

        const result = await sdk.rpc.call<FiberListPaymentsResponse>('list_payments', [rpcParams]);
        return {
          payments: result.payments.map(mapPayment),
          lastCursor: result.last_cursor ? String(result.last_cursor) : undefined,
        };
      });
    },
  };
}
