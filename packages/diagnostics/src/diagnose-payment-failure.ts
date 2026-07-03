import type { ChannelInfo, Diagnostic, PaymentInfo, PeerInfo } from '@fiberguard/shared';
import { DIAGNOSTIC_CODES } from '@fiberguard/shared';

interface FailurePattern {
  match: RegExp;
  code: string;
  title: string;
  explanation: string;
  remediation: string;
}

const FAILURE_PATTERNS: FailurePattern[] = [
  {
    match: /route|path|no.*hop|unreachable/i,
    code: DIAGNOSTIC_CODES.ROUTE_NOT_FOUND,
    title: 'No viable route',
    explanation:
      'The payment could not find a path through the network with sufficient liquidity and connectivity.',
    remediation:
      'Connect to more peers, open public channels, or ensure outbound liquidity toward the destination.',
  },
  {
    match: /liquidity|insufficient|balance|capacity/i,
    code: DIAGNOSTIC_CODES.INSUFFICIENT_LIQUIDITY,
    title: 'Insufficient liquidity',
    explanation:
      'A channel along the route did not have enough balance in the required direction to forward this payment.',
    remediation: 'Rebalance channels, increase funding, or reduce the payment amount.',
  },
  {
    match: /peer|connect|offline|timeout/i,
    code: DIAGNOSTIC_CODES.PEER_UNREACHABLE,
    title: 'Peer connectivity issue',
    explanation: 'A peer along the payment path was unreachable or did not respond in time.',
    remediation: 'Check peer connections with list_peers and reconnect if needed.',
  },
];

export function diagnosePaymentFailure(
  payment: PaymentInfo,
  channels: ChannelInfo[] = [],
  peers: PeerInfo[] = [],
): Diagnostic[] {
  if (payment.status !== 'Failed') {
    return [];
  }

  const raw = payment.failedError?.trim();
  if (!raw) {
    return [
      {
        code: DIAGNOSTIC_CODES.PAYMENT_FAILED,
        severity: 'error',
        title: 'Payment failed',
        explanation: 'The payment failed but the node did not return a detailed error message.',
        remediation: 'Check node logs and channel states for more context.',
        context: { paymentHash: payment.paymentHash },
      },
    ];
  }

  for (const pattern of FAILURE_PATTERNS) {
    if (pattern.match.test(raw)) {
      return [
        {
          code: pattern.code,
          severity: 'error',
          title: pattern.title,
          explanation: pattern.explanation,
          remediation: pattern.remediation,
          context: {
            paymentHash: payment.paymentHash,
            failedError: raw,
            channelCount: channels.length,
            peerCount: peers.length,
          },
        },
      ];
    }
  }

  return [
    {
      code: DIAGNOSTIC_CODES.PAYMENT_FAILED,
      severity: 'error',
      title: 'Payment failed',
      explanation: `The node reported: ${raw}`,
      remediation:
        'Review channel liquidity, peer connectivity, and invoice amount. See Fiber docs troubleshooting.',
      context: { paymentHash: payment.paymentHash, failedError: raw },
    },
  ];
}
