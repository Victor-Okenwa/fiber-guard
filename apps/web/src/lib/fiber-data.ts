import { getFiberClient } from '@/lib/fiber';

export async function fetchNodeSnapshot() {
  const client = getFiberClient();
  const [node, channels, peers] = await Promise.all([
    client.getNodeInfo(),
    client.listChannels(),
    client.listPeers(),
  ]);
  return { node, channels, peers };
}
