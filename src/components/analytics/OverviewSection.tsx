import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { Users, Eye, MousePointerClick, Clock, CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, subHours, startOfDay, differenceInDays } from "date-fns";
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
      case "24h":
        return { from: subHours(now, 24), to: now };
      case "7d":
        return { from: subDays(now, 7), to: now };
      case "30d":
        return { from: subDays(now, 30), to: now };
      case "lifetime":
        return { from: null, to: now };
      case "custom":
        return {
          from: customRange?.from || subDays(now, 7),
          to: customRange?.to || now,
        };
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

      if (dateRange.from) {
        query = query.gte("timestamp", dateRange.from.toISOString());
      }
      query = query.lte("timestamp", dateRange.to.toISOString());

      const { data } = await query;
      setPageviews(data || []);
      setLoading(false);
    };
    fetchPV();
  }, [siteId, dateRange]);

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

  const totalPageviews = pageviews.length;
  const uniqueVisitors = new Set(pageviews.map((p) => p.session_hash).filter(Boolean)).size;

  const chartData = useMemo(() => {
    if (pageviews.length === 0) return [];

    const from = dateRange.from || new Date(pageviews[0]?.timestamp || Date.now());
    const to = dateRange.to;
    const totalDays = Math.max(1, differenceInDays(to, from));

    // Use hourly buckets for 24h, daily otherwise
    if (preset === "24h") {
      const hours: Record<string, number> = {};
      for (let i = 23; i >= 0; i--) {
        const d = subHours(new Date(), i);
        const key = format(d, "ha");
        hours[key] = 0;
      }
      pageviews.forEach((pv) => {
        const key = format(new Date(pv.timestamp), "ha");
        if (key in hours) hours[key]++;
      });
      return Object.entries(hours).map(([date, visitors]) => ({ date, visitors }));
    }

    // Daily buckets
    const days: Record<string, number> = {};
    for (let i = totalDays; i >= 0; i--) {
      const d = subDays(to, i);
      const key = totalDays > 60 ? format(d, "MMM d") : format(d, "MMM d");
      days[key] = 0;
    }
    pageviews.forEach((pv) => {
      const d = new Date(pv.timestamp);
      const key = totalDays > 60 ? format(d, "MMM d") : format(d, "MMM d");
      if (key in days) days[key]++;
    });
    return Object.entries(days).map(([date, visitors]) => ({ date, visitors }));
  }, [pageviews, dateRange, preset]);

  const topPages = useMemo(() => aggregate(pageviews, "pathname"), [pageviews]);
  const topSources = useMemo(() => aggregate(pageviews, "referrer", "Direct"), [pageviews]);
  const topBrowsers = useMemo(() => aggregate(pageviews, "browser", "Unknown"), [pageviews]);
  const topOS = useMemo(() => aggregate(pageviews, "os", "Unknown"), [pageviews]);

  const chartConfig = { visitors: { label: "Pageviews", color: "hsl(var(--primary))" } };

  const metrics = [
    { label: "Unique Visitors", value: uniqueVisitors, icon: Users },
    { label: "Total Pageviews", value: totalPageviews, icon: Eye },
    { label: "Top Pages", value: topPages.length, icon: MousePointerClick },
    { label: "Sources", value: topSources.length, icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Date range selector */}
      <div className="flex items-center gap-2">
        <Select value={preset} onValueChange={(v) => setPreset(v as RangePreset)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
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
              <Calendar
                mode="range"
                selected={customRange}
                onSelect={setCustomRange}
                numberOfMonths={2}
                disabled={(date) => date > new Date()}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{m.label}</p>
                <m.icon className="h-4 w-4 text-muted-foreground/50" />
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                {loading ? "…" : m.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Pageviews — {rangeLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-[280px] items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <BreakdownCard title="Top Pages" data={topPages} />
        <BreakdownCard title="Top Sources" data={topSources} />
        <BreakdownCard title="Browsers" data={topBrowsers} />
        <BreakdownCard title="Operating Systems" data={topOS} />
      </div>
    </div>
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
    .slice(0, 5);
}

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
              <div className="absolute inset-y-0 left-0 rounded bg-primary/10 transition-all" style={{ width: `${(count / max) * 100}%` }} />
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
