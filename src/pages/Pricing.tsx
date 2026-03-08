import SEO from "@/components/SEO";
import Header from "@/components/landing/Header";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing - Simple, Transparent Analytics Plans"
        description="adnivedAnalytics pricing: Free plan with 1,000 pageviews, Pro at $5/mo for 100K pageviews, Max at $10/mo for 10M pageviews. Affordable web analytics with no hidden fees."
        path="/pricing"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Pricing",
          url: "https://adnived.com/pricing",
          description: "Simple, transparent pricing for privacy-first web analytics. Free analytics plan available, upgrade as you grow.",
          isPartOf: { "@type": "WebSite", name: "adnivedAnalytics", url: "https://adnived.com" },
        }}
      />
      <Header />
      <main>
        <div className="container pt-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Pricing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <section className="py-16 pb-0">
          <div className="container text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Simple, Transparent Analytics Pricing
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Start free, upgrade as you grow. No hidden fees, no surprises. Every plan includes all features.
            </p>
          </div>
        </section>
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
