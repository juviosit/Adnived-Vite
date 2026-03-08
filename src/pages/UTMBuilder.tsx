import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, Link2, BarChart3, ArrowRight, ExternalLink } from "lucide-react";
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
                Build UTM Links in Seconds
              </h1>
              <p className="text-lg text-foreground/60 max-w-xl mx-auto">
                Tag your marketing URLs with UTM parameters to track exactly where your traffic comes from. Works with any analytics platform.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Builder */}
        <section className="pb-16 md:pb-24">
          <div className="container max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
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

        {/* CTA to analytics */}
        <section className="py-16 md:py-20 border-t border-border/40">
          <div className="container max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                See Your UTM Data in Action
              </h2>
              <p className="text-foreground/60 max-w-md mx-auto">
                adnivedAnalytics is a privacy-first, cookie-free analytics platform that automatically tracks all your UTM campaigns with zero configuration.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button size="lg" className="rounded-full px-8 font-medium" asChild>
                  <Link to="/signup">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="lg" className="rounded-full px-6 font-medium" asChild>
                  <Link to="/#features">
                    See Features <ExternalLink className="ml-2 h-4 w-4" />
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
