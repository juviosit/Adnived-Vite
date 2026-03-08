import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

const statSets = [
  [
    { label: "Visitors", value: "12.4k", change: "+18.2%" },
    { label: "Page Views", value: "48.2k", change: "+12.5%" },
    { label: "Bounce", value: "24.3%", change: "-3.1%" },
  ],
  [
    { label: "Visitors", value: "14.1k", change: "+24.6%" },
    { label: "Page Views", value: "53.8k", change: "+16.3%" },
    { label: "Bounce", value: "21.7%", change: "-5.8%" },
  ],
  [
    { label: "Visitors", value: "15.9k", change: "+31.4%" },
    { label: "Page Views", value: "61.2k", change: "+22.1%" },
    { label: "Bounce", value: "19.2%", change: "-8.4%" },
  ],
];

const barSets = [
  [40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95],
  [55, 70, 60, 90, 45, 85, 75, 95, 65, 80, 50, 88],
  [70, 50, 85, 65, 90, 55, 80, 70, 95, 60, 75, 92],
];

const HeroSection = () => {
  const [setIndex, setSetIndex] = useState(0);

  const cycle = useCallback(() => {
    setSetIndex((prev) => (prev + 1) % statSets.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(cycle, 3000);
    return () => clearInterval(interval);
  }, [cycle]);

  const stats = statSets[setIndex];
  const bars = barSets[setIndex];

  return (
    <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
      {/* Warm gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-200/60 via-rose-200/40 to-purple-200/30" />
      <div className="pointer-events-none absolute -top-20 -right-20 h-[500px] w-[500px] rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-rose-300/15 blur-3xl" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="mb-6 inline-flex items-center rounded-full border border-border/60 bg-muted/60 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm">
            Privacy-first web analytics
          </span>

          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
            Easy to use &{" "}
            privacy-friendly analytics
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Powerful, intuitive and lightweight analytics. No cookies, just insights. GDPR, CCPA & PECR compliant out of the box.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="gap-2 rounded-full px-8 text-base" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 text-base" asChild>
              <Link to="/docs">Read the docs</Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            {["No cookies", "<1kb script", "Real-time", "GDPR compliant"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-foreground/40" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mx-auto mt-20 max-w-4xl"
        >
          <div className="rounded-2xl border border-border/60 bg-card/80 p-1 shadow-2xl shadow-foreground/5 backdrop-blur-sm">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 rounded-t-xl bg-muted/60 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400/60" />
                <span className="h-3 w-3 rounded-full bg-amber-400/60" />
                <span className="h-3 w-3 rounded-full bg-green-400/60" />
              </div>
              <div className="flex-1 text-center">
                <span className="rounded-md bg-background/80 px-4 py-1 text-xs text-muted-foreground">adnived.com/dashboard</span>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="rounded-b-xl bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Dashboard</span>
                <span className="flex items-center gap-1.5 text-xs text-green-600">
                  <motion.span
                    className="flex h-2 w-2 rounded-full bg-green-500"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  Live
                </span>
              </div>

              <div className="mb-5 grid grid-cols-3 gap-3">
                <AnimatePresence mode="wait">
                  {stats.map((stat) => (
                    <motion.div
                      key={`${stat.label}-${stat.value}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.4 }}
                      className="rounded-xl border border-border/60 bg-background/60 p-3"
                    >
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-bold text-foreground">{stat.value}</p>
                      <p className={`text-[10px] font-medium ${stat.change.startsWith("+") ? "text-green-600" : "text-red-500"}`}>
                        {stat.change}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Animated bar chart */}
              <div className="flex items-end gap-1.5 rounded-xl border border-border/60 bg-background/60 p-4">
                {bars.map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm bg-foreground/20"
                    animate={{ height: h }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    style={{ height: h }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
