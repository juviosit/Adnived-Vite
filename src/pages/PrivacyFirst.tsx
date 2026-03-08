import SEO from "@/components/SEO";
import Header from "@/components/landing/Header";
import PrivacySection from "@/components/landing/PrivacySection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

const PrivacyFirst = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy-First Analytics – No Cookies, No Tracking"
        description="adnivedAnalytics is built for a privacy-first world. No cookies, no personal data, no consent banners. Fully GDPR, CCPA, and PECR compliant by design."
        path="/privacy-first"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Privacy-First Analytics",
          url: "https://adnived.com/privacy-first",
          description: "Privacy-first web analytics without cookies or personal data collection. GDPR, CCPA, and PECR compliant.",
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
                <BreadcrumbPage>Privacy-First</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <PrivacySection />
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">Compliance resources</h2>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/gdpr-compliant-analytics" className="rounded-xl bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                  GDPR Compliance
                </Link>
                <Link to="/ccpa-compliant-analytics" className="rounded-xl bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                  CCPA Compliance
                </Link>
                <Link to="/pecr-compliant-analytics" className="rounded-xl bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                  PECR Compliance
                </Link>
              </div>
            </div>
          </div>
        </section>
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyFirst;
