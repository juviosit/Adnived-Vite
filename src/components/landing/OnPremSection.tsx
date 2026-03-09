import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Server, Lock, Database } from "lucide-react";

const points = [
  {
    icon: Server,
    title: "Your infrastructure, your rules",
    desc: "Deploy adnivedAnalytics on your own servers. No data ever leaves your network.",
  },
  {
    icon: Lock,
    title: "Full data sovereignty",
    desc: "Even anonymised analytics data stays under your control, meeting the strictest compliance requirements.",
  },
  {
    icon: Database,
    title: "Air-gapped ready",
    desc: "Perfect for government, healthcare, and finance environments that require complete network isolation.",
  },
  {
    icon: Shield,
    title: "Same features, zero compromise",
    desc: "Get the full dashboard, goals, funnels, and UTM tracking without sharing a single byte externally.",
  },
];

const OnPremSection = () => {
  return (
    <section className="border-t border-border/50 py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-4 text-center"
        >
          <p className="mb-2 text-sm font-medium text-primary">Enterprise</p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
            On-Premise deployment available
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            For organisations that need absolute control over their analytics
            data, we offer a fully self-hosted version. Keep every metric,
            every anonymised data point, and every dashboard on your own
            infrastructure.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2">
          {points.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1 font-semibold text-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Button asChild size="lg">
            <Link to="/contact">Talk to our team</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default OnPremSection;
