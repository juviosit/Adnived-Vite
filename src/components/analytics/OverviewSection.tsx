import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, Bar, BarChart } from "recharts";
import {
  Users, Eye, ArrowDownUp, Clock, CalendarDays, Monitor, Globe, Link2, Timer,
  TrendingUp, TrendingDown, X, Search, Download, Maximize2,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, subDays, subHours, subMinutes, subMonths, subYears, startOfDay, subWeeks as subWeeksFn, differenceInDays, differenceInSeconds, differenceInHours, differenceInWeeks } from "date-fns";
import { cn } from "@/lib/utils";
import { exportToCSV } from "@/lib/csv-export";
import BreakdownDetails from "./BreakdownDetails";
import WorldMap from "./WorldMap";
import type { DateRange } from "react-day-picker";

type RangePreset = "realtime" | "today" | "yesterday" | "24h" | "48h" | "7d" | "14d" | "30d" | "3m" | "6m" | "12m" | "lifetime" | "custom";
type MetricKey = "visitors" | "visits" | "pageviews" | "views_per_visit" | "bounce_rate" | "duration";
type ChartInterval = "minute" | "hour" | "day" | "week" | "month";

interface OverviewSectionProps {
  siteId: string;
  defaultPreset?: RangePreset;
}

interface Filter {
  type: "source" | "country" | "page" | "browser" | "os" | "device" | "region" | "city" | "utm_source" | "utm_medium" | "utm_campaign" | "utm_term" | "utm_content";
  value: string;
}

export default function OverviewSection({ siteId, defaultPreset = "30d" }: OverviewSectionProps) {
  const [preset, setPreset] = useState<RangePreset>(defaultPreset);
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [pageviews, setPageviews] = useState<any[]>([]);
  const [prevPageviews, setPrevPageviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("visitors");
  const [chartInterval, setChartInterval] = useState<ChartInterval>("day");

  const dateRange = useMemo(() => {
    const now = new Date();
    switch (preset) {
      case "realtime": return { from: subMinutes(now, 5), to: now };
      case "today": return { from: startOfDay(now), to: now };
      case "yesterday": { const y = subDays(now, 1); return { from: startOfDay(y), to: new Date(startOfDay(now).getTime() - 1) }; }
      case "24h": return { from: subHours(now, 24), to: now };
      case "48h": return { from: subHours(now, 48), to: now };
      case "7d": return { from: subDays(now, 7), to: now };
      case "14d": return { from: subDays(now, 14), to: now };
      case "30d": return { from: subDays(now, 30), to: now };
      case "3m": return { from: subMonths(now, 3), to: now };
      case "6m": return { from: subMonths(now, 6), to: now };
      case "12m": return { from: subYears(now, 1), to: now };
      case "lifetime": return { from: null, to: now };
      case "custom": return { from: customRange?.from || subDays(now, 7), to: customRange?.to || now };
    }
  }, [preset, customRange]);

  const prevDateRange = useMemo(() => {
    if (!dateRange.from || preset === "lifetime" || preset === "realtime") return null;
    const duration = dateRange.to.getTime() - dateRange.from.getTime();
    return { from: new Date(dateRange.from.getTime() - duration), to: dateRange.from };
  }, [dateRange, preset]);

  useEffect(() => {
    switch (preset) {
      case "realtime": setChartInterval("minute"); break;
      case "today": setChartInterval("hour"); break;
      case "yesterday": setChartInterval("hour"); break;
      case "24h": setChartInterval("hour"); break;
      case "48h": setChartInterval("hour"); break;
      case "7d": setChartInterval("day"); break;
      case "14d": setChartInterval("day"); break;
      case "30d": setChartInterval("day"); break;
      case "3m": setChartInterval("week"); break;
      case "6m": setChartInterval("week"); break;
      case "12m": setChartInterval("month"); break;
      case "lifetime": setChartInterval("month"); break;
      case "custom": {
        if (dateRange.from) {
          const days = differenceInDays(dateRange.to, dateRange.from);
          if (days <= 2) setChartInterval("hour");
          else if (days <= 60) setChartInterval("day");
          else setChartInterval("week");
        }
        break;
      }
    }
  }, [preset, dateRange]);

  const availableIntervals = useMemo((): ChartInterval[] => {
    switch (preset) {
      case "realtime": return ["minute"];
      case "today": return ["hour"];
      case "yesterday": return ["hour"];
      case "24h": return ["hour"];
      case "48h": return ["hour", "day"];
      case "7d": return ["hour", "day"];
      case "14d": return ["day", "week"];
      case "30d": return ["day", "week"];
      case "3m": return ["day", "week", "month"];
      case "6m": return ["week", "month"];
      case "12m": return ["week", "month"];
      case "lifetime": return ["day", "week", "month"];
      case "custom": {
        if (!dateRange.from) return ["day", "week", "month"];
        const days = differenceInDays(dateRange.to, dateRange.from);
        if (days <= 2) return ["hour"];
        if (days <= 14) return ["hour", "day"];
        if (days <= 60) return ["day", "week"];
        return ["day", "week", "month"];
      }
    }
  }, [preset, dateRange]);

  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    if (preset === "realtime") {
      const interval = setInterval(() => setFetchTrigger((t) => t + 1), 30000);
      return () => clearInterval(interval);
    }
  }, [preset]);

  useEffect(() => {
    const fetchPV = async () => {
      setLoading(true);
      const now = new Date();
      const from = preset === "realtime" ? subMinutes(now, 5) : dateRange.from;
      const to = now;

      let query = supabase.from("pageviews").select("*").eq("site_id", siteId).order("timestamp", { ascending: true }).limit(10000);
      if (from) query = query.gte("timestamp", from.toISOString());
      query = query.lte("timestamp", to.toISOString());
      const { data } = await query;
      setPageviews(data || []);

      if (prevDateRange) {
        const { data: prevData } = await supabase
          .from("pageviews")
          .select("session_hash, pathname, referrer, timestamp")
          .eq("site_id", siteId)
          .gte("timestamp", prevDateRange.from.toISOString())
          .lte("timestamp", prevDateRange.to.toISOString());
        setPrevPageviews(prevData || []);
      } else {
        setPrevPageviews([]);
      }
      setLoading(false);
    };
    fetchPV();
  }, [siteId, dateRange, prevDateRange, fetchTrigger]);

  const filteredPageviews = useMemo(() => {
    if (filters.length === 0) return pageviews;
    return pageviews.filter((pv) =>
      filters.every((f) => {
        switch (f.type) {
          case "source": return (pv.referrer || "Direct").toLowerCase().includes(f.value.toLowerCase());
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
          case "utm_term": return pv.utm_term === f.value;
          case "utm_content": return pv.utm_content === f.value;
          default: return true;
        }
      })
    );
  }, [pageviews, filters]);

  // Computed metrics
  const totalPageviews = filteredPageviews.length;
  const sessions = useMemo(() => {
    const map: Record<string, any[]> = {};
    filteredPageviews.forEach((pv) => { const key = pv.session_hash || pv.id; (map[key] ??= []).push(pv); });
    return map;
  }, [filteredPageviews]);

  const uniqueVisitors = Object.keys(sessions).length;
  const totalVisits = Object.keys(sessions).length;
  const viewsPerVisit = useMemo(() => totalVisits === 0 ? 0 : totalPageviews / totalVisits, [totalPageviews, totalVisits]);
  const bounceRate = useMemo(() => {
    const total = Object.keys(sessions).length;
    if (total === 0) return 0;
    return Math.round((Object.values(sessions).filter((s) => s.length === 1).length / total) * 100);
  }, [sessions]);
  const avgDurationSec = useMemo(() => {
    const durations = Object.values(sessions)
      .filter((s) => s.length > 1)
      .map((s) => {
        const sorted = s.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return differenceInSeconds(new Date(sorted[sorted.length - 1].timestamp), new Date(sorted[0].timestamp));
      });
    if (durations.length === 0) return 0;
    return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  }, [sessions]);

  const formatDuration = (sec: number) => {
    if (sec >= 3600) return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`;
    if (sec >= 60) return `${Math.floor(sec / 60)}m ${sec % 60}s`;
    return `${sec}s`;
  };

  // Previous period
  const prevSessions = useMemo(() => {
    const map: Record<string, any[]> = {};
    prevPageviews.forEach((pv) => { const key = pv.session_hash || "unknown"; (map[key] ??= []).push(pv); });
    return map;
  }, [prevPageviews]);
  const prevUniqueVisitors = Object.keys(prevSessions).length;
  const prevTotalVisits = Object.keys(prevSessions).length;
  const prevTotalPageviews = prevPageviews.length;
  const prevViewsPerVisit = prevTotalVisits > 0 ? prevTotalPageviews / prevTotalVisits : 0;
  const prevBounceRate = useMemo(() => {
    const total = Object.keys(prevSessions).length;
    if (total === 0) return 0;
    return Math.round((Object.values(prevSessions).filter((s) => s.length === 1).length / total) * 100);
  }, [prevSessions]);

  function pctChange(current: number, previous: number): number | null {
    if (previous === 0 && current === 0) return null;
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Chart data
  const chartData = useMemo(() => {
    if (filteredPageviews.length === 0 && !loading) return [];
    const now = new Date();

    const bucketPvs = (pvs: any[]) => {
      const sessionMap: Record<string, any[]> = {};
      pvs.forEach((pv) => { const k = pv.session_hash || pv.id; (sessionMap[k] ??= []).push(pv); });
      return {
        visitors: Object.keys(sessionMap).length,
        visits: Object.keys(sessionMap).length,
        pageviews: pvs.length,
        views_per_visit: Object.keys(sessionMap).length > 0 ? pvs.length / Object.keys(sessionMap).length : 0,
        bounce_rate: Object.keys(sessionMap).length > 0
          ? Math.round((Object.values(sessionMap).filter((s) => s.length === 1).length / Object.keys(sessionMap).length) * 100)
          : 0,
        duration: 0,
      };
    };

    if (preset === "realtime") {
      const buckets: Record<string, any[]> = {};
      for (let i = 4; i >= 0; i--) { buckets[format(subMinutes(now, i), "HH:mm")] = []; }
      filteredPageviews.forEach((pv) => { const key = format(new Date(pv.timestamp), "HH:mm"); if (key in buckets) buckets[key].push(pv); });
      return Object.entries(buckets).map(([date, pvs]) => ({ date, ...bucketPvs(pvs) }));
    }

    const from = dateRange.from || new Date(filteredPageviews[0]?.timestamp || Date.now());
    const to = dateRange.to;

    const formatKey = (d: Date) => {
      switch (chartInterval) {
        case "minute": return format(d, "HH:mm");
        case "hour": return format(d, "ha");
        case "day": return format(d, "MMM d");
        case "week": return `W${format(d, "w")}`;
        case "month": return format(d, "MMM yyyy");
      }
    };

    const buckets: Record<string, any[]> = {};
    if (chartInterval === "hour") {
      const hours = differenceInHours(to, from);
      for (let i = hours; i >= 0; i--) { buckets[formatKey(subHours(to, i))] = []; }
    } else if (chartInterval === "day") {
      const days = Math.max(1, differenceInDays(to, from));
      for (let i = days; i >= 0; i--) { buckets[formatKey(subDays(to, i))] = []; }
    } else if (chartInterval === "week") {
      const weeks = Math.max(1, differenceInWeeks(to, from));
      for (let i = weeks; i >= 0; i--) { buckets[formatKey(subDays(to, i * 7))] = []; }
    } else if (chartInterval === "month") {
      let d = new Date(from);
      while (d <= to) { buckets[formatKey(d)] = []; d = new Date(d.getFullYear(), d.getMonth() + 1, 1); }
    }

    filteredPageviews.forEach((pv) => { const key = formatKey(new Date(pv.timestamp)); if (key in buckets) buckets[key].push(pv); });
    return Object.entries(buckets).map(([date, pvs]) => ({ date, ...bucketPvs(pvs) }));
  }, [filteredPageviews, dateRange, preset, chartInterval, loading]);

  // Breakdowns
  const topPages = useMemo(() => aggregate(filteredPageviews, "pathname"), [filteredPageviews]);
  const entryPages = useMemo(() => {
    const entries: Record<string, number> = {};
    Object.values(sessions).forEach((pvs) => {
      const sorted = pvs.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      entries[sorted[0]?.pathname || "/"] = (entries[sorted[0]?.pathname || "/"] || 0) + 1;
    });
    return Object.entries(entries).sort(([, a], [, b]) => b - a).slice(0, 10) as [string, number][];
  }, [sessions]);
  const exitPages = useMemo(() => {
    const exits: Record<string, number> = {};
    Object.values(sessions).forEach((pvs) => {
      const sorted = pvs.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      exits[sorted[sorted.length - 1]?.pathname || "/"] = (exits[sorted[sorted.length - 1]?.pathname || "/"] || 0) + 1;
    });
    return Object.entries(exits).sort(([, a], [, b]) => b - a).slice(0, 10) as [string, number][];
  }, [sessions]);

  const topSources = useMemo(() => aggregate(filteredPageviews, "referrer", "Direct / None"), [filteredPageviews]);
  const topBrowsers = useMemo(() => aggregate(filteredPageviews, "browser", "Unknown"), [filteredPageviews]);
  const topOS = useMemo(() => aggregate(filteredPageviews, "os", "Unknown"), [filteredPageviews]);
  const topDevices = useMemo(() => aggregate(filteredPageviews, "device_type", "Desktop"), [filteredPageviews]);
  const topCountries = useMemo(() => aggregate(filteredPageviews, "country", "Unknown"), [filteredPageviews]);
  const topRegions = useMemo(() => aggregate(filteredPageviews, "region", "Unknown"), [filteredPageviews]);
  const topCities = useMemo(() => aggregate(filteredPageviews, "city", "Unknown"), [filteredPageviews]);
  const channels = useMemo(() => {
    const map: Record<string, number> = {};
    filteredPageviews.forEach((pv) => { const ch = deriveChannel(pv.utm_medium, pv.utm_source, pv.referrer); map[ch] = (map[ch] || 0) + 1; });
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 10) as [string, number][];
  }, [filteredPageviews]);
  const utmSources = useMemo(() => aggregate(filteredPageviews, "utm_source", "(none)"), [filteredPageviews]);
  const utmMediums = useMemo(() => aggregate(filteredPageviews, "utm_medium", "(none)"), [filteredPageviews]);
  const utmCampaigns = useMemo(() => aggregate(filteredPageviews, "utm_campaign", "(none)"), [filteredPageviews]);
  const utmTerms = useMemo(() => aggregate(filteredPageviews, "utm_term", "(none)"), [filteredPageviews]);
  const utmContents = useMemo(() => aggregate(filteredPageviews, "utm_content", "(none)"), [filteredPageviews]);

  const addFilter = useCallback((type: Filter["type"], value: string) => {
    if (filters.some((f) => f.type === type && f.value === value)) return;
    setFilters((prev) => [...prev, { type, value }]);
  }, [filters]);
  const removeFilter = useCallback((index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const rangeLabel = useMemo(() => {
    switch (preset) {
      case "realtime": return "Last 5 minutes";
      case "today": return "Today";
      case "yesterday": return "Yesterday";
      case "24h": return "Last 24 hours";
      case "48h": return "Last 48 hours";
      case "7d": return "Last 7 days";
      case "14d": return "Last 14 days";
      case "30d": return "Last 30 days";
      case "3m": return "Last 3 months";
      case "6m": return "Last 6 months";
      case "12m": return "Last 12 months";
      case "lifetime": return "All time";
      case "custom":
        if (customRange?.from && customRange?.to) return `${format(customRange.from, "MMM d")} – ${format(customRange.to, "MMM d, yyyy")}`;
        return "Custom range";
    }
  }, [preset, customRange]);

  const metricLabel: Record<MetricKey, string> = {
    visitors: "Unique Visitors", visits: "Total Visits", pageviews: "Total Pageviews",
    views_per_visit: "Views per Visit", bounce_rate: "Bounce Rate", duration: "Visit Duration",
  };

  const chartConfig = { [activeMetric]: { label: metricLabel[activeMetric], color: "hsl(var(--primary))" } };

  const metrics: { key: MetricKey; label: string; value: string | number; change: number | null; invertColor?: boolean }[] = [
    { key: "visitors", label: "Unique Visitors", value: uniqueVisitors, change: pctChange(uniqueVisitors, prevUniqueVisitors) },
    { key: "visits", label: "Total Visits", value: totalVisits, change: pctChange(totalVisits, prevTotalVisits) },
    { key: "pageviews", label: "Total Pageviews", value: totalPageviews, change: pctChange(totalPageviews, prevTotalPageviews) },
    { key: "views_per_visit", label: "Views per Visit", value: viewsPerVisit.toFixed(2), change: pctChange(viewsPerVisit, prevViewsPerVisit) },
    { key: "bounce_rate", label: "Bounce Rate", value: `${bounceRate}%`, change: pctChange(bounceRate, prevBounceRate), invertColor: true },
    { key: "duration", label: "Visit Duration", value: formatDuration(avgDurationSec), change: null },
  ];

  const handleExportChart = () => {
    exportToCSV(`chart-${activeMetric}`, ["Date", metricLabel[activeMetric]], chartData.map((d: any) => [d.date, d[activeMetric]]));
  };

  const handleExportBreakdown = (title: string, data: [string, number][]) => {
    exportToCSV(title.toLowerCase().replace(/\s+/g, "-"), ["Name", "Count"], data.map(([n, c]) => [n, c]));
  };

  // Active tab state for each panel
  const [acqTab, setAcqTab] = useState("channels");
  const [pagesTab, setPagesTab] = useState("top");
  const [locTab, setLocTab] = useState("countries");
  const [techTab, setTechTab] = useState("browsers");
  const [utmTab, setUtmTab] = useState("utm_source");

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filter bar */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-accent/50 px-3 py-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          {filters.map((f, i) => (
            <Badge key={i} variant="secondary" className="gap-1 text-xs font-medium">
              <span className="text-muted-foreground">{f.type}:</span> {f.value}
              <button onClick={() => removeFilter(i)} className="ml-0.5 hover:text-destructive transition-colors"><X className="h-3 w-3" /></button>
            </Badge>
          ))}
          <button onClick={() => setFilters([])} className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1">Clear all</button>
        </div>
      )}

      {/* Metric strip — Plausible-style: no card border, flat, with underline active state */}
      <div className="flex flex-wrap items-start gap-x-8 gap-y-3 py-3 border-b border-border">
        {metrics.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            className={cn(
              "group flex flex-col items-start text-left pb-2 transition-all relative",
              "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-all after:duration-200",
              activeMetric === m.key
                ? "after:bg-primary after:scale-x-100"
                : "after:bg-transparent after:scale-x-0 hover:after:scale-x-100 hover:after:bg-border"
            )}
          >
            <span className={cn(
              "text-[11px] font-semibold uppercase tracking-wider transition-colors",
              activeMetric === m.key ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )}>
              {m.label}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-[26px] font-bold tracking-tight text-foreground leading-tight">
                {loading ? "—" : m.value}
              </span>
              {m.change !== null && m.change !== undefined && !loading && (
                <ChangeIndicator value={m.change} invert={m.invertColor} />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Chart — borderless, fluid */}
      <div className="relative">
        <div className="flex items-center justify-end gap-2 mb-1">
          <button onClick={handleExportChart} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded" title="Export CSV">
            <Download className="h-4 w-4" />
          </button>
          {availableIntervals.length > 1 && (
            <Select value={chartInterval} onValueChange={(v) => setChartInterval(v as ChartInterval)}>
              <SelectTrigger className="h-7 w-[80px] text-xs border-border bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableIntervals.map((iv) => (
                  <SelectItem key={iv} value={iv} className="text-xs capitalize">{iv === "minute" ? "Minutes" : `${iv.charAt(0).toUpperCase()}${iv.slice(1)}s`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {preset === "realtime" && (
            <span className="text-[11px] text-muted-foreground">auto-refreshing every 30s</span>
          )}
        </div>

        {preset === "realtime" && (
          <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground/80 mb-0.5">How realtime works</p>
            <p className="text-xs leading-relaxed">
              To protect your visitors' privacy, we don't use cookies or persistent identifiers. Instead, we count
              unique visitors using anonymous, daily-rotating hashes — so this view refreshes periodically rather than
              updating instantly. You're seeing activity from the last 5 minutes, updated every 30 seconds.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex h-[280px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : preset === "realtime" ? (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey={activeMetric} fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="fillPV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey={activeMetric} stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#fillPV)" />
            </AreaChart>
          </ChartContainer>
        )}
      </div>

      {/* Two-column: Sources | Pages — Plausible-style flat panels */}
      <div className="grid gap-6 lg:grid-cols-2 pt-2">
        <BreakdownPanel>
          <PanelHeader>
            <PlainTabs
              tabs={[
                { id: "channels", label: "Channels" },
                { id: "sources", label: "Sources" },
                { id: "campaigns", label: "Campaigns" },
              ]}
              active={acqTab}
              onChange={setAcqTab}
            />
            <BreakdownDetails
              title={acqTab === "channels" ? "All Channels" : acqTab === "sources" ? "All Sources" : "All Campaigns"}
              data={acqTab === "channels" ? channels : acqTab === "sources" ? topSources : utmSources}
              onExportCSV={() => handleExportBreakdown(acqTab, acqTab === "channels" ? channels : acqTab === "sources" ? topSources : utmSources)}
            />
          </PanelHeader>
          {acqTab === "channels" && <BreakdownList data={channels} onFilter={(v) => addFilter("source", v)} />}
          {acqTab === "sources" && <BreakdownList data={topSources} onFilter={(v) => addFilter("source", v)} showFavicons />}
          {acqTab === "campaigns" && (
            <>
              <PlainTabs
                tabs={[
                  { id: "utm_source", label: "Source" },
                  { id: "utm_medium", label: "Medium" },
                  { id: "utm_campaign", label: "Campaign" },
                  { id: "utm_term", label: "Term" },
                  { id: "utm_content", label: "Content" },
                ]}
                active={utmTab}
                onChange={setUtmTab}
                size="sm"
              />
              {utmTab === "utm_source" && <BreakdownList data={utmSources} onFilter={(v) => addFilter("utm_source", v)} />}
              {utmTab === "utm_medium" && <BreakdownList data={utmMediums} onFilter={(v) => addFilter("utm_medium", v)} />}
              {utmTab === "utm_campaign" && <BreakdownList data={utmCampaigns} onFilter={(v) => addFilter("utm_campaign", v)} />}
              {utmTab === "utm_term" && <BreakdownList data={utmTerms} onFilter={(v) => addFilter("utm_term", v)} />}
              {utmTab === "utm_content" && <BreakdownList data={utmContents} onFilter={(v) => addFilter("utm_content", v)} />}
            </>
          )}
        </BreakdownPanel>

        <BreakdownPanel>
          <PanelHeader>
            <PlainTabs
              tabs={[
                { id: "top", label: "Top Pages" },
                { id: "entry", label: "Entry Pages" },
                { id: "exit", label: "Exit Pages" },
              ]}
              active={pagesTab}
              onChange={setPagesTab}
            />
            <BreakdownDetails
              title="All Pages"
              data={pagesTab === "top" ? topPages : pagesTab === "entry" ? entryPages : exitPages}
              onExportCSV={() => handleExportBreakdown("pages", pagesTab === "top" ? topPages : pagesTab === "entry" ? entryPages : exitPages)}
            />
          </PanelHeader>
          {pagesTab === "top" && <BreakdownList data={topPages} onFilter={(v) => addFilter("page", v)} label="Page" countLabel="Visitors" />}
          {pagesTab === "entry" && <BreakdownList data={entryPages} onFilter={(v) => addFilter("page", v)} label="Page" countLabel="Entrances" />}
          {pagesTab === "exit" && <BreakdownList data={exitPages} onFilter={(v) => addFilter("page", v)} label="Page" countLabel="Exits" />}
        </BreakdownPanel>
      </div>

      {/* Two-column: Locations | Technology */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BreakdownPanel>
          <PanelHeader>
            <PlainTabs
              tabs={[
                { id: "countries", label: "Countries" },
                { id: "regions", label: "Regions" },
                { id: "cities", label: "Cities" },
              ]}
              active={locTab}
              onChange={setLocTab}
            />
            <BreakdownDetails
              title="All Locations"
              data={locTab === "countries" ? topCountries : locTab === "regions" ? topRegions : topCities}
              onExportCSV={() => handleExportBreakdown("locations", locTab === "countries" ? topCountries : locTab === "regions" ? topRegions : topCities)}
            />
          </PanelHeader>
          {locTab === "countries" && (
            <>
              <WorldMap data={topCountries} />
              <BreakdownList data={topCountries} onFilter={(v) => addFilter("country", v)} />
            </>
          )}
          {locTab === "regions" && <BreakdownList data={topRegions} onFilter={(v) => addFilter("region", v)} />}
          {locTab === "cities" && <BreakdownList data={topCities} onFilter={(v) => addFilter("city", v)} />}
        </BreakdownPanel>

        <BreakdownPanel>
          <PanelHeader>
            <PlainTabs
              tabs={[
                { id: "browsers", label: "Browsers" },
                { id: "os", label: "OS" },
                { id: "devices", label: "Devices" },
              ]}
              active={techTab}
              onChange={setTechTab}
            />
            <BreakdownDetails
              title="All Technology"
              data={techTab === "browsers" ? topBrowsers : techTab === "os" ? topOS : topDevices}
              onExportCSV={() => handleExportBreakdown("technology", techTab === "browsers" ? topBrowsers : techTab === "os" ? topOS : topDevices)}
            />
          </PanelHeader>
          {techTab === "browsers" && <BreakdownList data={topBrowsers} onFilter={(v) => addFilter("browser", v)} />}
          {techTab === "os" && <BreakdownList data={topOS} onFilter={(v) => addFilter("os", v)} />}
          {techTab === "devices" && <BreakdownList data={topDevices} onFilter={(v) => addFilter("device", v)} />}
        </BreakdownPanel>
      </div>
    </div>
  );
}

// ---- Layout components (Plausible-style) ----

function BreakdownPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm animate-fade-in">
      <div className="p-4 space-y-3">
        {children}
      </div>
    </div>
  );
}

function PanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      {children}
    </div>
  );
}

function PlainTabs({ tabs, active, onChange, size = "default" }: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  size?: "default" | "sm";
}) {
  return (
    <div className="flex items-center gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "font-semibold uppercase tracking-wider transition-colors pb-1 border-b-2",
            size === "sm" ? "text-[10px] px-1.5" : "text-[11px] px-2",
            active === tab.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ---- Helpers ----

function ChangeIndicator({ value, invert }: { value: number; invert?: boolean }) {
  if (value === 0) return <span className="text-xs text-muted-foreground">0%</span>;
  const isPositive = invert ? value < 0 : value > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-xs font-semibold",
      isPositive ? "text-primary" : "text-destructive"
    )}>
      <Icon className="h-3 w-3" />
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
  ).sort(([, a], [, b]) => b - a).slice(0, 10);
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
  if (!r || r === "direct") return "Direct / None";
  if (/google|bing|yahoo|duckduckgo|baidu|yandex/.test(r)) return "Organic Search";
  if (/facebook|twitter|linkedin|instagram|tiktok|reddit|youtube|pinterest/.test(r)) return "Social";
  return "Referral";
}

function extractDomain(url: string): string | null {
  try { return new URL(url.startsWith("http") ? url : `https://${url}`).hostname; } catch { return null; }
}

function BreakdownList({ data, onFilter, label = "Source", countLabel = "Visitors", showFavicons }: {
  data: [string, number][];
  onFilter?: (value: string) => void;
  label?: string;
  countLabel?: string;
  showFavicons?: boolean;
}) {
  const max = data[0]?.[1] || 1;
  const total = data.reduce((sum, [, count]) => sum + count, 0);

  if (data.length === 0) return <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>;

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between px-2 pb-2 pt-1">
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
        <span className="text-[11px] font-medium text-muted-foreground">{countLabel}</span>
      </div>
      {data.map(([name, count]) => {
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
        const domain = showFavicons ? extractDomain(name) : null;
        return (
          <button key={name} onClick={() => onFilter?.(name)} className="group relative w-full text-left transition-colors">
            <div
              className="absolute inset-y-0 left-0 rounded-r bg-primary/[0.08] transition-all group-hover:bg-primary/[0.14]"
              style={{ width: `${(count / max) * 100}%` }}
            />
            <div className="relative flex items-center justify-between px-2 py-[7px]">
              <div className="flex items-center gap-2 truncate">
                {domain && (
                  <img
                    src={`https://icons.duckduckgo.com/ip3/${domain}.ico`}
                    alt=""
                    className="h-4 w-4 shrink-0 rounded-sm"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <span className="truncate text-[13px] text-foreground">{name}</span>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-3">
                <span className="text-[13px] font-medium text-foreground tabular-nums">{formatNumber(count)}</span>
                <span className="w-[42px] text-right text-[11px] text-muted-foreground tabular-nums">{pct}%</span>
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
