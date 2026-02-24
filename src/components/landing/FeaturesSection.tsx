import { Shield, Activity, Zap, Globe, Smartphone, Target, Bell, Download } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Shield,
    title: "Privacy by Design",
    description: "No personal data collection. No IP addresses, sessions, or cookies stored. Your visitors stay anonymous.",
  },
  {
    icon: Activity,
    title: "Real-time Insights",
    description: "Live visitor tracking with instant updates. See who's on your site right now and what they're doing.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Under 1kb tracking script that won't slow down your site. Performance matters, and we know it.",
  },
  {
    icon: Globe,
    title: "Geographic Data",
    description: "See visitor locations by continent, country, city, and language preferences.",
  },
  {
    icon: Target,
    title: "Behavior Analytics",
    description: "Track pages visited, landing pages, and complete user journeys through your site.",
  },
  {
    icon: Smartphone,
    title: "Technology Reports",
    description: "OS, browsers, screen resolutions, and device breakdowns to optimize every experience.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Email alerts for performance changes and custom event triggers.",
  },
  {
    icon: Download,
    title: "Easy Export",
    description: "Download your data as CSV anytime. Your data, your control.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="border-t border-border/50 bg-muted/30 py-24">
      <div className="container">
        <div className="mx-auto mb-4 text-center">
          <p className="mb-2 text-sm font-medium text-primary">Why adnived Analytics?</p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
            Analytics that respects everyone
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Built from the ground up with privacy as a core principle, not an afterthought.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/20 hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
