import SEO from "@/components/SEO";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle, ArrowRight } from "lucide-react";

const PECRCompliance = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "PECR Compliant Web Analytics — No Cookies, No Consent Pop-ups",
    description:
      "Understand PECR cookie rules for UK websites and how adnivedAnalytics lets you track visitors without consent pop-ups.",
    author: { "@type": "Organization", name: "adnivedAnalytics" },
    publisher: { "@type": "Organization", name: "adnivedAnalytics", url: "https://adnived.com" },
    url: "https://adnived.com/pecr-compliant-analytics",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="PECR Compliant Web Analytics"
        description="adnivedAnalytics is PECR compliant by design. No cookies stored, no consent pop-ups needed. Privacy-first analytics for UK websites."
        path="/pecr-compliant-analytics"
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
          PECR Compliant Web Analytics — Drop the Cookie Pop-up
        </h1>
        <p className="mb-10 text-lg text-muted-foreground">
          PECR (Privacy and Electronic Communications Regulations) is the UK law that governs cookies and electronic tracking. If your website uses cookies, you need consent. With adnivedAnalytics, you don't need either.
        </p>

        <div className="space-y-8 text-muted-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-foreground">
          <h2>What Is PECR?</h2>
          <p>
            The <strong>Privacy and Electronic Communications Regulations (PECR)</strong> is UK law that sits alongside the UK GDPR. While GDPR focuses on personal data broadly, PECR specifically regulates the use of cookies, tracking technologies, and electronic communications.
          </p>
          <p>
            PECR is enforced by the <strong>Information Commissioner's Office (ICO)</strong> and applies to any website that stores or accesses information on a user's device — which includes analytics cookies, tracking pixels, and local storage.
          </p>

          <h2>PECR Cookie Rules — The Basics</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Consent required:</strong> You must get clear, informed consent before setting any non-essential cookies</li>
            <li><strong>No pre-ticked boxes:</strong> Consent must be an active, affirmative action by the user</li>
            <li><strong>Easy withdrawal:</strong> Users must be able to withdraw consent as easily as they gave it</li>
            <li><strong>Clear information:</strong> You must explain what each cookie does and why it's used</li>
            <li><strong>"Strictly necessary" exception:</strong> Only cookies essential for delivering a service the user has requested are exempt from consent</li>
          </ul>
          <p>
            Analytics cookies are <strong>not</strong> considered "strictly necessary" under PECR. This means Google Analytics, Hotjar, Mixpanel, and similar tools all require a consent banner in the UK.
          </p>

          <h2>How adnivedAnalytics Avoids PECR Entirely</h2>
          <p>
            adnivedAnalytics doesn't set cookies, doesn't use local storage, and doesn't store any information on the user's device. This means PECR's consent requirements simply don't apply.
          </p>

          <div className="my-6 grid gap-4 sm:grid-cols-2">
            {[
              { icon: CheckCircle, ok: true, label: "No cookies set", desc: "Zero cookies of any kind — session, persistent, or third-party" },
              { icon: CheckCircle, ok: true, label: "No local storage", desc: "Nothing written to localStorage, sessionStorage, or IndexedDB" },
              { icon: CheckCircle, ok: true, label: "No tracking pixels", desc: "Pure JavaScript — no hidden images or pixel trackers" },
              { icon: CheckCircle, ok: true, label: "No device fingerprinting", desc: "No canvas, WebGL, or audio fingerprinting techniques" },
              { icon: CheckCircle, ok: true, label: "No consent pop-up needed", desc: "Load the script immediately without any consent mechanism" },
              { icon: CheckCircle, ok: true, label: "ICO guidance aligned", desc: "Follows ICO recommendations for privacy-preserving analytics" },
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

          <h2>PECR Compliance: adnivedAnalytics vs Traditional Tools</h2>
          <div className="my-4 overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-foreground">PECR Requirement</th>
                  <th className="px-4 py-3 text-center font-medium text-foreground">adnivedAnalytics</th>
                  <th className="px-4 py-3 text-center font-medium text-foreground">Google Analytics</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Sets cookies", false, true],
                  ["Requires consent banner", false, true],
                  ["Uses device storage", false, true],
                  ["Can run without opt-in", true, false],
                  ["Tracks cross-site", false, true],
                  ["ICO-friendly approach", true, false],
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

          <h2>What the ICO Says About Analytics</h2>
          <p>
            The ICO has consistently stated that analytics cookies require consent under PECR. Their guidance explicitly says that "performance" or "analytics" cookies are not strictly necessary and therefore need user opt-in.
          </p>
          <p>
            By using a cookie-free analytics solution like adnivedAnalytics, you avoid this requirement entirely — giving you accurate, complete data from 100% of your visitors rather than only those who consent.
          </p>

          <h2>Get PECR-Compliant Analytics Today</h2>
          <p>
            Remove your cookie banner and start getting accurate analytics from every single visitor. adnivedAnalytics takes under 60 seconds to set up.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/signup">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/gdpr-compliant-analytics">Read GDPR Guide</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PECRCompliance;
