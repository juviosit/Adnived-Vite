import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SEO from "@/components/SEO";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  contact_number: z.string().trim().max(30).optional(),
  inquiry_type: z.enum(["sales", "support", "on-prem", "data-delete"]),
  message: z.string().trim().min(1, "Please describe your inquiry").max(2000),
});

type ContactForm = z.infer<typeof contactSchema>;

const inquiryLabels: Record<string, string> = {
  sales: "Sales",
  support: "Support",
  "on-prem": "On-Premise",
  "data-delete": "Data Deletion",
};

const Contact = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { inquiry_type: "support" },
  });

  const onSubmit = async (data: ContactForm) => {
    setSubmitting(true);
    const { error } = await supabase.from("contact_submissions").insert({
      name: data.name,
      email: data.email,
      contact_number: data.contact_number || null,
      inquiry_type: data.inquiry_type,
      message: data.message,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
    } else {
      toast({ title: "Message sent!", description: "We'll get back to you shortly." });
      reset();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Contact Us - adnivedAnalytics" description="Get in touch with adnivedAnalytics for sales, support, on-premise deployments, or data deletion requests." path="/contact" />
      <Header />
      <main className="py-20">
        <div className="container max-w-xl">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">Contact us</h1>
          <p className="mb-10 text-muted-foreground">Fill out the form and our team will respond within 24 hours.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name")} className="mt-1.5" />
              {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register("email")} className="mt-1.5" />
              {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="contact_number">Contact number</Label>
              <Input id="contact_number" {...register("contact_number")} className="mt-1.5" placeholder="Optional" />
            </div>

            <div>
              <Label>Inquiry type *</Label>
              <Select defaultValue="support" onValueChange={(v) => setValue("inquiry_type", v as ContactForm["inquiry_type"])}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(inquiryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message">Your inquiry *</Label>
              <Textarea id="message" rows={5} {...register("message")} className="mt-1.5" placeholder="Tell us how we can help..." />
              {errors.message && <p className="mt-1 text-sm text-destructive">{errors.message.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Sending..." : "Send message"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
