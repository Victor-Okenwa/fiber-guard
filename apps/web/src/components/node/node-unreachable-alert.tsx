import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface NodeUnreachableAlertProps {
  remediation?: string;
}

export function NodeUnreachableAlert({ remediation }: NodeUnreachableAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Cannot reach Fiber node</AlertTitle>
      <AlertDescription>
        <p>Is your Fiber node running on port 8227?</p>
        <p className="mt-2 text-sm">
          {remediation ??
            'Check that FIBER_RPC_URL is correct and the node JSON-RPC is enabled. See docs/demo-setup.md.'}
        </p>
      </AlertDescription>
    </Alert>
  );
}
