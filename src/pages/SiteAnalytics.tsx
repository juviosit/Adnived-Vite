import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import {
  ArrowLeft, Users, Eye, MousePointerClick, Clock, Copy, Code,
  BarChart3, Target, GitBranch, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import GoalsPanel from "@/components/analytics/GoalsPanel";
import { cn } from "@/lib/utils";

type Section = "overview" | "goals" | "funnels";

const NAV_ITEMS: { section: Section; label: string; icon: React.ElementType; group: string }[] = [
  { section: "overview", label: "Overview", icon: BarChart3, group: "Traffic" },
  { section: "goals", label: "Goals", icon: Target, group: "Behavior" },
  { section: "funnels", label: "Funnels", icon: GitBranch, group: "Behavior" },
];

const SiteAnalytics = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const { signOut } = useAuth();
  const [site, setSite] = useState<{ id: string; domain: string; name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageviews, setPageviews] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<Section>("overview");

  useEffect(() => {
    const fetchData = async () => {
      if (!siteId) return;

      const { data: siteData } = await supabase
        .from("sites")
        .select("id, domain, name")
        .eq("id", siteId)
        .single();

      if (siteData) setSite(siteData);

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

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const trackingSnippet = `<script defer data-domain="${site?.domain}" src="https://${projectId}.supabase.co/functions/v1/track"></script>`;

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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-border/50 bg-sidebar-background">
        <div className="flex h-14 items-center gap-2 border-b border-border/50 px-4">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="truncate text-sm font-semibold text-foreground">{site.name || site.domain}</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {Object.entries(
            NAV_ITEMS.reduce<Record<string, typeof NAV_ITEMS>>((groups, item) => {
              (groups[item.group] ??= []).push(item);
              return groups;
            }, {})
          ).map(([group, items]) => (
            <div key={group}>
              <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group}
              </p>
              {items.map((item) => (
                <button
                  key={item.section}
                  onClick={() => setActiveSection(item.section)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                    activeSection === item.section
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-6">
            <div>
              <h1 className="text-lg font-bold text-foreground">{site.name || site.domain}</h1>
              {site.name && (
                <p className="text-xs text-muted-foreground">{site.domain}</p>
              )}
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

        <main className="p-6">
          {activeSection === "overview" && (
            <OverviewSection pageviews={pageviews} />
          )}
          {activeSection === "goals" && siteId && (
            <GoalsPanel siteId={siteId} />
          )}
          {activeSection === "funnels" && (
            <div className="flex items-center justify-center py-20">
              <p className="text-muted-foreground">Funnels coming soon</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

/* ── Overview Section ────────────────────────────────── */

function OverviewSection({ pageviews }: { pageviews: any[] }) {
  const totalPageviews = pageviews.length;
  const uniqueVisitors = new Set(pageviews.map((p) => p.session_hash).filter(Boolean)).size;

  // Compute previous 7-day data for comparison
  const now = new Date();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const currentStart = new Date(now.getTime() - sevenDaysMs);

  const chartData = useMemo(() => {
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
  }, [pageviews]);

  const topPages = useMemo(() => {
    return Object.entries(
      pageviews.reduce<Record<string, number>>((acc, pv) => {
        acc[pv.pathname] = (acc[pv.pathname] || 0) + 1;
        return acc;
      }, {})
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [pageviews]);

  const topSources = useMemo(() => {
    return Object.entries(
      pageviews.reduce<Record<string, number>>((acc, pv) => {
        const source = pv.referrer || "Direct";
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {})
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [pageviews]);

  const topBrowsers = useMemo(() => {
    return Object.entries(
      pageviews.reduce<Record<string, number>>((acc, pv) => {
        const b = pv.browser || "Unknown";
        acc[b] = (acc[b] || 0) + 1;
        return acc;
      }, {})
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [pageviews]);

  const topOS = useMemo(() => {
    return Object.entries(
      pageviews.reduce<Record<string, number>>((acc, pv) => {
        const o = pv.os || "Unknown";
        acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {})
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [pageviews]);

  const chartConfig = {
    visitors: { label: "Pageviews", color: "hsl(var(--primary))" },
  };

  const metrics = [
    { label: "Unique Visitors", value: uniqueVisitors, icon: Users },
    { label: "Total Pageviews", value: totalPageviews, icon: Eye },
    { label: "Top Pages", value: topPages.length, icon: MousePointerClick },
    { label: "Sources", value: topSources.length, icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{m.label}</p>
                <m.icon className="h-4 w-4 text-muted-foreground/50" />
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Pageviews — Last 7 days</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
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

      {/* Breakdown grid — 2x2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <BreakdownCard title="Top Pages" data={topPages} />
        <BreakdownCard title="Top Sources" data={topSources} />
        <BreakdownCard title="Browsers" data={topBrowsers} />
        <BreakdownCard title="Operating Systems" data={topOS} />
      </div>
    </div>
  );
}

/* ── Breakdown Card ──────────────────────────────────── */

function BreakdownCard({ title, data }: { title: string; data: [string, number][] }) {
  const max = data[0]?.[1] || 1;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet</p>
        ) : (
          data.map(([label, count]) => (
            <div key={label} className="group relative">
              <div
                className="absolute inset-y-0 left-0 rounded bg-primary/10 transition-all"
                style={{ width: `${(count / max) * 100}%` }}
              />
              <div className="relative flex items-center justify-between px-2.5 py-1.5">
                <span className="truncate text-sm text-foreground">{label}</span>
                <span className="ml-4 shrink-0 text-sm font-medium text-muted-foreground">{count}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default SiteAnalytics;
