import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For personal projects and small sites",
    features: [
      "Up to 10K pageviews/mo",
      "1 website",
      "6 months data retention",
      "Core web analytics",
      "Email support",
    ],
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For growing businesses and teams",
    features: [
      "Up to 100K pageviews/mo",
      "10 websites",
      "Unlimited data retention",
      "Goals & funnels",
      "UTM campaign tracking",
      "Team members",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$29",
    period: "/month",
    description: "For agencies and high-traffic sites",
    features: [
      "Up to 1M pageviews/mo",
      "50 websites",
      "Unlimited data retention",
      "Everything in Pro",
      "Custom events",
      "CSV export & API access",
      "Shared dashboards",
      "Dedicated support",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="border-t border-border/50 py-24">
      <div className="container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free, upgrade when you're ready. No hidden fees.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col border-border/50 ${
                plan.highlighted
                  ? "border-primary shadow-lg ring-1 ring-primary/20"
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
                  <span className="text-muted-foreground">{plan.period}</span>
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
