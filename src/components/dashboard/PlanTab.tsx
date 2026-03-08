import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, Zap, Loader2, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    onePayData?: Record<string, unknown>;
    onePay?: () => void;
  }
}

type Plan = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  max_hits: number | null;
  max_sites: number | null;
  is_active: boolean;
};

type Subscription = {
  id: string;
  plan_id: string;
  hits_used: number;
  status: string;
  current_period_end: string;
  scheduled_plan_id: string | null;
};

const formatHits = (hits: number): string => {
  if (hits >= 1_000_000) return `${(hits / 1_000_000).toFixed(hits % 1_000_000 === 0 ? 0 : 1)}M`;
  if (hits >= 1_000) return `${(hits / 1_000).toFixed(hits % 1_000 === 0 ? 0 : 1)}K`;
  return hits.toString();
};

const PlanTab = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [siteCount, setSiteCount] = useState(0);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const fetchData = async () => {
    const [plansRes, subRes, sitesRes] = await Promise.all([
      supabase.from("plans").select("*").eq("is_active", true).order("price_cents"),
      supabase.from("user_subscriptions").select("*").eq("user_id", user!.id).eq("status", "active").limit(1).single(),
      supabase.from("sites").select("id", { count: "exact", head: true }),
    ]);

    setPlans(plansRes.data || []);
    setSubscription(subRes.data as Subscription | null);
    setSiteCount(sitesRes.count || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Listen for OnePay events
  useEffect(() => {
    const handleSuccess = () => {
      toast.success("Payment successful! Your plan will be upgraded shortly.");
      setProcessingPlanId(null);
      setTimeout(() => window.location.reload(), 3000);
    };

    const handleFail = () => {
      toast.error("Payment failed. Please try again.");
      setProcessingPlanId(null);
    };

    window.addEventListener("onePaySuccess", handleSuccess);
    window.addEventListener("onePayFail", handleFail);

    return () => {
      window.removeEventListener("onePaySuccess", handleSuccess);
      window.removeEventListener("onePayFail", handleFail);
    };
  }, []);

  const handleUpgrade = async (planId: string) => {
    setProcessingPlanId(planId);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { plan_id: planId },
      });

      if (error || data?.error) {
        toast.error(data?.error || "Failed to initiate payment");
        setProcessingPlanId(null);
        return;
      }

      // Set OnePay data and trigger payment overlay
      window.onePayData = data.paymentData;
      if (typeof window.onePay === "function") {
        window.onePay();
      } else {
        toast.error("Payment gateway failed to load. Please refresh and try again.");
        setProcessingPlanId(null);
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Something went wrong. Please try again.");
      setProcessingPlanId(null);
    }
  };

  const handleDowngrade = async (targetPlanId: string) => {
    if (!subscription) return;
    setProcessingPlanId(targetPlanId);
    try {
      const { data, error } = await supabase.functions.invoke("schedule-downgrade", {
        body: { target_plan_id: targetPlanId },
      });

      if (error || data?.error) {
        toast.error(data?.error || "Failed to schedule downgrade.");
      } else {
        toast.success("Downgrade scheduled. Your current plan remains active until the billing period ends.");
        fetchData();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setProcessingPlanId(null);
    }
  };

  const cancelScheduledDowngrade = async () => {
    if (!subscription) return;
    try {
      const { data, error } = await supabase.functions.invoke("cancel-downgrade");

      if (error || data?.error) {
        toast.error(data?.error || "Failed to cancel downgrade.");
      } else {
        toast.success("Scheduled downgrade cancelled.");
        fetchData();
      }
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const currentPlan = plans.find((p) => p.id === subscription?.plan_id);
  const scheduledPlan = plans.find((p) => p.id === subscription?.scheduled_plan_id);
  const hitsUsed = subscription?.hits_used || 0;
  const maxHits = currentPlan?.max_hits;
  const hitsPercent = maxHits ? Math.min((hitsUsed / maxHits) * 100, 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Your Plan</h1>
        <p className="text-muted-foreground">Manage your subscription and usage</p>
      </div>

      {/* Scheduled downgrade banner */}
      {scheduledPlan && subscription && (
        <Card className="mb-6 border-amber-500/50 bg-amber-500/5">
          <CardContent className="flex items-start gap-3 py-4">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Downgrade scheduled</p>
              <p className="text-sm text-muted-foreground">
                Your <strong>{currentPlan?.name}</strong> plan remains active until{" "}
                <strong>{new Date(subscription.current_period_end).toLocaleDateString()}</strong>.
                After that, you'll be automatically switched to the <strong>{scheduledPlan.name}</strong> plan.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={cancelScheduledDowngrade}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Current usage */}
      {currentPlan && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {currentPlan.name} Plan
                  <Badge variant="secondary" className="ml-2">{subscription?.status}</Badge>
                </CardTitle>
                <CardDescription>
                  Renews {new Date(subscription?.current_period_end || "").toLocaleDateString()}
                </CardDescription>
              </div>
              {currentPlan.price_cents > 0 && (
                <p className="text-2xl font-bold text-foreground">
                  ${(currentPlan.price_cents / 100).toFixed(0)}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">Pageviews used</span>
                <span className="font-medium text-foreground">
                  {hitsUsed.toLocaleString()} / {maxHits ? maxHits.toLocaleString() : "∞"}
                </span>
              </div>
              {maxHits && <Progress value={hitsPercent} className="h-2" />}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sites used</span>
              <span className="font-medium text-foreground">
                {siteCount} / {currentPlan.max_sites ?? "∞"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan comparison */}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === subscription?.plan_id;
          const isScheduledTarget = plan.id === subscription?.scheduled_plan_id;
          const isDowngrade = plan.price_cents < (currentPlan?.price_cents || 0);
          const isUpgrade = plan.price_cents > (currentPlan?.price_cents || 0);

          return (
            <Card key={plan.id} className={isCurrent ? "border-primary ring-1 ring-primary" : isScheduledTarget ? "border-amber-500 ring-1 ring-amber-500" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  {plan.name}
                  {isCurrent && <Badge>Current</Badge>}
                  {isScheduledTarget && (
                    <Badge variant="outline" className="border-amber-500 text-amber-600">
                      <Clock className="mr-1 h-3 w-3" />
                      Scheduled
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {plan.price_cents === 0 ? (
                    <span className="text-2xl font-bold text-foreground">Free</span>
                  ) : (
                    <span>
                      <span className="text-2xl font-bold text-foreground">${(plan.price_cents / 100).toFixed(0)}</span>
                      <span className="text-muted-foreground">/mo</span>
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Feature label={plan.max_hits ? `${formatHits(plan.max_hits)} pageviews` : "Unlimited pageviews"} />
                <Feature label={plan.max_sites ? `${plan.max_sites} site${plan.max_sites > 1 ? "s" : ""}` : "Unlimited sites"} />
                {plan.slug !== "free" && <Feature label="Team members" />}
                {plan.slug === "max" && <Feature label="Priority support" />}

                {!isCurrent && !isScheduledTarget && isUpgrade && (
                  <Button
                    className="mt-4 w-full gap-2"
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={!!processingPlanId}
                  >
                    {processingPlanId === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    {processingPlanId === plan.id ? "Processing..." : "Upgrade"}
                  </Button>
                )}

                {!isCurrent && !isScheduledTarget && isDowngrade && (
                  <div className="mt-4 space-y-2">
                    <Button
                      className="w-full gap-2"
                      variant="outline"
                      onClick={() => handleDowngrade(plan.id)}
                      disabled={!!processingPlanId}
                    >
                      {processingPlanId === plan.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      {processingPlanId === plan.id ? "Processing..." : "Downgrade"}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Current plan stays active until {new Date(subscription?.current_period_end || "").toLocaleDateString()}
                    </p>
                  </div>
                )}

                {isScheduledTarget && (
                  <p className="mt-4 text-center text-xs text-amber-600">
                    Switching after {new Date(subscription?.current_period_end || "").toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const Feature = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 text-sm text-foreground">
    <Check className="h-4 w-4 text-primary" />
    {label}
  </div>
);

export default PlanTab;
