import { Shield, Activity, Zap, Globe, Smartphone, Target, Bell, Download } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Shield,
    title: "Privacy by Design",
    description: "No cookies, no sessions, no personal data. Visitor IPs are hashed and never stored.",
  },
  {
    icon: Activity,
    title: "Real-time Insights",
    description: "Live visitor tracking with instant updates. See who's on your site right now.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Under 1kb tracking script that won't slow down your site.",
  },
  {
    icon: Globe,
    title: "Geographic Data",
    description: "Visitor locations by country, region, and city, without storing personal data.",
  },
  {
    icon: Target,
    title: "Goals & Funnels",
    description: "Conversion goals and multi-step funnels to understand visitor journeys.",
  },
  {
    icon: Smartphone,
    title: "Technology Reports",
    description: "OS, browsers, screen resolutions, and device breakdowns.",
  },
  {
    icon: Bell,
    title: "UTM Tracking",
    description: "Full UTM parameter support. Track source, medium, and campaign automatically.",
  },
  {
    icon: Download,
    title: "Easy Export",
    description: "Download your data as CSV anytime. Your data, your control.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-4 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
            Analytics that respects everyone
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Built from the ground up with privacy as a core principle, not an afterthought.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-2xl bg-card p-6 transition-all hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-foreground">
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
