import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import {
  Users, Eye, ArrowDownUp, Clock, CalendarDays, Monitor, Globe, Link2, Timer,
  TrendingUp, TrendingDown, X, Search,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format, subDays, subHours, startOfDay, differenceInDays, differenceInSeconds, differenceInHours } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

type RangePreset = "realtime" | "24h" | "7d" | "30d" | "lifetime" | "custom";

interface OverviewSectionProps {
  siteId: string;
  defaultPreset?: RangePreset;
}

interface Filter {
  type: "source" | "country" | "page" | "browser" | "os" | "device" | "region" | "city" | "utm_source" | "utm_medium" | "utm_campaign";
  value: string;
}

export default function OverviewSection({ siteId, defaultPreset = "30d" }: OverviewSectionProps) {
  const [preset, setPreset] = useState<RangePreset>(defaultPreset);
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [pageviews, setPageviews] = useState<any[]>([]);
  const [prevPageviews, setPrevPageviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filter[]>([]);

  const dateRange = useMemo(() => {
    const now = new Date();
    switch (preset) {
      case "realtime": return { from: subDays(now, 0), to: now }; // Will use special handling
      case "24h": return { from: subHours(now, 24), to: now };
      case "7d": return { from: subDays(now, 7), to: now };
      case "30d": return { from: subDays(now, 30), to: now };
      case "lifetime": return { from: null, to: now };
      case "custom": return { from: customRange?.from || subDays(now, 7), to: customRange?.to || now };
    }
  }, [preset, customRange]);

  // Compute the previous comparison period
  const prevDateRange = useMemo(() => {
    if (!dateRange.from || preset === "lifetime" || preset === "realtime") return null;
    const duration = dateRange.to.getTime() - dateRange.from.getTime();
    return { from: new Date(dateRange.from.getTime() - duration), to: dateRange.from };
  }, [dateRange, preset]);

  useEffect(() => {
    const fetchPV = async () => {
      setLoading(true);

      // Fetch current period
      let query = supabase
        .from("pageviews")
        .select("*")
        .eq("site_id", siteId)
        .order("timestamp", { ascending: true });
      if (dateRange.from) query = query.gte("timestamp", dateRange.from.toISOString());
      query = query.lte("timestamp", dateRange.to.toISOString());
      const { data } = await query;
      setPageviews(data || []);

      // Fetch previous period for comparison
      if (prevDateRange) {
        let prevQuery = supabase
          .from("pageviews")
          .select("session_hash, pathname, referrer, timestamp")
          .eq("site_id", siteId)
          .gte("timestamp", prevDateRange.from.toISOString())
          .lte("timestamp", prevDateRange.to.toISOString());
        const { data: prevData } = await prevQuery;
        setPrevPageviews(prevData || []);
      } else {
        setPrevPageviews([]);
      }

      setLoading(false);
    };
    fetchPV();
  }, [siteId, dateRange, prevDateRange]);

  // Apply filters
  const filteredPageviews = useMemo(() => {
    if (filters.length === 0) return pageviews;
    return pageviews.filter((pv) =>
      filters.every((f) => {
        switch (f.type) {
          case "source": {
            const ref = pv.referrer || "Direct";
            return ref.toLowerCase().includes(f.value.toLowerCase());
          }
          case "country": return pv.country === f.value;
          case "page": return pv.pathname === f.value;
          case "browser": return pv.browser === f.value;
          case "os": return pv.os === f.value;
          case "device": return pv.device_type === f.value;
          case "region": return pv.region === f.value;
          case "city": return pv.city === f.value;
          case "utm_source": return pv.utm_source === f.value;
          case "utm_medium": return pv.utm_medium === f.value;
          case "utm_campaign": return pv.utm_campaign === f.value;
          default: return true;
        }
      })
    );
  }, [pageviews, filters]);

  // ---- Computed metrics ----
  const totalPageviews = filteredPageviews.length;
  const sessions = useMemo(() => {
    const map: Record<string, any[]> = {};
    filteredPageviews.forEach((pv) => {
      const key = pv.session_hash || pv.id;
      (map[key] ??= []).push(pv);
    });
    return map;
  }, [filteredPageviews]);

  const uniqueVisitors = Object.keys(sessions).length;
  const totalVisits = Object.keys(sessions).length;

  const viewsPerVisit = useMemo(() => {
    if (totalVisits === 0) return "0.00";
    return (totalPageviews / totalVisits).toFixed(2);
  }, [totalPageviews, totalVisits]);

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
    if (avg >= 3600) return `${Math.floor(avg / 3600)}h ${Math.floor((avg % 3600) / 60)}m`;
    if (avg >= 60) return `${Math.floor(avg / 60)}m ${avg % 60}s`;
    return `${avg}s`;
  }, [sessions]);

  // Previous period metrics for comparison
  const prevSessions = useMemo(() => {
    const map: Record<string, any[]> = {};
    prevPageviews.forEach((pv) => {
      const key = pv.session_hash || "unknown";
      (map[key] ??= []).push(pv);
    });
    return map;
  }, [prevPageviews]);

  const prevUniqueVisitors = Object.keys(prevSessions).length;
  const prevTotalVisits = Object.keys(prevSessions).length;
  const prevTotalPageviews = prevPageviews.length;
  const prevViewsPerVisit = prevTotalVisits > 0 ? prevTotalPageviews / prevTotalVisits : 0;
  const prevBounceRate = useMemo(() => {
    const total = Object.keys(prevSessions).length;
    if (total === 0) return 0;
    const bounced = Object.values(prevSessions).filter((s) => s.length === 1).length;
    return Math.round((bounced / total) * 100);
  }, [prevSessions]);

  function pctChange(current: number, previous: number): number | null {
    if (previous === 0 && current === 0) return null;
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  }

  // ---- Chart data ----
  const chartData = useMemo(() => {
    if (filteredPageviews.length === 0) return [];
    const from = dateRange.from || new Date(filteredPageviews[0]?.timestamp || Date.now());
    const to = dateRange.to;
    const totalDays = Math.max(1, differenceInDays(to, from));

    if (preset === "24h" || preset === "realtime") {
      const hours: Record<string, number> = {};
      for (let i = 23; i >= 0; i--) {
        const key = format(subHours(new Date(), i), "ha");
        hours[key] = 0;
      }
      filteredPageviews.forEach((pv) => { const key = format(new Date(pv.timestamp), "ha"); if (key in hours) hours[key]++; });
      return Object.entries(hours).map(([date, visitors]) => ({ date, visitors }));
    }

    const days: Record<string, number> = {};
    for (let i = totalDays; i >= 0; i--) {
      const key = format(subDays(to, i), "MMM d");
      days[key] = 0;
    }
    filteredPageviews.forEach((pv) => { const key = format(new Date(pv.timestamp), "MMM d"); if (key in days) days[key]++; });
    return Object.entries(days).map(([date, visitors]) => ({ date, visitors }));
  }, [filteredPageviews, dateRange, preset]);

  // ---- Breakdowns ----
  const topPages = useMemo(() => aggregate(filteredPageviews, "pathname"), [filteredPageviews]);

  const entryPages = useMemo(() => {
    const entries: Record<string, number> = {};
    Object.values(sessions).forEach((pvs) => {
      const sorted = pvs.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const entry = sorted[0]?.pathname || "/";
      entries[entry] = (entries[entry] || 0) + 1;
    });
    return Object.entries(entries).sort(([, a], [, b]) => b - a).slice(0, 10) as [string, number][];
  }, [sessions]);

  const exitPages = useMemo(() => {
    const exits: Record<string, number> = {};
    Object.values(sessions).forEach((pvs) => {
      const sorted = pvs.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const exit = sorted[sorted.length - 1]?.pathname || "/";
      exits[exit] = (exits[exit] || 0) + 1;
    });
    return Object.entries(exits).sort(([, a], [, b]) => b - a).slice(0, 10) as [string, number][];
  }, [sessions]);

  const topSources = useMemo(() => aggregate(filteredPageviews, "referrer", "Direct"), [filteredPageviews]);
  const topBrowsers = useMemo(() => aggregate(filteredPageviews, "browser", "Unknown"), [filteredPageviews]);
  const topOS = useMemo(() => aggregate(filteredPageviews, "os", "Unknown"), [filteredPageviews]);
  const topDevices = useMemo(() => aggregate(filteredPageviews, "device_type", "Desktop"), [filteredPageviews]);
  const topCountries = useMemo(() => aggregate(filteredPageviews, "country", "Unknown"), [filteredPageviews]);
  const topRegions = useMemo(() => aggregate(filteredPageviews, "region", "Unknown"), [filteredPageviews]);
  const topCities = useMemo(() => aggregate(filteredPageviews, "city", "Unknown"), [filteredPageviews]);

  const channels = useMemo(() => {
    const map: Record<string, number> = {};
    filteredPageviews.forEach((pv) => {
      const channel = deriveChannel(pv.utm_medium, pv.utm_source, pv.referrer);
      map[channel] = (map[channel] || 0) + 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 10) as [string, number][];
  }, [filteredPageviews]);

  const utmSources = useMemo(() => aggregate(filteredPageviews, "utm_source", "(none)"), [filteredPageviews]);
  const utmMediums = useMemo(() => aggregate(filteredPageviews, "utm_medium", "(none)"), [filteredPageviews]);
  const utmCampaigns = useMemo(() => aggregate(filteredPageviews, "utm_campaign", "(none)"), [filteredPageviews]);

  const addFilter = useCallback((type: Filter["type"], value: string) => {
    if (filters.some((f) => f.type === type && f.value === value)) return;
    setFilters((prev) => [...prev, { type, value }]);
  }, [filters]);

  const removeFilter = useCallback((index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const rangeLabel = useMemo(() => {
    switch (preset) {
      case "realtime": return "Realtime";
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

  const chartConfig = { visitors: { label: "Visitors", color: "hsl(var(--primary))" } };

  const metrics = [
    { label: "Unique Visitors", value: uniqueVisitors, change: pctChange(uniqueVisitors, prevUniqueVisitors), icon: Users },
    { label: "Total Visits", value: totalVisits, change: pctChange(totalVisits, prevTotalVisits), icon: Eye },
    { label: "Total Pageviews", value: totalPageviews, change: pctChange(totalPageviews, prevTotalPageviews), icon: Eye },
    { label: "Views per Visit", value: viewsPerVisit, change: pctChange(parseFloat(viewsPerVisit), prevViewsPerVisit), icon: Eye },
    { label: "Bounce Rate", value: `${bounceRate}%`, change: pctChange(bounceRate, prevBounceRate), invertColor: true, icon: ArrowDownUp },
    { label: "Visit Duration", value: avgDuration, change: null, icon: Timer },
  ];

  return (
    <div className="space-y-6">
      {/* Date range selector + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={preset} onValueChange={(v) => setPreset(v as RangePreset)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="realtime">Realtime</SelectItem>
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

        {/* Active filters */}
        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            {filters.map((f, i) => (
              <Badge key={i} variant="secondary" className="gap-1 text-xs">
                <span className="text-muted-foreground">{f.type}:</span> {f.value}
                <button onClick={() => removeFilter(i)} className="ml-0.5 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground" onClick={() => setFilters([])}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Metric bar — Plausible-style horizontal strip */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-lg border border-border bg-card p-4">
        {metrics.map((m, i) => (
          <button
            key={m.label}
            className={cn(
              "group flex flex-col items-start text-left",
              i === 0 && "min-w-[100px]"
            )}
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {loading ? "…" : m.value}
              </span>
              {m.change !== null && m.change !== undefined && !loading && (
                <ChangeIndicator value={m.change} invert={m.invertColor} />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Main chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Visitors — {rangeLabel}</CardTitle>
            <span className="text-xs text-muted-foreground">
              {preset !== "24h" && preset !== "realtime" ? "Days" : "Hours"}
            </span>
          </div>
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

      {/* Two-column: Sources | Pages (Plausible-style) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sources column */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Link2 className="h-4 w-4" /> Acquisition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="channels" className="w-full">
              <TabsList className="mb-3">
                <TabsTrigger value="channels">Channels</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
                <TabsTrigger value="campaigns" className="hidden sm:inline-flex">Campaigns</TabsTrigger>
              </TabsList>
              <TabsContent value="channels">
                <BreakdownList data={channels} onFilter={(v) => addFilter("source", v)} />
              </TabsContent>
              <TabsContent value="sources">
                <BreakdownList data={topSources} onFilter={(v) => addFilter("source", v)} />
              </TabsContent>
              <TabsContent value="campaigns">
                <Tabs defaultValue="utm_source" className="w-full">
                  <TabsList className="mb-2 h-8">
                    <TabsTrigger value="utm_source" className="text-xs">Source</TabsTrigger>
                    <TabsTrigger value="utm_medium" className="text-xs">Medium</TabsTrigger>
                    <TabsTrigger value="utm_campaign" className="text-xs">Campaign</TabsTrigger>
                  </TabsList>
                  <TabsContent value="utm_source"><BreakdownList data={utmSources} onFilter={(v) => addFilter("utm_source", v)} /></TabsContent>
                  <TabsContent value="utm_medium"><BreakdownList data={utmMediums} onFilter={(v) => addFilter("utm_medium", v)} /></TabsContent>
                  <TabsContent value="utm_campaign"><BreakdownList data={utmCampaigns} onFilter={(v) => addFilter("utm_campaign", v)} /></TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Pages column */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="top" className="w-full">
              <TabsList className="mb-3">
                <TabsTrigger value="top">Top Pages</TabsTrigger>
                <TabsTrigger value="entry">Entry Pages</TabsTrigger>
                <TabsTrigger value="exit">Exit Pages</TabsTrigger>
              </TabsList>
              <TabsContent value="top">
                <BreakdownList data={topPages} onFilter={(v) => addFilter("page", v)} label="Page" countLabel="Visitors" />
              </TabsContent>
              <TabsContent value="entry">
                <BreakdownList data={entryPages} onFilter={(v) => addFilter("page", v)} label="Page" countLabel="Entrances" />
              </TabsContent>
              <TabsContent value="exit">
                <BreakdownList data={exitPages} onFilter={(v) => addFilter("page", v)} label="Page" countLabel="Exits" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Two-column: Locations | Technology */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Locations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" /> Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="countries" className="w-full">
              <TabsList className="mb-3">
                <TabsTrigger value="countries">Countries</TabsTrigger>
                <TabsTrigger value="regions">Regions</TabsTrigger>
                <TabsTrigger value="cities">Cities</TabsTrigger>
              </TabsList>
              <TabsContent value="countries"><BreakdownList data={topCountries} onFilter={(v) => addFilter("country", v)} /></TabsContent>
              <TabsContent value="regions"><BreakdownList data={topRegions} onFilter={(v) => addFilter("region", v)} /></TabsContent>
              <TabsContent value="cities"><BreakdownList data={topCities} onFilter={(v) => addFilter("city", v)} /></TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Technology */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4" /> Technology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="browsers" className="w-full">
              <TabsList className="mb-3">
                <TabsTrigger value="browsers">Browsers</TabsTrigger>
                <TabsTrigger value="os">OS</TabsTrigger>
                <TabsTrigger value="devices">Devices</TabsTrigger>
              </TabsList>
              <TabsContent value="browsers"><BreakdownList data={topBrowsers} onFilter={(v) => addFilter("browser", v)} /></TabsContent>
              <TabsContent value="os"><BreakdownList data={topOS} onFilter={(v) => addFilter("os", v)} /></TabsContent>
              <TabsContent value="devices"><BreakdownList data={topDevices} onFilter={(v) => addFilter("device", v)} /></TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---- Helpers ----

function ChangeIndicator({ value, invert }: { value: number; invert?: boolean }) {
  if (value === 0) return <span className="text-xs text-muted-foreground">0%</span>;
  // For bounce rate, lower is better (invert colors)
  const isPositive = invert ? value < 0 : value > 0;
  return (
    <span className={cn("flex items-center gap-0.5 text-xs font-medium", isPositive ? "text-primary" : "text-destructive")}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(value)}%
    </span>
  );
}

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

function BreakdownList({ data, onFilter, label = "Source", countLabel = "Visitors" }: {
  data: [string, number][];
  onFilter?: (value: string) => void;
  label?: string;
  countLabel?: string;
}) {
  const max = data[0]?.[1] || 1;
  const total = data.reduce((sum, [, count]) => sum + count, 0);

  if (data.length === 0) return <p className="text-sm text-muted-foreground">No data yet</p>;

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between px-2.5 pb-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{countLabel}</span>
      </div>
      {data.map(([name, count]) => {
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
        return (
          <button
            key={name}
            onClick={() => onFilter?.(name)}
            className="group relative w-full text-left"
          >
            <div
              className="absolute inset-y-0 left-0 rounded bg-primary/10 transition-all group-hover:bg-primary/20"
              style={{ width: `${(count / max) * 100}%` }}
            />
            <div className="relative flex items-center justify-between px-2.5 py-1.5">
              <span className="truncate text-sm text-foreground">{name}</span>
              <div className="ml-4 flex shrink-0 items-center gap-2">
                <span className="text-sm font-medium text-foreground">{formatNumber(count)}</span>
                <span className="w-10 text-right text-xs text-muted-foreground">{pct}%</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}
