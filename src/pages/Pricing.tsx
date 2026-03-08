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
        title="Pricing – Simple, Transparent Analytics Plans"
        description="adnivedAnalytics pricing: Free tier with 1,000 pageviews, Pro at $5/mo for 100K pageviews, Max at $10/mo for 10M pageviews. No hidden fees."
        path="/pricing"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Pricing",
          url: "https://adnived.com/pricing",
          description: "Simple, transparent pricing for privacy-first web analytics. Start free, upgrade as you grow.",
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
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
