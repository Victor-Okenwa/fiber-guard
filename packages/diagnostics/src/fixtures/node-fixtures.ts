import type { ChannelInfo, PeerInfo } from '@fiberguard/shared';

export const healthyNodeInfo = {
  version: '0.9.0-rc5',
  pubkey: '02e87dde88c1dfc99d18eee8f503078634371b37db294233e9a526dd2d2367f017',
  peerCount: 3n,
  channelCount: 1n,
  pendingChannelCount: 0n,
};

export const samplePeers: PeerInfo[] = [
  {
    pubkey: '0313dcf9cf18711b1b473a78ea56222dc44dcbfdf559d24dd937a0657d3bcb108f',
    address: '/ip4/16.163.7.105/tcp/8228/p2p/QmdyQWjPtbK4NWWsvy8s69NGJaQULwgeQDT5ZpNDrTNaeV',
  },
];

export const readyChannel: ChannelInfo = {
  channelId: '0xabc123',
  pubkey: '0313dcf9',
  stateName: 'ChannelReady',
  localBalance: 500_000_000n,
  remoteBalance: 200_000_000n,
  capacity: 700_000_000n,
  isPublic: true,
  enabled: true,
};

export const emptyPeers: PeerInfo[] = [];
export const emptyChannels: ChannelInfo[] = [];
