import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PeersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Peers</h1>
        <p className="text-muted-foreground">Connected peers and connection status.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Peer list</CardTitle>
          <CardDescription>Phase 4 will render a table from /api/peers.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No peers loaded yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
