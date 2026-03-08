import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Copy, Check, Link2, BarChart3, ArrowRight, ExternalLink,
  ShieldCheck, Zap, Eye, Target, PieChart, Tag, HelpCircle, X,
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

  const comparisons = [
    { bad: "No idea which campaigns drive revenue", good: "See exactly which source converts" },
    { bad: "Wasting budget on underperforming ads", good: "Allocate spend based on real data" },
    { bad: "Guessing which email or post worked", good: "Track every link with UTM tags" },
  ];

  const platformCards = [
    { icon: Zap, title: "Blazing Fast", body: "Our tracking script is under 1 KB — it loads instantly and never slows your site down." },
    { icon: ShieldCheck, title: "Privacy First", body: "No cookies, no fingerprinting, no personal data. Fully GDPR and CCPA compliant." },
    { icon: Tag, title: "Automatic UTM Tracking", body: "Every UTM-tagged visit is captured and broken down automatically in your dashboard." },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-200/60 via-rose-200/40 to-purple-200/30" />
          <div className="pointer-events-none absolute -top-20 -right-20 h-[500px] w-[500px] rounded-full bg-orange-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-rose-300/15 blur-3xl" />

          <div className="container relative mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/60 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm">
                <Link2 className="h-3.5 w-3.5" />
                Free Tool · No Sign-up Required
              </span>

              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
                Build Trackable UTM Links in Seconds
              </h1>

              <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
                UTM parameters are simple tags added to any URL so you can see exactly which campaigns,
                ads, or emails bring visitors to your site. This tool builds those tagged links for you — instantly.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" className="gap-2 rounded-full px-8 text-base" asChild>
                  <a href="#builder">
                    Start Building
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-8 text-base" asChild>
                  <a href="#what-are-utms">Learn about UTMs</a>
                </Button>
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                {["100% Free", "No account needed", "Instant copy", "Privacy-friendly"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-foreground/40" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── What Are UTMs ── */}
        <section id="what-are-utms" className="py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-4 text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                <HelpCircle className="h-3 w-3" />
                The Basics
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
                What Are UTM Parameters?
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                UTM (Urchin Tracking Module) parameters are five short text snippets appended to a URL. When someone
                clicks a tagged link, your analytics tool reads those snippets and attributes the visit to the right
                source, medium, and campaign — giving you a clear picture of what's working and what isn't.
              </p>
            </motion.div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {utmParams.map((item, i) => (
                <motion.div
                  key={item.tag}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-2xl bg-card p-6 transition-all hover:shadow-md"
                >
                  <div className="mb-3 inline-flex items-center justify-center rounded-xl bg-accent px-3 py-1">
                    <code className="text-xs font-semibold text-accent-foreground">{item.tag}</code>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why UTMs Matter (comparison style like WhySwitchSection) ── */}
        <section className="py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-12 text-center"
              >
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
                  Why UTM Tracking Matters
                </h2>
                <p className="text-muted-foreground">
                  Stop guessing which marketing efforts work. UTMs give you hard data on every click.
                </p>
              </motion.div>

              <div className="space-y-3 mb-16">
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

              <div className="grid sm:grid-cols-3 gap-4">
                {whyCards.map((card, i) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="group rounded-2xl bg-card p-6 transition-all hover:shadow-md"
                  >
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-foreground">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 font-semibold text-foreground">{card.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{card.body}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Builder ── */}
        <section id="builder" className="relative overflow-hidden py-24 scroll-mt-20">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-200/40 via-rose-200/30 to-purple-200/20" />

          <div className="container relative mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
                Build Your Link
              </h2>
              <p className="text-muted-foreground">
                Fill in the fields below and your tagged URL appears instantly.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="rounded-2xl border border-border/60 bg-card/80 p-1 shadow-2xl shadow-foreground/5 backdrop-blur-sm">
                <div className="rounded-2xl bg-card p-6 md:p-8 space-y-5">
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
                      <p className="text-xs text-muted-foreground">{field.description}</p>
                    </div>
                  ))}

                  {/* Generated URL output */}
                  <div className="space-y-2 pt-4 border-t border-border/60">
                    <Label className="text-sm font-medium text-foreground">
                      Your Tagged URL
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-xl border border-border/60 bg-background p-4 text-sm break-all font-mono leading-relaxed min-h-[48px]">
                        {generatedUrl ? (
                          <span className="text-foreground">{generatedUrl}</span>
                        ) : (
                          <span className="text-muted-foreground/50">Fill in the fields above to generate your UTM link…</span>
                        )}
                      </div>
                      <Button
                        onClick={handleCopy}
                        variant="default"
                        disabled={!generatedUrl}
                        className="shrink-0 h-auto min-h-[48px] rounded-xl gap-2 px-5"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Platform CTA ── */}
        <section className="py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-4 text-center"
            >
              <div className="mb-5 flex items-center justify-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-foreground">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
                See Your UTM Data Come to Life
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                <span className="font-bold">adnived</span>Analytics is a lightweight, privacy-first analytics platform
                built for marketers who care about speed, simplicity, and respecting their visitors.
              </p>
            </motion.div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-3">
              {platformCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-2xl bg-card p-6 transition-all hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-foreground">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{card.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="relative overflow-hidden py-24">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-200/40 via-rose-200/30 to-purple-200/20" />
          <div className="container relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto max-w-2xl text-center"
            >
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
                Ready to track what matters?
              </h2>
              <p className="mb-8 text-muted-foreground">
                Join privacy-conscious businesses who trust adnived for their analytics.
              </p>

              <div className="mb-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                {["No credit card required", "Setup in 5 minutes", "Cancel anytime"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" className="gap-2 rounded-full px-8 text-base" asChild>
                  <Link to="/signup">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-8 text-base" asChild>
                  <Link to="/#features">
                    See All Features
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default UTMBuilder;
