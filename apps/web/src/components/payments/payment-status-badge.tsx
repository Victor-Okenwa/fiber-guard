import type { PaymentStatus } from '@fiberguard/shared';
import { Badge } from '@/components/ui/badge';

const variants: Record<PaymentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Created: 'secondary',
  Inflight: 'outline',
  Success: 'default',
  Failed: 'destructive',
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={variants[status]}>{status}</Badge>;
}
