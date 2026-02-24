import { BarChart3, Globe, Smartphone, Target, TrendingUp, Users, Zap, Lock } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Real-time Dashboard",
    description: "See visitors on your site right now. Live-updating metrics with zero delay.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "No cookies, no personal data. Fully compliant with GDPR, CCPA, and PECR.",
  },
  {
    icon: Zap,
    title: "Lightweight Script",
    description: "Under 1KB tracking script that won't slow down your website.",
  },
  {
    icon: Globe,
    title: "Traffic Sources",
    description: "Know where your visitors come from — search, social, referrals, and direct.",
  },
  {
    icon: Smartphone,
    title: "Device Breakdown",
    description: "Browser, OS, and screen size analytics to optimize your site for every device.",
  },
  {
    icon: Target,
    title: "Goals & Funnels",
    description: "Track conversions, set up goals, and visualize multi-step funnels.",
  },
  {
    icon: TrendingUp,
    title: "UTM Campaigns",
    description: "Full campaign tracking with utm_source, utm_medium, and utm_campaign breakdowns.",
  },
  {
    icon: Users,
    title: "Team Access",
    description: "Invite team members to view analytics. Role-based permissions for full control.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="border-t border-border/50 py-24">
      <div className="container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
            Everything you need, nothing you don't
          </h2>
          <p className="text-lg text-muted-foreground">
            Clean metrics that matter. No bloated dashboards, no confusing reports.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/20 hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
