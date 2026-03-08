import SEO from "@/components/SEO";
import Header from "@/components/landing/Header";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Features – Privacy-First Web Analytics"
        description="Explore adnivedAnalytics features: real-time dashboard, UTM tracking, goals & funnels, geographic data, technology reports, CSV export — all without cookies."
        path="/features"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Features",
          url: "https://adnived.com/features",
          description: "Explore all features of adnivedAnalytics — privacy-first web analytics with real-time insights, goals, funnels, and more.",
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
                <BreadcrumbPage>Features</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Features;
