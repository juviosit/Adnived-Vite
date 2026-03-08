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
        title="Features - Privacy-First Web Analytics"
        description="Explore adnivedAnalytics features: real-time dashboard, UTM tracking, goals and funnels, geographic data, technology reports, CSV export. Cookie-free, lightweight, and privacy-compliant analytics."
        path="/features"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Features",
          url: "https://adnived.com/features",
          description: "Explore all features of adnivedAnalytics. Privacy-first web analytics with real-time insights, goals, funnels, and more.",
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
        <section className="py-16 pb-0">
          <div className="container text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Privacy-First Web Analytics Features
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Everything you need to understand your website traffic, without compromising visitor privacy. Cookie-free, lightweight, and fully compliant.
            </p>
          </div>
        </section>
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Features;
