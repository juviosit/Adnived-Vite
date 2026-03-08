import SEO from "@/components/SEO";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, BarChart3, Zap, Loader2, Tag, X } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    onePayData?: Record<string, unknown>;
  }
}

type Plan = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  max_hits: number | null;
  max_sites: number | null;
};

type CouponResult = {
  valid: boolean;
  coupon_id: string;
  discount_type: string;
  discount_value: number;
  free_months: number;
  description: string;
  original_price_cents: number;
  discounted_price_cents: number;
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
  const [profileChecked, setProfileChecked] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponResult | null>(null);
  const [selectedPlanForCoupon, setSelectedPlanForCoupon] = useState<string | null>(null);

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
        } else {
          setProfileChecked(true);
        }
      });
  }, [user, navigate]);

  useEffect(() => {
    const handleSuccess = async () => {
      toast.success("Payment successful! Setting up your account...");
      if (user) {
        await supabase.from("profiles").update({ plan_selected: true }).eq("id", user.id);
      }
      setSelecting(null);
      navigate("/dashboard", { replace: true });
    };
    const handleFail = () => {
      toast.error("Payment failed. Please try again or choose a different plan.");
      setSelecting(null);
    };
    window.addEventListener("onePaySuccess", handleSuccess);
    window.addEventListener("onePayFail", handleFail);
    return () => {
      window.removeEventListener("onePaySuccess", handleSuccess);
      window.removeEventListener("onePayFail", handleFail);
    };
  }, [user, navigate]);

  const applyCoupon = async (planId: string) => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-coupon", {
        body: { code: couponCode, plan_id: planId },
      });
      if (error || data?.error) {
        toast.error(data?.error || "Invalid coupon code");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data as CouponResult);
        setSelectedPlanForCoupon(planId);
        toast.success(`Coupon applied: ${data.description}`);
      }
    } catch {
      toast.error("Failed to validate coupon");
    }
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setSelectedPlanForCoupon(null);
    setCouponCode("");
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) return;
    setSelecting(plan.id);

    try {
      // Check if coupon makes it free
      const isCouponFree = appliedCoupon && selectedPlanForCoupon === plan.id && appliedCoupon.discounted_price_cents === 0;

      if (plan.price_cents === 0 || isCouponFree) {
        // Free plan or 100% discount — activate directly
        if (appliedCoupon && selectedPlanForCoupon === plan.id) {
          // Increment coupon usage via create-payment with zero amount
          await supabase.functions.invoke("create-payment", {
            body: { plan_id: plan.id, coupon_id: appliedCoupon.coupon_id },
          });
        }
        await supabase.from("profiles").update({ plan_selected: true }).eq("id", user.id);
        navigate("/dashboard", { replace: true });
      } else {
        const body: Record<string, string> = { plan_id: plan.id };
        if (appliedCoupon && selectedPlanForCoupon === plan.id) {
          body.coupon_id = appliedCoupon.coupon_id;
        }

        const { data, error } = await supabase.functions.invoke("create-payment", { body });

        if (error) {
          console.error("create-payment invoke error:", error);
          toast.error("Failed to initiate payment. Please try again.");
          setSelecting(null);
          return;
        }
        if (data?.error) {
          toast.error(data.error);
          setSelecting(null);
          return;
        }

        window.onePayData = data.paymentData;
        const onePayContainer = document.getElementById("onepay-btn");
        const sdkButton = onePayContainer?.querySelector("button");
        if (sdkButton) {
          onePayContainer!.style.pointerEvents = "auto";
          sdkButton.click();
          onePayContainer!.style.pointerEvents = "none";
        } else {
          console.error("OnePay SDK button not found in #onepay-btn");
          toast.error("Payment gateway failed to load. Please refresh the page and try again.");
          setSelecting(null);
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSelecting(null);
    }
  };

  const getDisplayPrice = (plan: Plan) => {
    if (appliedCoupon && selectedPlanForCoupon === plan.id) {
      return appliedCoupon.discounted_price_cents;
    }
    return plan.price_cents;
  };

  if (loading || !profileChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Select Your Plan" description="Choose the right adnivedAnalytics plan for your website." path="/select-plan" noindex />
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

        {/* Coupon Input */}
        <div className="mb-8 mx-auto max-w-md">
          {appliedCoupon ? (
            <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
              <Tag className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                <code className="font-mono">{couponCode}</code> - {appliedCoupon.description}
              </span>
              <Button variant="ghost" size="icon" className="ml-auto h-6 w-6" onClick={removeCoupon}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Have a coupon code?"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="rounded-xl uppercase font-mono"
              />
              <Button
                variant="outline"
                className="rounded-xl shrink-0"
                onClick={() => {
                  // Apply to the first paid plan by default for validation
                  const paidPlan = plans.find((p) => p.price_cents > 0);
                  if (paidPlan) applyCoupon(paidPlan.id);
                }}
                disabled={!couponCode.trim() || couponLoading}
              >
                {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isPopular = plan.slug === "pro";
            const displayPrice = getDisplayPrice(plan);
            const hasDiscount = appliedCoupon && selectedPlanForCoupon === plan.id && displayPrice !== plan.price_cents;

            return (
              <Card key={plan.id} className={isPopular ? "border-primary ring-1 ring-primary relative" : "relative"}>
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
                        {hasDiscount && (
                          <span className="text-lg text-muted-foreground line-through mr-2">
                            ${(plan.price_cents / 100).toFixed(0)}
                          </span>
                        )}
                        <span className="text-2xl font-bold text-foreground">
                          {displayPrice === 0 ? "Free" : `$${(displayPrice / 100).toFixed(0)}`}
                        </span>
                        {displayPrice > 0 && <span className="text-muted-foreground">/mo</span>}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Feature label={plan.max_hits ? `${formatHits(plan.max_hits)} pageviews` : "Unlimited pageviews"} />
                  <Feature label={plan.max_sites ? `${plan.max_sites} site${plan.max_sites > 1 ? "s" : ""}` : "Unlimited sites"} />
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
                    ) : plan.price_cents > 0 && displayPrice > 0 ? (
                      <Zap className="h-4 w-4" />
                    ) : null}
                    {selecting === plan.id
                      ? "Processing..."
                      : plan.price_cents === 0
                        ? "Start Free"
                        : displayPrice === 0
                          ? "Activate Free"
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
