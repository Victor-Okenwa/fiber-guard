import type { FiberClient, FiberNodeSummary } from '@fiberguard/fiber-rpc';
import type { ChannelInfo, PeerInfo } from '@fiberguard/shared';

export interface NodeSnapshot {
  node: FiberNodeSummary;
  channels: ChannelInfo[];
  peers: PeerInfo[];
}

export async function fetchNodeSnapshot(client: FiberClient): Promise<NodeSnapshot> {
  const [node, channels, peers] = await Promise.all([
    client.getNodeInfo(),
    client.listChannels(),
    client.listPeers(),
  ]);
  return { node, channels, peers };
}
