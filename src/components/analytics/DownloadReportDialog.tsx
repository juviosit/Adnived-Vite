import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Download, CalendarDays, Loader2 } from "lucide-react";
import { format, subDays, subHours, differenceInSeconds } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

type RangePreset = "24h" | "7d" | "30d" | "lifetime" | "custom";

const METRIC_OPTIONS = [
  { id: "visitors", label: "Visitors & Pageviews" },
  { id: "bounce_rate", label: "Bounce Rate" },
  { id: "duration", label: "Visit Duration" },
  { id: "sources", label: "Top Sources" },
  { id: "pages", label: "Top Pages" },
  { id: "countries", label: "Top Countries" },
  { id: "technology", label: "Technology (Browser, OS, Device)" },
] as const;

type MetricId = (typeof METRIC_OPTIONS)[number]["id"];

interface DownloadReportDialogProps {
  siteId: string;
  siteName: string;
  siteDomain: string;
}

export default function DownloadReportDialog({ siteId, siteName, siteDomain }: DownloadReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<RangePreset>("30d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [selectedMetrics, setSelectedMetrics] = useState<Set<MetricId>>(
    new Set(METRIC_OPTIONS.map((m) => m.id))
  );
  const [generating, setGenerating] = useState(false);

  const toggleMetric = (id: MetricId) => {
    setSelectedMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getDateRange = () => {
    const now = new Date();
    switch (preset) {
      case "24h": return { from: subHours(now, 24), to: now };
      case "7d": return { from: subDays(now, 7), to: now };
      case "30d": return { from: subDays(now, 30), to: now };
      case "lifetime": return { from: null as Date | null, to: now };
      case "custom": return { from: customRange?.from || subDays(now, 7), to: customRange?.to || now };
    }
  };

  const presetLabels: Record<RangePreset, string> = {
    "24h": "Last 24 hours",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    lifetime: "Lifetime",
    custom: "Custom range",
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const range = getDateRange();
      let query = supabase.from("pageviews").select("*").eq("site_id", siteId).order("timestamp", { ascending: true }).limit(10000);
      if (range.from) query = query.gte("timestamp", range.from.toISOString());
      query = query.lte("timestamp", range.to.toISOString());
      const { data: pageviews } = await query;
      const pvs = pageviews || [];

      // Compute metrics
      const sessions: Record<string, any[]> = {};
      pvs.forEach((pv) => { const k = pv.session_hash || pv.id; (sessions[k] ??= []).push(pv); });

      const uniqueVisitors = Object.keys(sessions).length;
      const totalPageviews = pvs.length;
      const bounceRate = uniqueVisitors > 0
        ? Math.round((Object.values(sessions).filter((s) => s.length === 1).length / uniqueVisitors) * 100)
        : 0;
      const durations = Object.values(sessions)
        .filter((s) => s.length > 1)
        .map((s) => {
          const sorted = s.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          return differenceInSeconds(new Date(sorted[sorted.length - 1].timestamp), new Date(sorted[0].timestamp));
        });
      const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

      const formatDur = (sec: number) => {
        if (sec >= 3600) return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`;
        if (sec >= 60) return `${Math.floor(sec / 60)}m ${sec % 60}s`;
        return `${sec}s`;
      };

      const aggregate = (key: string, fallback = "(none)"): [string, number][] => {
        const map: Record<string, number> = {};
        pvs.forEach((pv: any) => { const v = pv[key] || fallback; map[v] = (map[v] || 0) + 1; });
        return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 15);
      };

      const rangeLabel = preset === "custom" && customRange?.from && customRange?.to
        ? `${format(customRange.from, "MMM d, yyyy")} – ${format(customRange.to, "MMM d, yyyy")}`
        : presetLabels[preset];

      // Build HTML
      let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Analytics Report – ${siteName || siteDomain}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  .subtitle { color: #666; font-size: 14px; margin-bottom: 32px; }
  .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .metric-card { border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; }
  .metric-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; margin-bottom: 4px; }
  .metric-value { font-size: 28px; font-weight: 700; }
  h2 { font-size: 16px; margin: 24px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e5e5; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th, td { text-align: left; padding: 8px 12px; font-size: 13px; }
  th { background: #f8f8f8; font-weight: 600; color: #666; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
  tr:not(:last-child) td { border-bottom: 1px solid #f0f0f0; }
  td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
  th:last-child { text-align: right; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #999; }
  @media print { body { padding: 20px; } }
</style></head><body>`;

      html += `<h1>${siteName || siteDomain} – Analytics Report</h1>`;
      html += `<p class="subtitle">${rangeLabel} · Generated ${format(new Date(), "MMM d, yyyy 'at' h:mm a")}</p>`;

      // Metric cards
      if (selectedMetrics.has("visitors") || selectedMetrics.has("bounce_rate") || selectedMetrics.has("duration")) {
        html += `<div class="metrics-grid">`;
        if (selectedMetrics.has("visitors")) {
          html += `<div class="metric-card"><div class="metric-label">Unique Visitors</div><div class="metric-value">${uniqueVisitors.toLocaleString()}</div></div>`;
          html += `<div class="metric-card"><div class="metric-label">Total Pageviews</div><div class="metric-value">${totalPageviews.toLocaleString()}</div></div>`;
        }
        if (selectedMetrics.has("bounce_rate")) {
          html += `<div class="metric-card"><div class="metric-label">Bounce Rate</div><div class="metric-value">${bounceRate}%</div></div>`;
        }
        if (selectedMetrics.has("duration")) {
          html += `<div class="metric-card"><div class="metric-label">Avg. Visit Duration</div><div class="metric-value">${formatDur(avgDuration)}</div></div>`;
        }
        html += `</div>`;
      }

      const renderTable = (title: string, data: [string, number][], colLabel: string) => {
        if (data.length === 0) return "";
        const total = data.reduce((s, [, c]) => s + c, 0);
        let t = `<h2>${title}</h2><table><thead><tr><th>${colLabel}</th><th>Visitors</th><th>%</th></tr></thead><tbody>`;
        data.forEach(([name, count]) => {
          t += `<tr><td>${name}</td><td>${count.toLocaleString()}</td><td>${total > 0 ? ((count / total) * 100).toFixed(1) : 0}%</td></tr>`;
        });
        t += `</tbody></table>`;
        return t;
      };

      if (selectedMetrics.has("sources")) html += renderTable("Top Sources", aggregate("referrer", "Direct / None"), "Source");
      if (selectedMetrics.has("pages")) html += renderTable("Top Pages", aggregate("pathname"), "Page");
      if (selectedMetrics.has("countries")) html += renderTable("Top Countries", aggregate("country", "Unknown"), "Country");
      if (selectedMetrics.has("technology")) {
        html += renderTable("Browsers", aggregate("browser", "Unknown"), "Browser");
        html += renderTable("Operating Systems", aggregate("os", "Unknown"), "OS");
        html += renderTable("Devices", aggregate("device_type", "Desktop"), "Device");
      }

      html += `<div class="footer">Report generated by adnived analytics</div></body></html>`;

      // Open print window
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
      }
      setOpen(false);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Report</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Time period */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time Period</Label>
            <Select value={preset} onValueChange={(v) => setPreset(v as RangePreset)}>
              <SelectTrigger className="h-9">
                <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(presetLabels) as RangePreset[]).map((p) => (
                  <SelectItem key={p} value={p}>{presetLabels[p]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {preset === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {customRange?.from && customRange?.to
                      ? `${format(customRange.from, "MMM d")} – ${format(customRange.to, "MMM d, yyyy")}`
                      : "Pick dates"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="range" selected={customRange} onSelect={setCustomRange} numberOfMonths={2} className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Metrics */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Metrics to Include</Label>
            <div className="space-y-2.5">
              {METRIC_OPTIONS.map((m) => (
                <div key={m.id} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`metric-${m.id}`}
                    checked={selectedMetrics.has(m.id)}
                    onCheckedChange={() => toggleMetric(m.id)}
                  />
                  <Label htmlFor={`metric-${m.id}`} className="text-sm font-normal cursor-pointer">{m.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={generateReport} disabled={generating || selectedMetrics.size === 0} className="w-full gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {generating ? "Generating…" : "Generate & Print Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
