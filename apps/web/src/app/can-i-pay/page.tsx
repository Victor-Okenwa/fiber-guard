import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CanIPayPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Can I Pay?</h1>
        <p className="text-muted-foreground">Predict payment success before sending funds.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Invoice checker</CardTitle>
          <CardDescription>
            Phase 4 will add invoice input and canIPay probability scoring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Paste an invoice to preview amount and blockers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
