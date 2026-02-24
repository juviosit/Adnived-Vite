import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { ArrowLeft, ArrowUp, ArrowDown, Users, Eye, MousePointerClick, Clock, Copy, Code } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const SiteAnalytics = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const { user, signOut } = useAuth();
  const [site, setSite] = useState<{ id: string; domain: string; name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageviews, setPageviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!siteId) return;

      const { data: siteData } = await supabase
        .from("sites")
        .select("id, domain, name")
        .eq("id", siteId)
        .single();

      if (siteData) setSite(siteData);

      // Fetch last 7 days of pageviews
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: pvData } = await supabase
        .from("pageviews")
        .select("*")
        .eq("site_id", siteId)
        .gte("timestamp", sevenDaysAgo.toISOString())
        .order("timestamp", { ascending: true });

      setPageviews(pvData || []);
      setLoading(false);
    };

    fetchData();
  }, [siteId]);

  // Aggregate data by day
  const chartData = (() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { weekday: "short" });
      days[key] = 0;
    }
    pageviews.forEach((pv) => {
      const key = new Date(pv.timestamp).toLocaleDateString("en-US", { weekday: "short" });
      if (key in days) days[key]++;
    });
    return Object.entries(days).map(([date, visitors]) => ({ date, visitors }));
  })();

  // Compute metrics
  const totalPageviews = pageviews.length;
  const uniqueVisitors = new Set(pageviews.map((p) => p.session_hash).filter(Boolean)).size;
  const topPages = Object.entries(
    pageviews.reduce<Record<string, number>>((acc, pv) => {
      acc[pv.pathname] = (acc[pv.pathname] || 0) + 1;
      return acc;
    }, {})
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topSources = Object.entries(
    pageviews.reduce<Record<string, number>>((acc, pv) => {
      const source = pv.referrer || "Direct";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {})
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const trackingSnippet = `<script defer data-domain="${site?.domain}" src="https://${projectId}.supabase.co/functions/v1/track"></script>`;

  const chartConfig = {
    visitors: { label: "Pageviews", color: "hsl(var(--primary))" },
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Site not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-sm font-bold text-foreground">{site.name || site.domain}</h1>
              <p className="text-xs text-muted-foreground">{site.domain}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Code className="h-4 w-4" />
                  Tracking snippet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Install tracking snippet</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Add this snippet to the <code>&lt;head&gt;</code> of your website:
                </p>
                <div className="relative rounded-lg bg-muted p-4">
                  <code className="text-xs break-all">{trackingSnippet}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => {
                      navigator.clipboard.writeText(trackingSnippet);
                      toast.success("Copied to clipboard!");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Metrics */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Unique Visitors", value: uniqueVisitors, icon: Users },
            { label: "Total Pageviews", value: totalPageviews, icon: Eye },
            { label: "Top Pages", value: topPages.length, icon: MousePointerClick },
            { label: "Sources", value: topSources.length, icon: Clock },
          ].map((m) => (
            <Card key={m.label}>
              <CardContent className="p-4">
                <m.icon className="h-4 w-4 text-muted-foreground" />
                <p className="mt-2 text-2xl font-bold text-foreground">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Pageviews — Last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="fillPV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="visitors" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#fillPV)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Top Pages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet</p>
              ) : (
                topPages.map(([page, count]) => (
                  <div key={page} className="flex items-center justify-between">
                    <span className="truncate text-sm text-foreground">{page}</span>
                    <span className="ml-4 shrink-0 text-sm font-medium text-muted-foreground">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Top Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topSources.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet</p>
              ) : (
                topSources.map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="truncate text-sm text-foreground">{source}</span>
                    <span className="ml-4 shrink-0 text-sm font-medium text-muted-foreground">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SiteAnalytics;
