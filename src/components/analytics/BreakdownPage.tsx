import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Download, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { format, subDays, subHours, subMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { exportToCSV } from "@/lib/csv-export";
import WorldMap from "./WorldMap";
import type { DateRange } from "react-day-picker";

export type BreakdownType = "sources" | "campaigns" | "pages" | "locations" | "technology";
type RangePreset = "24h" | "7d" | "30d" | "lifetime" | "custom";
type SortDir = "asc" | "desc";

interface BreakdownPageProps {
  siteId: string;
  breakdownType: BreakdownType;
}

interface Filter {
  type: string;
  value: string;
}

export default function BreakdownPage({ siteId, breakdownType }: BreakdownPageProps) {
  const [preset, setPreset] = useState<RangePreset>("30d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [pageviews, setPageviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [activeSubTab, setActiveSubTab] = useState(0);

  const dateRange = useMemo(() => {
    const now = new Date();
    switch (preset) {
      case "24h": return { from: subHours(now, 24), to: now };
      case "7d": return { from: subDays(now, 7), to: now };
      case "30d": return { from: subDays(now, 30), to: now };
      case "lifetime": return { from: null as Date | null, to: now };
      case "custom": return { from: customRange?.from || subDays(now, 7), to: customRange?.to || now };
    }
  }, [preset, customRange]);

  useEffect(() => {
    const fetchPV = async () => {
      setLoading(true);
      let query = supabase.from("pageviews").select("*").eq("site_id", siteId).order("timestamp", { ascending: true }).limit(10000);
      if (dateRange.from) query = query.gte("timestamp", dateRange.from.toISOString());
      query = query.lte("timestamp", dateRange.to.toISOString());
      const { data } = await query;
      setPageviews(data || []);
      setLoading(false);
    };
    fetchPV();
  }, [siteId, dateRange]);

  const filteredPVs = useMemo(() => {
    if (filters.length === 0) return pageviews;
    return pageviews.filter((pv) =>
      filters.every((f) => {
        const val = pv[f.type] || "";
        return val === f.value;
      })
    );
  }, [pageviews, filters]);

  const addFilter = useCallback((type: string, value: string) => {
    if (filters.some((f) => f.type === type && f.value === value)) return;
    setFilters((prev) => [...prev, { type, value }]);
  }, [filters]);

  // Tab configs per breakdown type
  const tabConfig = useMemo(() => {
    switch (breakdownType) {
      case "sources": return [
        { label: "Channels", key: "channel" },
        { label: "Sources", key: "referrer" },
      ];
      case "campaigns": return [
        { label: "Source", key: "utm_source" },
        { label: "Medium", key: "utm_medium" },
        { label: "Campaign", key: "utm_campaign" },
        { label: "Term", key: "utm_term" },
        { label: "Content", key: "utm_content" },
      ];
      case "pages": return [
        { label: "Top Pages", key: "pathname" },
      ];
      case "locations": return [
        { label: "Countries", key: "country" },
        { label: "Regions", key: "region" },
        { label: "Cities", key: "city" },
      ];
      case "technology": return [
        { label: "Browsers", key: "browser" },
        { label: "OS", key: "os" },
        { label: "Devices", key: "device_type" },
      ];
    }
  }, [breakdownType]);

  const activeTab = tabConfig[activeSubTab] || tabConfig[0];

  const breakdownData = useMemo((): [string, number][] => {
    if (activeTab.key === "channel") {
      const map: Record<string, number> = {};
      filteredPVs.forEach((pv) => {
        const ch = deriveChannel(pv.utm_medium, pv.utm_source, pv.referrer);
        map[ch] = (map[ch] || 0) + 1;
      });
      return Object.entries(map).sort(([, a], [, b]) => sortDir === "desc" ? b - a : a - b);
    }
    const map: Record<string, number> = {};
    filteredPVs.forEach((pv) => {
      const val = pv[activeTab.key] || "(none)";
      map[val] = (map[val] || 0) + 1;
    });
    return Object.entries(map).sort(([, a], [, b]) => sortDir === "desc" ? b - a : a - b);
  }, [filteredPVs, activeTab, sortDir]);

  const total = breakdownData.reduce((s, [, c]) => s + c, 0);
  const max = breakdownData[0]?.[1] || 1;

  const showMap = breakdownType === "locations" && activeTab.key === "country";

  const handleExport = () => {
    exportToCSV(
      `${breakdownType}-${activeTab.key}`,
      [activeTab.label, "Visitors"],
      breakdownData.map(([n, c]) => [n, c])
    );
  };

  const presetLabels: Record<RangePreset, string> = {
    "24h": "Last 24h", "7d": "Last 7 days", "30d": "Last 30 days",
    lifetime: "Lifetime", custom: "Custom",
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Date picker + export */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Select value={preset} onValueChange={(v) => setPreset(v as RangePreset)}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(presetLabels) as RangePreset[]).map((p) => (
                <SelectItem key={p} value={p} className="text-xs">{presetLabels[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {preset === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {customRange?.from && customRange?.to
                    ? `${format(customRange.from, "MMM d")} – ${format(customRange.to, "MMM d")}`
                    : "Pick dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" selected={customRange} onSelect={setCustomRange} numberOfMonths={2} />
              </PopoverContent>
            </Popover>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-accent/50 px-3 py-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          {filters.map((f, i) => (
            <Badge key={i} variant="secondary" className="gap-1 text-xs font-medium">
              <span className="text-muted-foreground">{f.type}:</span> {f.value}
              <button onClick={() => setFilters((prev) => prev.filter((_, j) => j !== i))} className="ml-0.5 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <button onClick={() => setFilters([])} className="text-xs text-muted-foreground hover:text-foreground ml-1">Clear all</button>
        </div>
      )}

      {/* Tabs */}
      {tabConfig.length > 1 && (
        <div className="flex items-center gap-1 border-b border-border pb-0">
          {tabConfig.map((tab, i) => (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(i)}
              className={cn(
                "text-[11px] font-semibold uppercase tracking-wider px-2 pb-2 border-b-2 transition-colors",
                i === activeSubTab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* World Map for locations */}
      {showMap && !loading && <WorldMap data={breakdownData} />}

      {/* Loading */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="p-4 space-y-0">
            {/* Header */}
            <div className="flex items-center justify-between px-2 pb-2 pt-1">
              <span className="text-[11px] font-medium text-muted-foreground">{activeTab.label}</span>
              <button
                onClick={() => setSortDir((d) => d === "desc" ? "asc" : "desc")}
                className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Visitors {sortDir === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              </button>
            </div>

            {/* Rows */}
            {breakdownData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
            ) : (
              breakdownData.map(([name, count]) => {
                const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
                return (
                  <button
                    key={name}
                    onClick={() => addFilter(activeTab.key === "channel" ? "source" : activeTab.key, name)}
                    className="group relative w-full text-left transition-colors"
                  >
                    <div
                      className="absolute inset-y-0 left-0 rounded-r bg-primary/[0.08] transition-all group-hover:bg-primary/[0.14]"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                    <div className="relative flex items-center justify-between px-2 py-[7px]">
                      <span className="truncate text-[13px] text-foreground">{name}</span>
                      <div className="ml-4 flex shrink-0 items-center gap-3">
                        <span className="text-[13px] font-medium text-foreground tabular-nums">{count.toLocaleString()}</span>
                        <span className="w-[42px] text-right text-[11px] text-muted-foreground tabular-nums">{pct}%</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
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
