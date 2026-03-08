import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, BarChart3, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Plan = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  max_hits: number | null;
  max_sites: number | null;
};

const formatHits = (hits: number): string => {
  if (hits >= 1_000_000) return `${(hits / 1_000_000).toFixed(hits % 1_000_000 === 0 ? 0 : 1)}M`;
  if (hits >= 1_000) return `${(hits / 1_000).toFixed(hits % 1_000 === 0 ? 0 : 1)}K`;
  return hits.toString();
};

const SelectPlan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("plans")
      .select("id, name, slug, price_cents, max_hits, max_sites")
      .eq("is_active", true)
      .order("price_cents")
      .then(({ data }) => {
        setPlans(data || []);
        setLoading(false);
      });
  }, []);

  // Check if user already selected a plan
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("plan_selected")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.plan_selected) {
          navigate("/dashboard", { replace: true });
        }
      });
  }, [user, navigate]);

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) return;
    setSelecting(plan.id);

    try {
      // If it's a paid plan, just mark plan as selected and redirect to dashboard
      // where they can upgrade via the Plan tab. For free plan, just mark selected.
      if (plan.price_cents === 0) {
        // Free plan is already assigned by trigger, just mark as selected
        await supabase
          .from("profiles")
          .update({ plan_selected: true })
          .eq("id", user.id);
        navigate("/dashboard", { replace: true });
      } else {
        // For paid plans, mark as selected and redirect to dashboard Plan tab
        await supabase
          .from("profiles")
          .update({ plan_selected: true })
          .eq("id", user.id);
        toast.info(`You can complete your ${plan.name} upgrade from the Plan tab.`);
        navigate("/dashboard?tab=plan", { replace: true });
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSelecting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background">
        <div className="container flex h-14 items-center justify-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-foreground tracking-tight">
              <span className="font-bold">adnived</span>
              <span className="font-normal">Analytics</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="container max-w-4xl py-12 md:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Plan</h1>
          <p className="text-foreground/60">
            Select a plan to get started. You can always change it later.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const isPopular = plan.slug === "pro";

            return (
              <Card
                key={plan.id}
                className={isPopular ? "border-primary ring-1 ring-primary relative" : "relative"}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3">Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.price_cents === 0 ? (
                      <span className="text-2xl font-bold text-foreground">Free</span>
                    ) : (
                      <span>
                        <span className="text-2xl font-bold text-foreground">
                          ${(plan.price_cents / 100).toFixed(0)}
                        </span>
                        <span className="text-muted-foreground">/mo</span>
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Feature
                    label={
                      plan.max_hits
                        ? `${formatHits(plan.max_hits)} pageviews`
                        : "Unlimited pageviews"
                    }
                  />
                  <Feature
                    label={
                      plan.max_sites
                        ? `${plan.max_sites} site${plan.max_sites > 1 ? "s" : ""}`
                        : "Unlimited sites"
                    }
                  />
                  {plan.slug !== "free" && <Feature label="Team members" />}
                  {plan.slug === "max" && <Feature label="Priority support" />}

                  <Button
                    className="mt-4 w-full gap-2"
                    variant={isPopular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={!!selecting}
                  >
                    {selecting === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : plan.price_cents > 0 ? (
                      <Zap className="h-4 w-4" />
                    ) : null}
                    {selecting === plan.id
                      ? "Setting up..."
                      : plan.price_cents === 0
                        ? "Start Free"
                        : `Choose ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

const Feature = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 text-sm text-foreground">
    <Check className="h-4 w-4 text-primary" />
    {label}
  </div>
);

export default SelectPlan;
