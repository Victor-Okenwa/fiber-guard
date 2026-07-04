import { assessNodeHealth, getRecommendations } from '@fiberguard/diagnostics';
import { handleApiError } from '@/lib/api-error';
import { fetchNodeSnapshot } from '@/lib/fiber-data';
import { jsonResponse } from '@/lib/json';

export async function GET() {
  try {
    const { node, channels, peers } = await fetchNodeSnapshot();
    const health = assessNodeHealth(node, channels, peers);
    const recommendations = getRecommendations(health, channels, peers);

    return jsonResponse({
      node,
      channels,
      peers,
      health,
      recommendations,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
