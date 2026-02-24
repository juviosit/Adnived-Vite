import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Trash2, Plus, Target, FileText, CalendarDays, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, subHours } from "date-fns";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { DateRange } from "react-day-picker";

interface Goal {
  id: string;
  name: string;
  goal_type: string;
  goal_value: string;
  conversion_value: number;
  created_at: string;
}

interface GoalsPanelProps {
  siteId: string;
}

type ReportRange = "24h" | "7d" | "30d" | "lifetime" | "custom";

interface ReportState {
  goalId: string;
  range: ReportRange;
  customRange?: DateRange;
  marketingSpend: string;
  productCost: string;
}

const GoalsPanel = ({ siteId }: GoalsPanelProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [allEvents, setAllEvents] = useState<{ event_name: string; timestamp: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [urlPath, setUrlPath] = useState("");
  const [goalValue, setGoalValue] = useState("");
  const [adding, setAdding] = useState(false);

  // Report dialog state
  const [report, setReport] = useState<ReportState | null>(null);

  const fetchGoals = async () => {
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("site_id", siteId)
      .eq("goal_type", "page_visit")
      .order("created_at", { ascending: false });

    setGoals((data as Goal[]) || []);

    const { data: events } = await supabase
      .from("custom_events")
      .select("event_name, timestamp")
      .eq("site_id", siteId)
      .like("event_name", "goal:%");

    setAllEvents(events || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, [siteId]);

  const conversions = useMemo(() => {
    const counts: Record<string, number> = {};
    allEvents.forEach((e) => {
      counts[e.event_name] = (counts[e.event_name] || 0) + 1;
    });
    return counts;
  }, [allEvents]);

  const handleAdd = async () => {
    if (!name.trim() || !urlPath.trim()) {
      toast.error("Both name and URL path are required");
      return;
    }
    setAdding(true);
    const { error } = await supabase.from("goals").insert({
      site_id: siteId,
      name: name.trim(),
      goal_type: "page_visit",
      goal_value: urlPath.trim(),
      conversion_value: goalValue ? parseFloat(goalValue) || 0 : 0,
    } as any);

    if (error) {
      toast.error("Failed to create goal");
    } else {
      toast.success("Goal created");
      setName("");
      setUrlPath("");
      setGoalValue("");
      fetchGoals();
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete goal");
    } else {
      toast.success("Goal deleted");
      fetchGoals();
    }
  };

  // Report computations
  const reportData = useMemo(() => {
    if (!report) return null;
    const goal = goals.find((g) => g.id === report.goalId);
    if (!goal) return null;

    const now = new Date();
    let from: Date | null = null;
    switch (report.range) {
      case "24h": from = subHours(now, 24); break;
      case "7d": from = subDays(now, 7); break;
      case "30d": from = subDays(now, 30); break;
      case "lifetime": from = null; break;
      case "custom": from = report.customRange?.from || subDays(now, 7); break;
    }
    const to = report.range === "custom" && report.customRange?.to ? report.customRange.to : now;

    const eventKey = `goal:${goal.name}`;
    const filtered = allEvents.filter((e) => {
      if (e.event_name !== eventKey) return false;
      const ts = new Date(e.timestamp);
      if (from && ts < from) return false;
      if (ts > to) return false;
      return true;
    });

    const conversionCount = filtered.length;
    const revenuePerConversion = Number(goal.conversion_value) || 0;
    const totalRevenue = conversionCount * revenuePerConversion;
    const marketingSpend = parseFloat(report.marketingSpend) || 0;
    const productCost = parseFloat(report.productCost) || 0;
    const totalCost = marketingSpend + (productCost * conversionCount);
    const profit = totalRevenue - totalCost;
    const roi = totalCost > 0 ? ((profit / totalCost) * 100) : 0;

    return {
      goal,
      conversionCount,
      revenuePerConversion,
      totalRevenue,
      marketingSpend,
      productCost,
      totalCost,
      profit,
      roi,
      rangeLabel: report.range === "custom" && report.customRange?.from && report.customRange?.to
        ? `${format(report.customRange.from, "MMM d")} – ${format(report.customRange.to, "MMM d, yyyy")}`
        : { "24h": "Last 24 hours", "7d": "Last 7 days", "30d": "Last 30 days", "lifetime": "Lifetime" }[report.range] || "",
    };
  }, [report, goals, allEvents]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Target className="h-4 w-4" />
            Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add goal form */}
          <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="goal-name" className="text-xs">Goal name</Label>
                <Input id="goal-name" placeholder="e.g. Signup completed" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-url" className="text-xs">URL path</Label>
                <Input id="goal-url" placeholder="e.g. /thank-you" value={urlPath} onChange={(e) => setUrlPath(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-value" className="text-xs">Conversion value ($) <span className="text-muted-foreground">optional</span></Label>
                <Input id="goal-value" type="number" min="0" step="0.01" placeholder="e.g. 49.99" value={goalValue} onChange={(e) => setGoalValue(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleAdd} disabled={adding} size="sm" className="w-fit gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add goal
            </Button>
          </div>

          {/* Goals list */}
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No goals configured yet. Add one above to start tracking conversions.</p>
          ) : (
            <div className="space-y-2">
              {goals.map((goal) => {
                const count = conversions[`goal:${goal.name}`] || 0;
                const value = Number(goal.conversion_value) || 0;
                return (
                  <div key={goal.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{goal.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{goal.goal_value}</span>
                        {value > 0 && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-accent px-1.5 py-0.5 text-accent-foreground">
                            <DollarSign className="h-3 w-3" />
                            {value.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{count} <span className="text-xs font-normal text-muted-foreground">conversions</span></span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => setReport({ goalId: goal.id, range: "7d", marketingSpend: "", productCost: "" })}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-primary" />
                              ROI Report — {goal.name}
                            </DialogTitle>
                          </DialogHeader>
                          {report && report.goalId === goal.id && (
                            <ReportForm
                              report={report}
                              setReport={setReport}
                              data={reportData}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(goal.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/* ── Report Form ─────────────────────────────────── */

function ReportForm({
  report,
  setReport,
  data,
}: {
  report: ReportState;
  setReport: (r: ReportState) => void;
  data: ReturnType<typeof Object> | null;
}) {
  const d = data as any;

  return (
    <div className="space-y-5">
      {/* Time period */}
      <div className="flex items-center gap-2">
        <Select value={report.range} onValueChange={(v) => setReport({ ...report, range: v as ReportRange })}>
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

        {report.range === "custom" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                {report.customRange?.from && report.customRange?.to
                  ? `${format(report.customRange.from, "MMM d")} – ${format(report.customRange.to, "MMM d")}`
                  : "Pick dates"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={report.customRange}
                onSelect={(r) => setReport({ ...report, customRange: r })}
                numberOfMonths={2}
                disabled={(date) => date > new Date()}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Cost inputs */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Marketing spend ($)</Label>
          <Input
            type="number" min="0" step="0.01" placeholder="e.g. 500"
            value={report.marketingSpend}
            onChange={(e) => setReport({ ...report, marketingSpend: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Cost per unit / fulfillment ($)</Label>
          <Input
            type="number" min="0" step="0.01" placeholder="e.g. 10"
            value={report.productCost}
            onChange={(e) => setReport({ ...report, productCost: e.target.value })}
          />
        </div>
      </div>

      {/* Results */}
      {d && (
        <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{d.rangeLabel}</p>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Conversions" value={d.conversionCount} />
            <Stat label="Revenue / conversion" value={`$${d.revenuePerConversion.toFixed(2)}`} />
            <Stat label="Total revenue" value={`$${d.totalRevenue.toFixed(2)}`} highlight />
            <Stat label="Total cost" value={`$${d.totalCost.toFixed(2)}`} />
            <Stat label="Profit" value={`$${d.profit.toFixed(2)}`} highlight positive={d.profit >= 0} />
            <Stat
              label="ROI"
              value={d.totalCost > 0 ? `${d.roi.toFixed(1)}%` : "—"}
              highlight
              positive={d.roi >= 0}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight, positive }: { label: string; value: string | number; highlight?: boolean; positive?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn(
        "text-lg font-bold tracking-tight",
        highlight
          ? positive === false ? "text-destructive" : positive === true ? "text-primary" : "text-foreground"
          : "text-foreground"
      )}>
        {value}
      </p>
    </div>
  );
}

export default GoalsPanel;
