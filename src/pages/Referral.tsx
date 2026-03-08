import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Gift, UserPlus, CheckCircle2, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: Gift, title: "Share your link", desc: "Send your unique referral link to a friend via email or message." },
  { icon: UserPlus, title: "They sign up", desc: "Your friend creates an account using the link within 30 days." },
  { icon: CheckCircle2, title: "Both get rewarded", desc: "You both receive 1 free month of the Pro plan automatically." },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const Referral = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("referral_code", ref);
    }
  }, [searchParams]);

  return (
    <>
      <SEO
        title="Refer & Earn – Get 1 Month Pro Free"
        description="Refer a friend to adnivedAnalytics. When they sign up, you both get 1 month of Pro free. No limits, no catch."
        path="/refer"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          {/* Hero – matches homepage gradient style */}
          <section className="relative overflow-hidden py-24 md:py-36">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-200/40 via-rose-200/30 to-purple-200/20" />
            <div className="container relative">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mx-auto max-w-3xl text-center"
              >
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm font-medium text-foreground/80">
                  <Gift className="h-4 w-4" />
                  Referral Program
                </span>
                <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.1]">
                  Give a month,{" "}
                  <br className="hidden sm:block" />
                  get a month
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
                  Refer a friend to <span className="font-bold text-foreground">adnived</span>
                  <span className="text-foreground">Analytics</span>. When they sign up using your link,
                  you both get <strong className="text-foreground">1 free month of Pro</strong> — no strings attached.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="gap-2 rounded-full px-8 text-base" asChild>
                    <Link to="/signup">
                      Get Started Free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full px-8 text-base" asChild>
                    <Link to="/login">Log in to refer</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* How it works */}
          <section className="py-20 md:py-28">
            <div className="container">
              <motion.div {...fadeUp} className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  How it works
                </h2>
                <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
                  Three simple steps to earn free analytics.
                </p>
              </motion.div>
              <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="relative rounded-2xl border border-border bg-card p-8 text-center"
                  >
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                      <step.icon className="h-7 w-7 text-foreground" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                    {i < steps.length - 1 && (
                      <div className="absolute -right-4 top-1/2 hidden h-px w-8 bg-border md:block" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ mini */}
          <section className="border-t border-border/40 py-20 md:py-28">
            <div className="container max-w-2xl">
              <motion.div {...fadeUp}>
                <h2 className="text-2xl font-bold text-foreground mb-10 text-center">
                  Frequently asked questions
                </h2>
                <div className="space-y-8">
                  {[
                    { q: "Who can refer?", a: "Any user on a paid plan (Pro or Max) can send referrals from their dashboard." },
                    { q: "What do I get?", a: "Both you and your friend each receive 1 free month of Pro. If you're already on Pro or Max, your billing period is extended by 30 days." },
                    { q: "Is there a limit?", a: "No limit! Refer as many friends as you like." },
                    { q: "How long is the link valid?", a: "Each referral link expires 30 days after creation." },
                  ].map((item, i) => (
                    <div key={i}>
                      <h3 className="font-semibold text-foreground">{item.q}</h3>
                      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* CTA – matches homepage CTA */}
          <section className="relative overflow-hidden py-24">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-200/40 via-rose-200/30 to-purple-200/20" />
            <div className="container relative">
              <motion.div
                {...fadeUp}
                className="mx-auto max-w-2xl text-center"
              >
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
                  Start referring today
                </h2>
                <p className="mb-8 text-muted-foreground">
                  Join thousands of users earning free Pro months with every referral.
                </p>
                <div className="mb-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  {["No credit card required", "Unlimited referrals", "Instant rewards"].map((item) => (
                    <span key={item} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      {item}
                    </span>
                  ))}
                </div>
                <Button size="lg" className="gap-2 rounded-full px-8" asChild>
                  <Link to="/signup">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Referral;
