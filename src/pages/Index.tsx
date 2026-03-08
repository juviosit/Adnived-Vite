import SEO from "@/components/SEO";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import WhySwitchSection from "@/components/landing/WhySwitchSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import SetupSection from "@/components/landing/SetupSection";
import PrivacySection from "@/components/landing/PrivacySection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="adnivedAnalytics - Privacy-First Web Analytics"
        description="Powerful, lightweight web analytics without cookies. Track visitors, pageviews, and conversions while respecting user privacy. GDPR compliant out of the box."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "adnivedAnalytics",
          applicationCategory: "WebApplication",
          operatingSystem: "Web",
          description: "Powerful, lightweight analytics without cookies. GDPR compliant out of the box.",
          url: "https://adnived.com",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free tier available" },
          featureList: ["Privacy-first analytics", "No cookies", "GDPR compliant", "Real-time dashboard", "UTM tracking", "Goals & Funnels"],
        }}
      />
      <Header />
      <main>
        <HeroSection />
        <WhySwitchSection />
        <FeaturesSection />
        <SetupSection />
        <PrivacySection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
