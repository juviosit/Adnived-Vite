import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent/60 via-background to-background" />
      <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-secondary-foreground">
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              Privacy-first web analytics
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">New</span>
            </div>

            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Easy to use &{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                privacy-friendly
              </span>{" "}
              analytics
            </h1>

            <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Powerful, intuitive and lightweight analytics. No cookies, just insights. GDPR, CCPA & PECR compliant out of the box.
            </p>

            <Button size="lg" className="gap-2 px-8" asChild>
              <Link to="/signup">
              Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-chart-3" />
                No cookies
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-chart-3" />
                &lt;1kb script
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-chart-3" />
                Real-time
              </div>
            </div>
          </motion.div>

          {/* Right — browser mockup dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl border border-border bg-card p-1 shadow-2xl shadow-primary/10">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 rounded-t-xl border-b border-border bg-muted/60 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-destructive/60" />
                  <span className="h-3 w-3 rounded-full bg-chart-4/60" />
                  <span className="h-3 w-3 rounded-full bg-chart-3/60" />
                </div>
                <div className="flex-1 text-center">
                  <span className="rounded-md bg-background/80 px-4 py-1 text-xs text-muted-foreground">analytics.adnived.com</span>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="rounded-b-xl bg-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Dashboard</span>
                  <span className="flex items-center gap-1.5 text-xs text-chart-3">
                    <span className="flex h-2 w-2 rounded-full bg-chart-3" />
                    Live
                  </span>
                </div>

                <div className="mb-5 grid grid-cols-3 gap-3">
                  {[
                    { label: "Visitors", value: "12.4k", change: "+18.2%" },
                    { label: "Page Views", value: "48.2k", change: "+12.5%" },
                    { label: "Bounce", value: "24.3%", change: "-3.1%" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-border bg-background p-3">
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-bold text-foreground">{stat.value}</p>
                      <p className={`text-[10px] font-medium ${stat.change.startsWith("+") ? "text-chart-3" : "text-destructive"}`}>
                        {stat.change}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Mini bar chart */}
                <div className="flex items-end gap-1.5 rounded-lg border border-border bg-background p-4">
                  {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-primary/70"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating decorative element */}
            <div className="absolute -bottom-4 -left-4 rounded-xl border border-border bg-card p-3 shadow-lg">
              <p className="text-[10px] font-medium text-muted-foreground">&lt;1kb</p>
              <p className="text-xs font-bold text-foreground">Script Size</p>
              <p className="text-[10px] text-muted-foreground">75x smaller than GA</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
