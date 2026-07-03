import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Node health and diagnostics at a glance.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming in Phase 4</CardTitle>
          <CardDescription>
            Health summary, node info, and top recommendations will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your Fiber node and use the API routes to fetch live data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
