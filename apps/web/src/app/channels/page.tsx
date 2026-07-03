import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ChannelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Channels</h1>
        <p className="text-muted-foreground">Channel state, balances, and liquidity.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Channel list</CardTitle>
          <CardDescription>Phase 4 will render a table from /api/channels.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No channels loaded yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
