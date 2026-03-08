import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Copy, Check, Link2, BarChart3, ArrowRight, ExternalLink,
  ShieldCheck, Zap, Eye, Target, PieChart, Tag,
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="container max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-1.5 text-sm text-foreground/70 mb-6">
                <Link2 className="h-3.5 w-3.5" />
                Free UTM Link Builder
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
                Build Trackable UTM Links in&nbsp;Seconds
              </h1>
              <p className="text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
                UTM parameters are simple tags you add to any URL so you can see exactly which campaigns, ads, or emails
                drive traffic to your site. This free tool builds those tagged links for you — no&nbsp;sign&#8209;up&nbsp;required.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What are UTMs */}
        <section className="pb-12 md:pb-16">
          <div className="container max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                What Are UTM Parameters?
              </h2>
              <div className="space-y-4 text-foreground/70 leading-relaxed">
                <p>
                  UTM (Urchin Tracking Module) parameters are five short text snippets appended to a URL. When someone
                  clicks a tagged link, your analytics tool reads those snippets and attributes the visit to the right
                  source, medium, and campaign — giving you a clear picture of what's working and what isn't.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { tag: "utm_source", desc: "Where the traffic comes from — Google, a newsletter, Twitter, etc." },
                    { tag: "utm_medium", desc: "How the link is delivered — CPC ads, email, organic social, etc." },
                    { tag: "utm_campaign", desc: "The specific promotion — spring_sale, product_launch, etc." },
                    { tag: "utm_term", desc: "The paid keyword that triggered an ad (optional)." },
                    { tag: "utm_content", desc: "Differentiates variations of the same ad or link (optional)." },
                  ].map((item) => (
                    <div key={item.tag} className="rounded-lg border border-border/50 bg-card/50 p-3">
                      <code className="text-xs font-semibold text-primary">{item.tag}</code>
                      <p className="text-xs text-foreground/60 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why UTMs are useful */}
        <section className="pb-12 md:pb-16">
          <div className="container max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Why UTM Tracking Matters
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: Target,
                    title: "Know What Converts",
                    body: "See which channels actually drive sign-ups, purchases, or engagement — and stop guessing.",
                  },
                  {
                    icon: PieChart,
                    title: "Allocate Budget Wisely",
                    body: "Compare cost-per-click campaigns against organic and social to invest where ROI is highest.",
                  },
                  {
                    icon: Eye,
                    title: "A/B Test Everything",
                    body: "Use utm_content to tag link variations and see which creative or copy wins in real numbers.",
                  },
                ].map((card) => (
                  <div key={card.title} className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-2">
                    <card.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground text-sm">{card.title}</h3>
                    <p className="text-xs text-foreground/60 leading-relaxed">{card.body}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Builder */}
        <section className="pb-16 md:pb-24">
          <div className="container max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
                Build Your Link
              </h2>
              <p className="text-sm text-foreground/50 text-center mb-8">
                Fill in the fields below and your tagged URL appears instantly.
              </p>

              <Card className="border-border/50">
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
                        className="bg-background"
                      />
                      <p className="text-xs text-foreground/50">{field.description}</p>
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
                    <div className="flex-1 rounded-lg border border-border/50 bg-card px-4 py-3 text-sm text-foreground break-all font-mono leading-relaxed">
                      {generatedUrl}
                    </div>
                    <Button
                      onClick={handleCopy}
                      variant="default"
                      size="icon"
                      className="shrink-0 h-auto min-h-[48px]"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Platform value props */}
        <section className="py-16 md:py-20 border-t border-border/40">
          <div className="container max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <div className="flex items-center justify-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                See Your UTM Data Come to Life
              </h2>
              <p className="text-foreground/60 max-w-xl mx-auto leading-relaxed">
                adnivedAnalytics is a lightweight, privacy-first analytics platform built for marketers who care about
                speed, simplicity, and respecting their visitors.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              {[
                {
                  icon: Zap,
                  title: "Blazing Fast",
                  body: "Our tracking script is under 1 KB — it loads instantly and never slows your site down. Your dashboard loads in milliseconds, not seconds.",
                },
                {
                  icon: ShieldCheck,
                  title: "Privacy First",
                  body: "No cookies, no fingerprinting, no personal data collected. Fully compliant with GDPR and CCPA — no consent banners needed.",
                },
                {
                  icon: Tag,
                  title: "Automatic UTM Tracking",
                  body: "Every UTM-tagged visit is captured and broken down automatically — by source, medium, campaign, term, and content. Zero configuration required.",
                },
              ].map((card) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-2"
                >
                  <card.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">{card.title}</h3>
                  <p className="text-xs text-foreground/60 leading-relaxed">{card.body}</p>
                </motion.div>
              ))}
            </div>

            <div className="text-center space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" className="rounded-full px-8 font-medium" asChild>
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
              <p className="text-xs text-foreground/40">No credit card required · Free plan available forever</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default UTMBuilder;
