import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Copy, Check, Link2, BarChart3, ArrowRight, ExternalLink,
  ShieldCheck, Zap, Eye, Target, PieChart, Tag, HelpCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const UTM_FIELDS = [
  {
    name: "url",
    label: "Website URL",
    placeholder: "https://example.com/landing",
    description: "The full URL of the page you want to link to.",
    required: true,
  },
  {
    name: "utm_source",
    label: "Campaign Source",
    placeholder: "e.g. google, newsletter, facebook",
    description: "Identifies which site or platform sent the traffic.",
    required: true,
  },
  {
    name: "utm_medium",
    label: "Campaign Medium",
    placeholder: "e.g. cpc, email, social",
    description: "The marketing medium — how the link is delivered.",
    required: true,
  },
  {
    name: "utm_campaign",
    label: "Campaign Name",
    placeholder: "e.g. spring_sale, product_launch",
    description: "The specific campaign name or promotion.",
    required: false,
  },
  {
    name: "utm_term",
    label: "Campaign Term",
    placeholder: "e.g. running+shoes",
    description: "Paid search keywords associated with this ad.",
    required: false,
  },
  {
    name: "utm_content",
    label: "Campaign Content",
    placeholder: "e.g. logolink, textlink, banner_v2",
    description: "Differentiates similar content or links within the same ad.",
    required: false,
  },
] as const;

type FieldName = (typeof UTM_FIELDS)[number]["name"];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

const UTMBuilder = () => {
  const { toast } = useToast();
  const [fields, setFields] = useState<Record<FieldName, string>>({
    url: "",
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  });
  const [copied, setCopied] = useState(false);

  const generatedUrl = useMemo(() => {
    const base = fields.url.trim();
    if (!base) return "";
    try {
      const url = new URL(base.startsWith("http") ? base : `https://${base}`);
      if (fields.utm_source.trim()) url.searchParams.set("utm_source", fields.utm_source.trim());
      if (fields.utm_medium.trim()) url.searchParams.set("utm_medium", fields.utm_medium.trim());
      if (fields.utm_campaign.trim()) url.searchParams.set("utm_campaign", fields.utm_campaign.trim());
      if (fields.utm_term.trim()) url.searchParams.set("utm_term", fields.utm_term.trim());
      if (fields.utm_content.trim()) url.searchParams.set("utm_content", fields.utm_content.trim());
      return url.toString();
    } catch {
      return "";
    }
  }, [fields]);

  const handleChange = (name: FieldName, value: string) => {
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast({ title: "Copied!", description: "UTM link copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const utmParams = [
    { tag: "utm_source", desc: "Where the traffic comes from — Google, a newsletter, Twitter, etc." },
    { tag: "utm_medium", desc: "How the link is delivered — CPC ads, email, organic social, etc." },
    { tag: "utm_campaign", desc: "The specific promotion — spring_sale, product_launch, etc." },
    { tag: "utm_term", desc: "The paid keyword that triggered an ad (optional)." },
    { tag: "utm_content", desc: "Differentiates variations of the same ad or link (optional)." },
  ];

  const whyCards = [
    { icon: Target, title: "Know What Converts", body: "See which channels actually drive sign-ups, purchases, or engagement — and stop guessing." },
    { icon: PieChart, title: "Allocate Budget Wisely", body: "Compare cost-per-click campaigns against organic and social to invest where ROI is highest." },
    { icon: Eye, title: "A/B Test Everything", body: "Use utm_content to tag link variations and see which creative or copy wins in real numbers." },
  ];

  const platformCards = [
    { icon: Zap, title: "Blazing Fast", body: "Our tracking script is under 1 KB — it loads instantly and never slows your site down. Your dashboard loads in milliseconds." },
    { icon: ShieldCheck, title: "Privacy First", body: "No cookies, no fingerprinting, no personal data collected. Fully GDPR and CCPA compliant — no consent banners needed." },
    { icon: Tag, title: "Automatic UTM Tracking", body: "Every UTM-tagged visit is captured and broken down automatically — by source, medium, campaign, term, and content." },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* ── Hero with warm gradient ── */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(135deg, hsl(30 60% 92%) 0%, hsl(24 80% 90%) 30%, hsl(340 40% 92%) 60%, hsl(280 30% 93%) 100%)",
            }}
          />
          <div className="container max-w-3xl text-center relative z-10">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 backdrop-blur-sm px-4 py-1.5 text-sm text-foreground/70 mb-6">
                <Link2 className="h-3.5 w-3.5" />
                Free Tool · No Sign-up Required
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-5">
                Build Trackable UTM Links
                <span className="block text-foreground/50">in Seconds</span>
              </h1>
              <p className="text-base md:text-lg text-foreground/55 max-w-xl mx-auto leading-relaxed">
                UTM parameters are simple tags added to any URL so you can see exactly which campaigns,
                ads, or emails bring visitors to your site. This tool builds those tagged links for you — instantly.
              </p>
            </motion.div>

            {/* Scroll hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-10 flex justify-center"
            >
              <a href="#builder" className="group flex flex-col items-center gap-1 text-foreground/30 hover:text-foreground/50 transition-colors">
                <span className="text-xs font-medium">Start building</span>
                <ArrowRight className="h-4 w-4 rotate-90 transition-transform group-hover:translate-y-0.5" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── What Are UTMs ── */}
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/60 px-3 py-1 text-xs font-medium text-accent-foreground mb-4">
                <HelpCircle className="h-3 w-3" />
                The Basics
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
                What Are UTM Parameters?
              </h2>
              <p className="text-foreground/60 leading-relaxed">
                UTM (Urchin Tracking Module) parameters are five short text snippets appended to a URL. When someone
                clicks a tagged link, your analytics tool reads those snippets and attributes the visit to the right
                source, medium, and campaign — giving you a clear picture of what's working and what isn't.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {utmParams.map((item, i) => (
                <motion.div
                  key={item.tag}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="group rounded-2xl border border-border/50 bg-card/60 p-5 hover:border-border hover:shadow-sm transition-all"
                >
                  <code className="inline-block rounded-md bg-primary/8 px-2 py-0.5 text-xs font-semibold text-primary">
                    {item.tag}
                  </code>
                  <p className="text-sm text-foreground/55 mt-2.5 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why UTMs Matter ── */}
        <section className="py-16 md:py-24 bg-card/40">
          <div className="container max-w-4xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
                Why UTM Tracking Matters
              </h2>
              <p className="text-foreground/50 max-w-lg mx-auto">
                Stop guessing which marketing efforts work. UTMs give you hard data on every click.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-5">
              {whyCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="rounded-2xl border border-border/50 bg-background p-6 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <card.icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground">{card.title}</h3>
                  <p className="text-sm text-foreground/55 leading-relaxed">{card.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Builder ── */}
        <section id="builder" className="py-16 md:py-24 scroll-mt-20">
          <div className="container max-w-2xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
                Build Your Link
              </h2>
              <p className="text-sm text-foreground/45">
                Fill in the fields below and your tagged URL appears instantly.
              </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}>
              <Card className="rounded-2xl border-border/50 shadow-lg shadow-foreground/[0.03]">
                <CardContent className="p-6 md:p-8 space-y-5">
                  {UTM_FIELDS.map((field) => (
                    <div key={field.name} className="space-y-1.5">
                      <Label htmlFor={field.name} className="text-sm font-medium text-foreground">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      <Input
                        id={field.name}
                        placeholder={field.placeholder}
                        value={fields[field.name]}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className="bg-background rounded-xl h-11"
                      />
                      <p className="text-xs text-foreground/40">{field.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Result */}
              {generatedUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Your Tagged URL
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-xl border border-border/50 bg-card px-4 py-3 text-sm text-foreground break-all font-mono leading-relaxed">
                      {generatedUrl}
                    </div>
                    <Button
                      onClick={handleCopy}
                      variant="default"
                      size="icon"
                      className="shrink-0 h-auto min-h-[48px] rounded-xl"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── Platform CTA ── */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(160deg, hsl(24 80% 92%) 0%, hsl(30 40% 95%) 40%, hsl(280 25% 94%) 100%)",
            }}
          />
          <div className="container max-w-4xl relative z-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
              <div className="flex items-center justify-center gap-2.5 mb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                  <BarChart3 className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
                See Your UTM Data Come&nbsp;to&nbsp;Life
              </h2>
              <p className="text-foreground/55 max-w-xl mx-auto leading-relaxed">
                <span className="font-bold">adnived</span>Analytics is a lightweight, privacy-first analytics platform
                built for marketers who care about speed, simplicity, and respecting their visitors.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-5 mb-12">
              {platformCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="rounded-2xl border border-border/50 bg-background/80 backdrop-blur-sm p-6 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <card.icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground">{card.title}</h3>
                  <p className="text-sm text-foreground/55 leading-relaxed">{card.body}</p>
                </motion.div>
              ))}
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp} className="text-center space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" className="rounded-full px-8 font-medium shadow-lg shadow-primary/15" asChild>
                  <Link to="/signup">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="lg" className="rounded-full px-6 font-medium" asChild>
                  <Link to="/#features">
                    See All Features <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-foreground/35">No credit card required · Free plan available forever</p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default UTMBuilder;
