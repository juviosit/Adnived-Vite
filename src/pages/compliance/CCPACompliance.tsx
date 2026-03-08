import SEO from "@/components/SEO";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, ArrowRight } from "lucide-react";

const CCPACompliance = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "CCPA Compliant Web Analytics - Respect California Privacy Rights",
    description:
      "Understand CCPA requirements for website analytics and how adnivedAnalytics helps you stay compliant without selling visitor data.",
    author: { "@type": "Organization", name: "adnivedAnalytics" },
    publisher: { "@type": "Organization", name: "adnivedAnalytics", url: "https://adnived.com" },
    url: "https://adnived.com/ccpa-compliant-analytics",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="CCPA Compliant Web Analytics"
        description="adnivedAnalytics is fully CCPA compliant. No personal information collected, no data sold to third parties. Privacy-first analytics for California compliance."
        path="/ccpa-compliant-analytics"
        type="article"
        jsonLd={jsonLd}
      />
      <Header />
      <main className="container max-w-3xl py-16">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Shield className="h-3.5 w-3.5" />
          Compliance Guide
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          CCPA Compliant Web Analytics - No Data Selling, Ever
        </h1>
        <p className="mb-10 text-lg text-muted-foreground">
          The California Consumer Privacy Act (CCPA) gives California residents the right to know what data is collected about them and to opt out of its sale. Here's how adnivedAnalytics keeps you compliant.
        </p>

        <div className="space-y-8 text-muted-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-foreground">
          <h2>What Is CCPA?</h2>
          <p>
            The <strong>California Consumer Privacy Act (CCPA)</strong>, effective since January 1, 2020, and strengthened by the California Privacy Rights Act (CPRA) in 2023, is one of the most comprehensive state-level privacy laws in the United States.
          </p>
          <p>
            CCPA applies to any business that collects personal information from California residents — regardless of where the business is located — if it meets certain revenue or data volume thresholds. Under CCPA, "personal information" includes IP addresses, device identifiers, browsing history, and geolocation data.
          </p>

          <h2>Key CCPA Rights for Consumers</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Right to Know:</strong> Consumers can request what personal information you've collected about them</li>
            <li><strong>Right to Delete:</strong> Consumers can ask you to delete their personal information</li>
            <li><strong>Right to Opt-Out:</strong> Consumers can tell you not to sell or share their personal information</li>
            <li><strong>Right to Non-Discrimination:</strong> You can't penalise consumers who exercise their privacy rights</li>
            <li><strong>Right to Correct:</strong> Consumers can request corrections to inaccurate personal data (added by CPRA)</li>
          </ul>

          <h2>Why Traditional Analytics Creates CCPA Problems</h2>
          <p>
            Tools like Google Analytics collect IP addresses, set persistent cookies, and build user profiles across websites. Under CCPA, this constitutes collecting and potentially "selling" personal information, which triggers requirements to:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Provide a "Do Not Sell My Personal Information" link</li>
            <li>Honour opt-out requests within 15 business days</li>
            <li>Disclose data collection practices in your privacy policy</li>
            <li>Respond to consumer data access and deletion requests</li>
            <li>Maintain records of all data processing activities</li>
          </ul>

          <h2>How adnivedAnalytics Simplifies CCPA Compliance</h2>
          <p>
            Because adnivedAnalytics never collects personal information from your website visitors, most CCPA obligations simply don't apply to your analytics data:
          </p>

          <div className="my-6 space-y-3">
            {[
              { title: "No personal information collected", desc: "We don't collect IP addresses, device fingerprints, or any data that identifies individuals. There's nothing to disclose, delete, or opt out of." },
              { title: "No data sold or shared", desc: "Your analytics data stays with you. We never sell, share, or transfer visitor data to third parties for advertising or any other purpose." },
              { title: "No \"Do Not Sell\" link required", desc: "Since we don't sell personal information, you don't need to add opt-out mechanisms for your analytics." },
              { title: "No consumer requests to handle", desc: "Without personal data in your analytics, there are no access, deletion, or correction requests to process for visitor data." },
              { title: "No cookies or tracking identifiers", desc: "We set zero cookies and use no persistent identifiers. Unique visitors are counted via a daily-rotating hash that's impossible to reverse." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 rounded-xl border border-border/60 bg-card p-4">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h2>CCPA Compliance Checklist with adnivedAnalytics</h2>
          <div className="my-4 overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-foreground">CCPA Requirement</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">With adnivedAnalytics</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Disclose data collection", "Minimal — no personal data collected from visitors"],
                  ["\"Do Not Sell\" link", "Not required — no data is sold"],
                  ["Honour opt-out requests", "N/A — nothing to opt out of"],
                  ["Consumer access requests", "N/A — no personal data stored"],
                  ["Consumer deletion requests", "N/A — nothing to delete"],
                  ["Privacy policy update", "Simplified — can state no personal visitor data is collected"],
                ].map(([req, status]) => (
                  <tr key={req} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-2.5 text-foreground">{req}</td>
                    <td className="px-4 py-2.5">{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Start Tracking Without CCPA Worries</h2>
          <p>
            Switch to adnivedAnalytics and eliminate the CCPA compliance burden for your website analytics. One script tag, under 60 seconds to set up, and zero personal data collected.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/signup">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/privacy">Our Privacy Policy</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CCPACompliance;
