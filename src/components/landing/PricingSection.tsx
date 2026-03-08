import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type DbPlan = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  max_hits: number | null;
  max_sites: number | null;
};

const featuresBySlug: Record<string, string[]> = {
  free: [
    "Real-time dashboard",
    "GDPR compliant",
    "Core analytics",
  ],
  pro: [
    "Real-time dashboard",
    "GDPR compliant",
    "Goals & funnels",
    "Team members",
    "Priority support",
  ],
  max: [
    "Unlimited data retention",
    "Everything in Pro",
    "Custom events & API",
    "Shared dashboards",
    "Dedicated support",
  ],
};

const ctaBySlug: Record<string, string> = {
  free: "Get Started Free",
  pro: "Upgrade to Pro",
  max: "Go Max",
};

const descBySlug: Record<string, string> = {
  free: "Perfect for personal projects and small sites",
  pro: "For growing businesses and teams",
  max: "For agencies and high-traffic sites",
};

const slugOrder = ["free", "pro", "max"];

function formatHits(n: number | null): string {
  if (!n) return "Unlimited";
  if (n >= 1_000_000) return `${n / 1_000_000}M`;
  if (n >= 1_000) return `${n / 1_000}K`;
  return String(n);
}

const PricingSection = () => {
  const [plans, setPlans] = useState<DbPlan[]>([]);

  useEffect(() => {
    supabase
      .from("plans")
      .select("id, name, slug, price_cents, max_hits, max_sites")
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) {
          const sorted = [...data].sort(
            (a, b) => slugOrder.indexOf(a.slug) - slugOrder.indexOf(b.slug)
          );
          setPlans(sorted);
        }
      });
  }, []);

  return (
    <section id="pricing" className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-4 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
            Choose your plan
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const highlighted = plan.slug === "pro";
            const price = plan.price_cents === 0 ? "$0" : `$${plan.price_cents / 100}`;
            const period = plan.price_cents === 0 ? "forever" : "/month";
            const features = [
              `Up to ${formatHits(plan.max_hits)} monthly pageviews`,
              `${plan.max_sites ?? "Unlimited"} website${(plan.max_sites ?? 2) > 1 ? "s" : ""}`,
              ...(featuresBySlug[plan.slug] || []),
            ];

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div
                  className={`relative flex h-full flex-col rounded-2xl p-8 ${
                    highlighted
                      ? "bg-primary text-primary-foreground shadow-xl"
                      : "bg-card"
                  }`}
                >
                  {highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-400 px-3 py-0.5 text-xs font-medium text-white">
                      Most popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className={`text-sm mt-1 ${highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {descBySlug[plan.slug] || ""}
                    </p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{price}</span>
                      <span className={highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}>/{period}</span>
                    </div>
                  </div>
                  <ul className="mb-8 flex-1 space-y-3">
                    {features.map((f) => (
                      <li key={f} className={`flex items-center gap-2 text-sm ${highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        <Check className={`h-4 w-4 shrink-0 ${highlighted ? "text-primary-foreground" : "text-green-600"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full rounded-full ${highlighted ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90" : ""}`}
                    variant={highlighted ? "secondary" : "outline"}
                    asChild
                  >
                    <Link to="/signup">{ctaBySlug[plan.slug] || "Get Started"}</Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
          All plans include our lightweight &lt;1kb tracking script, GDPR/CCPA compliance, and no cookie banners required.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
