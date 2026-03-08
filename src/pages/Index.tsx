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
