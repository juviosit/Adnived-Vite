import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for personal projects and small sites",
    features: [
      "Up to 1,000 monthly pageviews",
      "1 website",
      "Real-time dashboard",
      "GDPR compliant",
      "Core analytics",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$5",
    period: "/month",
    description: "For growing businesses and teams",
    features: [
      "Up to 100K monthly pageviews",
      "3 websites",
      "Real-time dashboard",
      "GDPR compliant",
      "Goals & funnels",
      "Team members",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Max",
    price: "$29",
    period: "/month",
    description: "For agencies and high-traffic sites",
    features: [
      "Unlimited monthly pageviews",
      "Unlimited websites",
      "Unlimited data retention",
      "Everything in Pro",
      "Custom events & API",
      "Shared dashboards",
      "Dedicated support",
    ],
    cta: "Go Max",
    highlighted: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="border-t border-border/50 py-24">
      <div className="container">
        <div className="mx-auto mb-4 text-center">
          <p className="mb-2 text-sm font-medium text-primary">Simple, transparent pricing</p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
            Choose your plan
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={`relative flex h-full flex-col border-border/50 ${
                  plan.highlighted
                    ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                    : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                    Most popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <ul className="mb-8 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/signup">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
          All plans include our lightweight &lt;1kb tracking script, GDPR/CCPA compliance, and no cookie banners required.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
