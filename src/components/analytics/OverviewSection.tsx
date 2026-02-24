import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, Bar, BarChart } from "recharts";
import { Users, Eye, ArrowDownUp, Clock, CalendarDays, Monitor, Smartphone, Globe, Link2, BarChart3, Timer } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format, subDays, subHours, startOfDay, differenceInDays, differenceInSeconds } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

type RangePreset = "24h" | "7d" | "30d" | "lifetime" | "custom";

interface OverviewSectionProps {
  siteId: string;
}

export default function OverviewSection({ siteId }: OverviewSectionProps) {
  const [preset, setPreset] = useState<RangePreset>("7d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [pageviews, setPageviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const dateRange = useMemo(() => {
    const now = new Date();
    switch (preset) {
      case "24h": return { from: subHours(now, 24), to: now };
      case "7d": return { from: subDays(now, 7), to: now };
      case "30d": return { from: subDays(now, 30), to: now };
      case "lifetime": return { from: null, to: now };
      case "custom": return { from: customRange?.from || subDays(now, 7), to: customRange?.to || now };
    }
  }, [preset, customRange]);

  useEffect(() => {
    const fetchPV = async () => {
      setLoading(true);
      let query = supabase
        .from("pageviews")
        .select("*")
        .eq("site_id", siteId)
        .order("timestamp", { ascending: true });
      if (dateRange.from) query = query.gte("timestamp", dateRange.from.toISOString());
      query = query.lte("timestamp", dateRange.to.toISOString());
      const { data } = await query;
      setPageviews(data || []);
      setLoading(false);
    };
    fetchPV();
  }, [siteId, dateRange]);

  // ---- Computed metrics ----
  const totalPageviews = pageviews.length;
  const sessions = useMemo(() => {
    const map: Record<string, any[]> = {};
    pageviews.forEach((pv) => {
      const key = pv.session_hash || pv.id;
      (map[key] ??= []).push(pv);
    });
    return map;
  }, [pageviews]);

  const uniqueVisitors = Object.keys(sessions).length;

  const bounceRate = useMemo(() => {
    const total = Object.keys(sessions).length;
    if (total === 0) return 0;
    const bounced = Object.values(sessions).filter((s) => s.length === 1).length;
    return Math.round((bounced / total) * 100);
  }, [sessions]);

  const avgDuration = useMemo(() => {
    const durations = Object.values(sessions)
      .filter((s) => s.length > 1)
      .map((s) => {
        const sorted = s.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return differenceInSeconds(new Date(sorted[sorted.length - 1].timestamp), new Date(sorted[0].timestamp));
      });
    if (durations.length === 0) return "0s";
    const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    if (avg < 60) return `${avg}s`;
    return `${Math.floor(avg / 60)}m ${avg % 60}s`;
  }, [sessions]);

  const pagesPerSession = useMemo(() => {
    const total = Object.keys(sessions).length;
    if (total === 0) return "0";
    return (totalPageviews / total).toFixed(1);
  }, [sessions, totalPageviews]);

  // ---- Chart data ----
  const chartData = useMemo(() => {
    if (pageviews.length === 0) return [];
    const from = dateRange.from || new Date(pageviews[0]?.timestamp || Date.now());
    const to = dateRange.to;
    const totalDays = Math.max(1, differenceInDays(to, from));

    if (preset === "24h") {
      const hours: Record<string, number> = {};
      for (let i = 23; i >= 0; i--) {
        const key = format(subHours(new Date(), i), "ha");
        hours[key] = 0;
      }
      pageviews.forEach((pv) => { const key = format(new Date(pv.timestamp), "ha"); if (key in hours) hours[key]++; });
      return Object.entries(hours).map(([date, visitors]) => ({ date, visitors }));
    }

    const days: Record<string, number> = {};
    for (let i = totalDays; i >= 0; i--) {
      const key = format(subDays(to, i), "MMM d");
      days[key] = 0;
    }
    pageviews.forEach((pv) => { const key = format(new Date(pv.timestamp), "MMM d"); if (key in days) days[key]++; });
    return Object.entries(days).map(([date, visitors]) => ({ date, visitors }));
  }, [pageviews, dateRange, preset]);

  // ---- Breakdowns ----
  const topPages = useMemo(() => aggregate(pageviews, "pathname"), [pageviews]);
  const topSources = useMemo(() => aggregate(pageviews, "referrer", "Direct"), [pageviews]);
  const topBrowsers = useMemo(() => aggregate(pageviews, "browser", "Unknown"), [pageviews]);
  const topOS = useMemo(() => aggregate(pageviews, "os", "Unknown"), [pageviews]);
  const topDevices = useMemo(() => aggregate(pageviews, "device_type", "Desktop"), [pageviews]);
  const topCountries = useMemo(() => aggregate(pageviews, "country", "Unknown"), [pageviews]);
  const topRegions = useMemo(() => aggregate(pageviews, "region", "Unknown"), [pageviews]);
  const topCities = useMemo(() => aggregate(pageviews, "city", "Unknown"), [pageviews]);

  const channels = useMemo(() => {
    const map: Record<string, number> = {};
    pageviews.forEach((pv) => {
      const channel = deriveChannel(pv.utm_medium, pv.utm_source, pv.referrer);
      map[channel] = (map[channel] || 0) + 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 10) as [string, number][];
  }, [pageviews]);

  const utmSources = useMemo(() => aggregate(pageviews, "utm_source", "(none)"), [pageviews]);
  const utmMediums = useMemo(() => aggregate(pageviews, "utm_medium", "(none)"), [pageviews]);
  const utmCampaigns = useMemo(() => aggregate(pageviews, "utm_campaign", "(none)"), [pageviews]);

  const hourlyDistribution = useMemo(() => {
    const hours: Record<string, number> = {};
    for (let i = 0; i < 24; i++) hours[`${i.toString().padStart(2, "0")}:00`] = 0;
    pageviews.forEach((pv) => {
      const h = new Date(pv.timestamp).getHours();
      const key = `${h.toString().padStart(2, "0")}:00`;
      hours[key]++;
    });
    return Object.entries(hours).map(([hour, count]) => ({ hour, count }));
  }, [pageviews]);

  const dayOfWeekDistribution = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const map: Record<string, number> = {};
    days.forEach((d) => (map[d] = 0));
    pageviews.forEach((pv) => {
      const d = days[new Date(pv.timestamp).getDay()];
      map[d]++;
    });
    return days.map((day) => ({ day, count: map[day] }));
  }, [pageviews]);

  const rangeLabel = useMemo(() => {
    switch (preset) {
      case "24h": return "Last 24 hours";
      case "7d": return "Last 7 days";
      case "30d": return "Last 30 days";
      case "lifetime": return "Lifetime";
      case "custom":
        if (customRange?.from && customRange?.to)
          return `${format(customRange.from, "MMM d")} – ${format(customRange.to, "MMM d, yyyy")}`;
        return "Custom range";
    }
  }, [preset, customRange]);

  const chartConfig = { visitors: { label: "Pageviews", color: "hsl(var(--primary))" } };
  const barConfig = { count: { label: "Pageviews", color: "hsl(var(--primary))" } };

  const metrics = [
    { label: "Unique Visitors", value: uniqueVisitors, icon: Users },
    { label: "Total Pageviews", value: totalPageviews, icon: Eye },
    { label: "Bounce Rate", value: `${bounceRate}%`, icon: ArrowDownUp },
    { label: "Avg. Duration", value: avgDuration, icon: Timer },
    { label: "Pages / Session", value: pagesPerSession, icon: BarChart3 },
    { label: "Sources", value: topSources.length, icon: Link2 },
  ];

  return (
    <div className="space-y-6">
      {/* Date range selector */}
      <div className="flex items-center gap-2">
        <Select value={preset} onValueChange={(v) => setPreset(v as RangePreset)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="lifetime">Lifetime</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
        {preset === "custom" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                {customRange?.from && customRange?.to
                  ? `${format(customRange.from, "MMM d")} – ${format(customRange.to, "MMM d")}`
                  : "Pick dates"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="range" selected={customRange} onSelect={setCustomRange} numberOfMonths={2} disabled={(date) => date > new Date()} className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((m) => (
          <Card key={m.label} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                <m.icon className="h-3.5 w-3.5 text-muted-foreground/50" />
              </div>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
                {loading ? "…" : m.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pageviews chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Pageviews — {rangeLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-[260px] items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
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
          )}
        </CardContent>
      </Card>

      {/* Time patterns */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> Visits by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="h-[200px] w-full">
              <BarChart data={hourlyDistribution} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval={2} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Visits by Day of Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="h-[200px] w-full">
              <BarChart data={dayOfWeekDistribution} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pages & Referrals */}
      <div className="grid gap-6 md:grid-cols-2">
        <BreakdownCard title="Top Pages" data={topPages} />
        <BreakdownCard title="Referrers" data={topSources} />
      </div>

      {/* Channels & UTMs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2"><Link2 className="h-4 w-4" /> Acquisition</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="channels" className="w-full">
            <TabsList className="mb-3">
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="sources">UTM Sources</TabsTrigger>
              <TabsTrigger value="mediums">UTM Mediums</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            </TabsList>
            <TabsContent value="channels"><BreakdownList data={channels} /></TabsContent>
            <TabsContent value="sources"><BreakdownList data={utmSources} /></TabsContent>
            <TabsContent value="mediums"><BreakdownList data={utmMediums} /></TabsContent>
            <TabsContent value="campaigns"><BreakdownList data={utmCampaigns} /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Technology */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2"><Monitor className="h-4 w-4" /> Technology</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="browsers" className="w-full">
            <TabsList className="mb-3">
              <TabsTrigger value="browsers">Browsers</TabsTrigger>
              <TabsTrigger value="os">OS</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
            </TabsList>
            <TabsContent value="browsers"><BreakdownList data={topBrowsers} /></TabsContent>
            <TabsContent value="os"><BreakdownList data={topOS} /></TabsContent>
            <TabsContent value="devices"><BreakdownList data={topDevices} /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Locations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2"><Globe className="h-4 w-4" /> Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="countries" className="w-full">
            <TabsList className="mb-3">
              <TabsTrigger value="countries">Countries</TabsTrigger>
              <TabsTrigger value="regions">Regions</TabsTrigger>
              <TabsTrigger value="cities">Cities</TabsTrigger>
            </TabsList>
            <TabsContent value="countries"><BreakdownList data={topCountries} /></TabsContent>
            <TabsContent value="regions"><BreakdownList data={topRegions} /></TabsContent>
            <TabsContent value="cities"><BreakdownList data={topCities} /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Helpers ----

function aggregate(items: any[], key: string, fallback?: string): [string, number][] {
  return Object.entries(
    items.reduce<Record<string, number>>((acc, item) => {
      const val = item[key] || fallback || "(empty)";
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {})
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
}

function deriveChannel(medium?: string | null, source?: string | null, referrer?: string | null): string {
  const m = (medium || "").toLowerCase();
  const s = (source || "").toLowerCase();
  const r = (referrer || "").toLowerCase();

  if (m === "cpc" || m === "ppc" || m === "paid") return "Paid Search";
  if (m === "social" || m === "paid_social") return "Social";
  if (m === "email") return "Email";
  if (m === "affiliate") return "Affiliate";
  if (m === "display") return "Display";
  if (m || s) return "Other Campaign";

  if (!r || r === "direct") return "Direct";
  if (/google|bing|yahoo|duckduckgo|baidu|yandex/.test(r)) return "Organic Search";
  if (/facebook|twitter|linkedin|instagram|tiktok|reddit|youtube|pinterest/.test(r)) return "Social";
  return "Referral";
}

function BreakdownCard({ title, data }: { title: string; data: [string, number][] }) {
  const max = data[0]?.[1] || 1;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <BreakdownList data={data} />
      </CardContent>
    </Card>
  );
}

function BreakdownList({ data }: { data: [string, number][] }) {
  const max = data[0]?.[1] || 1;
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No data yet</p>;
  return (
    <div className="space-y-1.5">
      {data.map(([label, count]) => (
        <div key={label} className="group relative">
          <div className="absolute inset-y-0 left-0 rounded bg-primary/10 transition-all" style={{ width: `${(count / max) * 100}%` }} />
          <div className="relative flex items-center justify-between px-2.5 py-1.5">
            <span className="truncate text-sm text-foreground">{label}</span>
            <span className="ml-4 shrink-0 text-sm font-medium text-muted-foreground">{count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
