import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Gift, UserPlus, CheckCircle2, Sparkles } from "lucide-react";

const steps = [
  { icon: Gift, title: "Share your link", desc: "Send your unique referral link to a friend via email or message." },
  { icon: UserPlus, title: "They sign up", desc: "Your friend creates an account using the link within 30 days." },
  { icon: CheckCircle2, title: "Both get rewarded", desc: "You both receive 1 free month of the Pro plan automatically." },
];

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

        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/60 via-background to-secondary/40" />
          <div className="container relative text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm font-medium text-foreground/80 mb-6">
              <Sparkles className="h-4 w-4" />
              Referral Program
            </div>
            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Give a month, <br className="hidden sm:block" />
              <span className="text-primary">get a month</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Refer a friend to adnived Analytics. When they sign up using your link,
              you both get <strong>1 free month of Pro</strong> — no strings attached.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="rounded-full px-8 text-base" asChild>
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 text-base" asChild>
                <Link to="/login">Log in to refer</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 md:py-28">
          <div className="container">
            <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              How it works
            </h2>
            <p className="text-center text-muted-foreground mb-14 max-w-lg mx-auto">
              Three simple steps to earn free analytics.
            </p>
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={i} className="relative rounded-2xl border border-border bg-card p-8 text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="absolute -right-4 top-1/2 hidden h-px w-8 bg-border md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ mini */}
        <section className="border-t border-border py-20">
          <div className="container max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Questions?</h2>
            <div className="space-y-6">
              {[
                { q: "Who can refer?", a: "Any user on a paid plan (Pro or Max) can send referrals from their dashboard." },
                { q: "What do I get?", a: "Both you and your friend each receive 1 free month of Pro. If you're already on Pro or Max, your billing period is extended by 30 days." },
                { q: "Is there a limit?", a: "No limit! Refer as many friends as you like." },
                { q: "How long is the link valid?", a: "Each referral link expires 30 days after creation." },
              ].map((item, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-foreground">{item.q}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Referral;
