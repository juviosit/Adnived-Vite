import { useState } from "react";
import { Shield, Eye, EyeOff, Cookie, Fingerprint, Database, Server, Hash, Trash2, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SEO from "@/components/SEO";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const closureSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
  reason: z.string().trim().max(1000, "Reason must be under 1000 characters").optional(),
});

type ClosureForm = z.infer<typeof closureSchema>;

const principles = [
  { icon: Cookie, title: "No cookies", description: "We never set cookies on your visitors' browsers. No consent banners needed." },
  { icon: Fingerprint, title: "No fingerprinting", description: "We don't generate device fingerprints. Each visitor remains completely anonymous." },
  { icon: EyeOff, title: "No cross-site tracking", description: "We don't follow your visitors across the web. Every site is isolated." },
  { icon: Hash, title: "IP hashing & rotation", description: "IP addresses are hashed with a daily-rotating salt, then immediately discarded. The hash is used only for unique visitor counting within a single day." },
  { icon: Database, title: "No personal data stored", description: "We store only aggregated metrics: page URLs, referrers, browser/OS type, device category, country, and UTM parameters. Nothing personally identifiable." },
  { icon: Server, title: "Edge-processed", description: "All data is processed at the edge. IP addresses never reach our database — they're hashed in-memory and thrown away." },
];

const WhyNoSocial = () => {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ClosureForm>({
    resolver: zodResolver(closureSchema),
    defaultValues: { email: "", reason: "" },
  });

  const onSubmit = async (values: ClosureForm) => {
    if (!user) {
      toast.error("Please log in to submit an account closure request.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("account_closure_requests").insert({
      user_id: user.id,
      email: values.email,
      reason: values.reason || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to submit request. Please try again.");
      return;
    }
    setSubmitted(true);
    toast.success("Account closure request submitted.");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Why We're Not on Social Media"
        description="We practice what we preach. Learn why adnivedAnalytics chooses not to be on social media and how our privacy-first analytics platform works."
        path="/why-no-social"
      />
      <Header />
      <main className="container max-w-3xl py-16">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Why aren't we on social media?
          </h1>
          <p className="mb-12 text-lg text-muted-foreground leading-relaxed">
            Because we believe in privacy — not just as a product feature, but as a principle we live by.
            Social media platforms thrive on tracking, profiling, and monetising attention. We built adnivedAnalytics
            to be the opposite of that. It would be contradictory for a privacy-first company to feed the very
            ecosystem it was designed to replace.
          </p>
        </motion.div>

        {/* How it works */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <h2 className="mb-2 text-2xl font-bold text-foreground">How our platform works</h2>
          <p className="mb-8 text-muted-foreground">
            When a visitor lands on a website running our script, here's exactly what happens — and what doesn't.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {principles.map((p) => (
              <div key={p.title} className="rounded-xl bg-card p-5 border border-border/50">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <p.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold text-foreground">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Data flow */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <h2 className="mb-4 text-2xl font-bold text-foreground">What about paid plan users?</h2>
          <div className="rounded-xl bg-card p-6 border border-border/50 space-y-4 text-muted-foreground">
            <p>
              If you're on a paid plan, we store the minimum information needed to manage your subscription:
              your <strong className="text-foreground">email address</strong>, <strong className="text-foreground">name</strong>,
              and <strong className="text-foreground">payment transaction records</strong>. That's it.
            </p>
            <p>
              We don't build profiles, we don't sell data, and we don't use your information for anything
              other than keeping your account running.
            </p>
            <p>
              If you ever want to leave, you can submit an <strong className="text-foreground">account closure request</strong> below.
              We'll delete your account and all associated data permanently. No dark patterns, no "are you sure?" loops.
            </p>
          </div>
        </motion.section>

        {/* Account closure form */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="mb-2 text-2xl font-bold text-foreground flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Request account closure
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Submit this form to request permanent deletion of your account and all associated data.
            {!user && " You'll need to log in first."}
          </p>

          {submitted ? (
            <div className="flex items-center gap-3 rounded-xl bg-card p-6 border border-border/50 text-foreground">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <p>Your account closure request has been submitted. We'll process it within 48 hours and notify you by email.</p>
            </div>
          ) : (
            <div className="rounded-xl bg-card p-6 border border-border/50">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for leaving (optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Help us improve — why are you closing your account?" rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading || !user} className="gap-2">
                    <Send className="h-4 w-4" />
                    {loading ? "Submitting…" : "Submit closure request"}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </motion.section>
      </main>
      <Footer />
    </div>
  );
};

export default WhyNoSocial;
