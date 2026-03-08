import SEO from "@/components/SEO";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle, ArrowRight } from "lucide-react";

const GDPRCompliance = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "GDPR Compliant Web Analytics - No Cookies, No Consent Banners",
    description:
      "Learn what GDPR means for your website analytics and how adnivedAnalytics helps you stay compliant without cookie banners.",
    author: { "@type": "Organization", name: "adnivedAnalytics" },
    publisher: { "@type": "Organization", name: "adnivedAnalytics", url: "https://adnived.com" },
    url: "https://adnived.com/gdpr-compliant-analytics",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="GDPR Compliant Web Analytics"
        description="adnivedAnalytics is GDPR compliant by design. No cookies, no personal data, no consent banners. Track website visitors while respecting EU privacy law."
        path="/gdpr-compliant-analytics"
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
          GDPR Compliant Web Analytics - Without Cookie Banners
        </h1>
        <p className="mb-10 text-lg text-muted-foreground">
          The General Data Protection Regulation (GDPR) is the EU's landmark privacy law. If your website has European visitors, it applies to you, even if your business is based elsewhere.
        </p>

        <div className="space-y-8 text-muted-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-foreground">
          <h2>What Is GDPR?</h2>
          <p>
            The <strong>General Data Protection Regulation (GDPR)</strong> came into effect on 25 May 2018. It gives EU residents control over their personal data and places strict obligations on any organisation that collects, stores, or processes it — including through website analytics.
          </p>
          <p>
            Under GDPR, personal data includes IP addresses, device identifiers, cookies, and any information that can directly or indirectly identify a person. Traditional analytics tools like Google Analytics collect all of these, making them subject to GDPR consent requirements.
          </p>

          <h2>Why Most Analytics Tools Break GDPR</h2>
          <p>
            Conventional analytics platforms set cookies, store IP addresses, and build cross-site profiles. Under GDPR, this means you must:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Display a cookie consent banner before loading any tracking script</li>
            <li>Wait for explicit opt-in before collecting data</li>
            <li>Maintain records of consent for every visitor</li>
            <li>Allow visitors to withdraw consent at any time</li>
            <li>Respond to Subject Access Requests (SARs) within 30 days</li>
          </ul>
          <p>
            Non-compliance can result in fines of up to <strong>€20 million or 4% of annual global turnover</strong> — whichever is higher.
          </p>

          <h2>How adnivedAnalytics Makes GDPR Effortless</h2>
          <p>
            adnivedAnalytics is built from the ground up to be GDPR compliant <strong>by design</strong>, not by afterthought. Here's how:
          </p>

          <div className="my-6 grid gap-4 sm:grid-cols-2">
            {[
              { icon: CheckCircle, label: "Zero cookies, ever", desc: "No cookie consent banner needed" },
              { icon: CheckCircle, label: "No IP storage", desc: "IPs are hashed daily and discarded" },
              { icon: CheckCircle, label: "No cross-site tracking", desc: "Each site is fully isolated" },
              { icon: CheckCircle, label: "No personal data", desc: "Nothing that identifies individuals" },
              { icon: CheckCircle, label: "No consent required", desc: "Load the script without asking permission" },
              { icon: CheckCircle, label: "EU-friendly hosting", desc: "Data processed with privacy-first infrastructure" },
            ].map((item) => (
              <div key={item.label} className="flex gap-3 rounded-xl border border-border/60 bg-card p-4">
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h2>adnivedAnalytics vs Google Analytics - GDPR Comparison</h2>
          <div className="my-4 overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-foreground">Requirement</th>
                  <th className="px-4 py-3 text-center font-medium text-foreground">adnivedAnalytics</th>
                  <th className="px-4 py-3 text-center font-medium text-foreground">Google Analytics</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Cookie consent banner", true, false],
                  ["Works without visitor opt-in", true, false],
                  ["No personal data collected", true, false],
                  ["No cross-site tracking", true, false],
                  ["IP addresses discarded", true, false],
                  ["No data sent to third parties", true, false],
                  ["Subject Access Requests needed", false, true],
                ].map(([label, adnived, ga]) => (
                  <tr key={label as string} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-2.5 text-foreground">{label as string}</td>
                    <td className="px-4 py-2.5 text-center">
                      {adnived ? <CheckCircle className="mx-auto h-4 w-4 text-primary" /> : <XCircle className="mx-auto h-4 w-4 text-destructive" />}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {ga ? <CheckCircle className="mx-auto h-4 w-4 text-primary" /> : <XCircle className="mx-auto h-4 w-4 text-destructive" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Do I Still Need a Cookie Banner?</h2>
          <p>
            <strong>No.</strong> If adnivedAnalytics is your only analytics tool and you don't use other cookie-setting services, you can remove your cookie consent banner entirely. Our script sets zero cookies, stores no personal data, and requires no legal basis for processing under GDPR.
          </p>

          <h2>Ready to Go GDPR-Compliant?</h2>
          <p>
            Switch to adnivedAnalytics and drop the cookie banner today. Setup takes under 60 seconds — just add a single script tag.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/signup">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/docs">Read the Docs</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GDPRCompliance;
