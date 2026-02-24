import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Trash2, Plus, GitBranch, ChevronRight, CalendarDays, Eye } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { format, subDays, subHours } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface Funnel {
  id: string;
  name: string;
  site_id: string;
  created_at: string;
}

interface FunnelStep {
  id: string;
  funnel_id: string;
  name: string;
  step_order: number;
  goal_type: string;
  goal_value: string;
}

interface FunnelsPanelProps {
  siteId: string;
}

type ReportRange = "24h" | "7d" | "30d" | "lifetime" | "custom";

const FunnelsPanel = ({ siteId }: FunnelsPanelProps) => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);

  // Create funnel dialog
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSteps, setNewSteps] = useState<{ name: string; goal_value: string }[]>([
    { name: "", goal_value: "" },
    { name: "", goal_value: "" },
  ]);
  const [creating, setCreating] = useState(false);

  // View funnel
  const [viewFunnelId, setViewFunnelId] = useState<string | null>(null);

  const fetchFunnels = async () => {
    const { data } = await supabase
      .from("funnels")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false });
    setFunnels(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFunnels();
  }, [siteId]);

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Funnel name is required");
      return;
    }
    const validSteps = newSteps.filter((s) => s.name.trim() && s.goal_value.trim());
    if (validSteps.length < 2) {
      toast.error("At least 2 steps are required");
      return;
    }
    setCreating(true);

    const { data: funnel, error } = await supabase
      .from("funnels")
      .insert({ site_id: siteId, name: newName.trim() })
      .select("id")
      .single();

    if (error || !funnel) {
      toast.error("Failed to create funnel");
      setCreating(false);
      return;
    }

    const stepInserts = validSteps.map((s, i) => ({
      funnel_id: funnel.id,
      name: s.name.trim(),
      step_order: i + 1,
      goal_type: "page_visit",
      goal_value: s.goal_value.trim(),
    }));

    const { error: stepError } = await supabase.from("funnel_steps").insert(stepInserts);
    if (stepError) {
      toast.error("Funnel created but steps failed to save");
    } else {
      toast.success("Funnel created");
    }

    setNewName("");
    setNewSteps([{ name: "", goal_value: "" }, { name: "", goal_value: "" }]);
    setShowCreate(false);
    setCreating(false);
    fetchFunnels();
  };

  const handleDelete = async (id: string) => {
    // Delete steps first, then funnel
    await supabase.from("funnel_steps").delete().eq("funnel_id", id);
    const { error } = await supabase.from("funnels").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete funnel");
    } else {
      toast.success("Funnel deleted");
      if (viewFunnelId === id) setViewFunnelId(null);
      fetchFunnels();
    }
  };

  const addStep = () => {
    setNewSteps([...newSteps, { name: "", goal_value: "" }]);
  };

  const updateStep = (index: number, field: "name" | "goal_value", value: string) => {
    const updated = [...newSteps];
    updated[index][field] = value;
    setNewSteps(updated);
  };

  const removeStep = (index: number) => {
    if (newSteps.length <= 2) return;
    setNewSteps(newSteps.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <GitBranch className="h-4 w-4" />
              Funnels
            </CardTitle>
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  New funnel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create funnel</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Funnel name</Label>
                    <Input placeholder="e.g. Signup flow" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Steps (URL paths, in order)</Label>
                    {newSteps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                        <Input placeholder="Step name" value={step.name} onChange={(e) => updateStep(i, "name", e.target.value)} className="flex-1" />
                        <Input placeholder="/path" value={step.goal_value} onChange={(e) => updateStep(i, "goal_value", e.target.value)} className="w-32" />
                        {newSteps.length > 2 && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeStep(i)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addStep} className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Add step
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreate} disabled={creating}>
                    {creating ? "Creating…" : "Create funnel"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : funnels.length === 0 ? (
            <p className="text-sm text-muted-foreground">No funnels yet. Create one to track user journeys through your site.</p>
          ) : (
            <div className="space-y-2">
              {funnels.map((funnel) => (
                <div key={funnel.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{funnel.name}</p>
                    <p className="text-xs text-muted-foreground">Created {format(new Date(funnel.created_at), "MMM d, yyyy")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setViewFunnelId(viewFunnelId === funnel.id ? null : funnel.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(funnel.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {viewFunnelId && <FunnelReport funnelId={viewFunnelId} siteId={siteId} />}
    </div>
  );
};

/* ── Funnel Report ─────────────────────────────────── */

function FunnelReport({ funnelId, siteId }: { funnelId: string; siteId: string }) {
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [pageviews, setPageviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<ReportRange>("7d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data: stepsData } = await supabase
        .from("funnel_steps")
        .select("*")
        .eq("funnel_id", funnelId)
        .order("step_order", { ascending: true });

      setSteps(stepsData || []);

      const now = new Date();
      let from: Date | null = null;
      switch (range) {
        case "24h": from = subHours(now, 24); break;
        case "7d": from = subDays(now, 7); break;
        case "30d": from = subDays(now, 30); break;
        case "lifetime": from = null; break;
        case "custom": from = customRange?.from || subDays(now, 7); break;
      }
      const to = range === "custom" && customRange?.to ? customRange.to : now;

      let query = supabase
        .from("pageviews")
        .select("pathname, session_hash, timestamp")
        .eq("site_id", siteId)
        .order("timestamp", { ascending: true });

      if (from) query = query.gte("timestamp", from.toISOString());
      query = query.lte("timestamp", to.toISOString());

      const { data: pvData } = await query;
      setPageviews(pvData || []);
      setLoading(false);
    };
    fetch();
  }, [funnelId, siteId, range, customRange]);

  // Compute funnel metrics: for each step, count unique sessions that visited that path
  // A session counts for step N only if it also completed steps 1..N-1
  const funnelData = useMemo(() => {
    if (steps.length === 0 || pageviews.length === 0) return [];

    // Group pageviews by session
    const sessions: Record<string, Set<string>> = {};
    pageviews.forEach((pv) => {
      if (!pv.session_hash) return;
      if (!sessions[pv.session_hash]) sessions[pv.session_hash] = new Set();
      sessions[pv.session_hash].add(pv.pathname);
    });

    // For each step, check how many sessions reached it (having visited all prior steps)
    let eligibleSessions = Object.keys(sessions);
    return steps.map((step, i) => {
      eligibleSessions = eligibleSessions.filter((hash) => {
        const paths = sessions[hash];
        return paths.has(step.goal_value) || [...paths].some((p) => p.startsWith(step.goal_value));
      });
      return {
        ...step,
        count: eligibleSessions.length,
      };
    });
  }, [steps, pageviews]);

  const maxCount = funnelData[0]?.count || 1;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Funnel Report</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={range} onValueChange={(v) => setRange(v as ReportRange)}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
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
            {range === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <CalendarDays className="h-3.5 w-3.5" />
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
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : funnelData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data available</p>
        ) : (
          <div className="space-y-1">
            {funnelData.map((step, i) => {
              const pct = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
              const dropoff = i > 0 && funnelData[i - 1].count > 0
                ? ((funnelData[i - 1].count - step.count) / funnelData[i - 1].count * 100).toFixed(1)
                : null;

              return (
                <div key={step.id}>
                  {i > 0 && (
                    <div className="flex items-center gap-2 py-1 pl-3">
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      {dropoff && (
                        <span className="text-xs text-destructive">−{dropoff}% drop-off</span>
                      )}
                    </div>
                  )}
                  <div className="relative rounded-md overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-md bg-primary/15 transition-all"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                    <div className="relative flex items-center justify-between px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {step.step_order}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{step.name}</p>
                          <p className="text-xs text-muted-foreground">{step.goal_value}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{step.count}</p>
                        <p className="text-xs text-muted-foreground">{pct.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FunnelsPanel;
