import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Target } from "lucide-react";
import { toast } from "sonner";

interface Goal {
  id: string;
  name: string;
  goal_type: string;
  goal_value: string;
  created_at: string;
}

interface GoalsPanelProps {
  siteId: string;
}

const GoalsPanel = ({ siteId }: GoalsPanelProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [conversions, setConversions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [urlPath, setUrlPath] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchGoals = async () => {
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("site_id", siteId)
      .eq("goal_type", "page_visit")
      .order("created_at", { ascending: false });

    setGoals((data as Goal[]) || []);

    // Fetch conversion counts from custom_events
    const { data: events } = await supabase
      .from("custom_events")
      .select("event_name")
      .eq("site_id", siteId)
      .like("event_name", "goal:%");

    const counts: Record<string, number> = {};
    (events || []).forEach((e) => {
      counts[e.event_name] = (counts[e.event_name] || 0) + 1;
    });
    setConversions(counts);
    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, [siteId]);

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
    } as any);

    if (error) {
      toast.error("Failed to create goal");
    } else {
      toast.success("Goal created");
      setName("");
      setUrlPath("");
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

  return (
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="goal-name" className="text-xs">Goal name</Label>
              <Input
                id="goal-name"
                placeholder="e.g. Signup completed"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-url" className="text-xs">URL path</Label>
              <Input
                id="goal-url"
                placeholder="e.g. /thank-you"
                value={urlPath}
                onChange={(e) => setUrlPath(e.target.value)}
              />
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
              return (
                <div key={goal.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{goal.name}</p>
                    <p className="text-xs text-muted-foreground">{goal.goal_value}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">{count} <span className="text-xs font-normal text-muted-foreground">conversions</span></span>
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
  );
};

export default GoalsPanel;
