import { Cookie, Zap, Shield, Activity, ArrowRight, X, Check } from "lucide-react";
import { motion } from "framer-motion";

const comparisons = [
  { bad: "Frustrating complex dashboards", good: "One-page analytics that make sense" },
  { bad: "Cookie consent banners required", good: "No cookies, no consent needed" },
  { bad: "Heavy scripts slow your site", good: "Under 1kb, lightning fast" },
  { bad: "Privacy regulation headaches", good: "GDPR, CCPA, PECR compliant" },
];

const statsCards = [
  { value: "<1kb", label: "Script Size", sub: "75x smaller than GA", icon: Zap },
  { value: "0", label: "Cookies Used", sub: "No consent banners", icon: Cookie },
  { value: "100%", label: "GDPR Compliant", sub: "Privacy by design", icon: Shield },
  { value: "Real-time", label: "Live Dashboard", sub: "Instant insights", icon: Activity },
];

const WhySwitchSection = () => {
  return (
    <section className="py-24">
      <div className="container">
        {/* Stats row */}
        <div className="mx-auto mb-24 grid max-w-4xl grid-cols-2 gap-4 lg:grid-cols-4">
          {statsCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-card p-6 text-center"
            >
              <card.icon className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm font-medium text-foreground">{card.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Why Switch */}
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
              It's time to ditch legacy analytics
            </h2>
            <p className="text-muted-foreground">
              Traditional analytics tools are built for advertisers, not for you.
            </p>
          </div>

          <div className="space-y-3">
            {comparisons.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-2xl bg-card p-5"
              >
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <X className="h-4 w-4 shrink-0 text-red-400" />
                  <span className="line-through">{item.bad}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <Check className="h-4 w-4 shrink-0 text-green-600" />
                  {item.good}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySwitchSection;
