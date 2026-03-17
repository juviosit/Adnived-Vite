import SEO from "@/components/SEO";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const GDPRCompliance = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "GDPR Compliant Web Analytics Without Cookie Banners",
    description:
      "Stop scaring visitors with cookie banners. adnivedAnalytics collects zero personal data, needs no consent, and is 100% GDPR compliant. Setup in 60 seconds.",
    author: { "@type": "Organization", name: "adnivedAnalytics" },
    publisher: { "@type": "Organization", name: "adnivedAnalytics", url: "https://adnived.com" },
    url: "https://adnived.com/gdpr-compliant-analytics",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="GDPR Compliant Web Analytics Without Cookie Banners"
        description="Stop scaring visitors with cookie banners. adnivedAnalytics collects zero personal data, needs no consent, and is 100% GDPR compliant. Setup in 60 seconds."
        path="/gdpr-compliant-analytics"
        type="article"
        jsonLd={jsonLd}
      />
      <Header />
      <main className="container max-w-3xl py-16">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/privacy-first">Privacy-First</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>GDPR Compliance</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Shield className="h-3.5 w-3.5" />
          Compliance Guide
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          GDPR Compliant Web Analytics - Without the Cookie Banner
        </h1>
        <p className="mb-10 text-lg text-muted-foreground">
          If your website has visitors from Europe, GDPR applies to you. It doesn't matter where your business is registered or where your servers are hosted. The moment an EU resident lands on your site and your analytics tool fires - you're in scope.
        </p>

        <div className="space-y-6 text-muted-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-foreground">
          <p>
            Most website owners know this. But few realise just how much traditional analytics tools complicate GDPR compliance. Cookie banners, consent management platforms, opt-in delays, data subject requests - it adds up fast.
          </p>
          <p>
            There's a cleaner way. One that doesn't involve scaring visitors with pop-ups before they've even seen your homepage.
          </p>
          <p>
            This guide covers what GDPR actually requires from website analytics, why most tools fail the standard, and how <Link to="/privacy-first" className="text-primary underline underline-offset-4 hover:text-primary/80">privacy-first analytics</Link> eliminates the problem entirely.
          </p>

          {/* What Is GDPR */}
          <h2>What Is GDPR - And Why Does It Affect Your Analytics?</h2>
          <p>
            The General Data Protection Regulation (GDPR) came into force on 25 May 2018. It's the EU's flagship data privacy law, and it applies to any organisation - anywhere in the world - that processes the personal data of EU residents.
          </p>
          <p>Under GDPR, "personal data" is defined broadly. It includes:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>IP addresses (even partial ones)</li>
            <li>Cookie identifiers and device fingerprints</li>
            <li>User IDs and session tokens</li>
            <li>Any data that can identify a person, directly or indirectly</li>
          </ul>
          <p>
            This matters because standard analytics tools - Google Analytics being the most widely used example - collect all of the above by default. Every pageview tracked, every session recorded, every user journey mapped: that's personal data under GDPR.
          </p>
          <p>And if you're collecting personal data, you need a lawful basis to do so.</p>

          {/* Why Traditional Tools Put You at Risk */}
          <h2>Why Traditional Analytics Tools Put You at Legal Risk</h2>
          <p>
            Here's what most website owners don't realise: consent is only one of six lawful bases under GDPR, but it's the only one that typically applies to behavioural web tracking for analytics purposes.
          </p>
          <p>That means before your analytics script can fire, you legally need:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>A cookie consent banner displayed before any tracking starts</li>
            <li>An explicit opt-in from the visitor - pre-ticked boxes don't count</li>
            <li>A clear way for users to withdraw consent at any time</li>
            <li>A record of when and how consent was given (for audit purposes)</li>
            <li>A process to respond to Subject Access Requests (SARs) within 30 days</li>
          </ul>
          <p>
            Every one of these requirements creates ongoing operational overhead. Cookie banners need to be maintained. Consent records need to be stored. Data deletion requests need to be processed.
          </p>
          <p>
            And if you get it wrong, the consequences are significant. GDPR penalties can reach <strong>€20 million or 4% of global annual turnover</strong> - whichever is higher. Regulators across Europe have shown they will act on complaints, including against smaller businesses.
          </p>
          <p>
            Beyond the legal risk, there's a practical problem: cookie consent banners reduce data quality. Studies consistently show that a significant portion of visitors decline analytics cookies, meaning you're making decisions based on an incomplete picture of your traffic.
          </p>
          <p>You lose compliance certainty. And you lose data accuracy. It's a poor trade-off.</p>

          {/* The Alternative */}
          <h2>The Alternative: Analytics That Don't Require Consent</h2>
          <p>
            The reason traditional analytics tools require consent is because they collect personal data. Remove the personal data, and you remove the need for consent.
          </p>
          <p>
            That's not a loophole - it's the correct application of GDPR. Article 2 is clear: the regulation applies to the processing of personal data. If no personal data is being processed, GDPR's consent requirements simply don't apply.
          </p>
          <p>
            Privacy-first analytics tools are built on this principle. Instead of tracking individuals, they measure aggregate patterns - sessions, page views, referrers, device types - without ever identifying who the visitor is.
          </p>
          <p>No personal data. No consent required. No cookie banner.</p>

          {/* How adnivedAnalytics Is Built for GDPR */}
          <h2>How adnivedAnalytics Is Built for GDPR Compliance</h2>
          <p>
            adnivedAnalytics was designed from the ground up around this principle. GDPR compliance isn't a feature that was bolted on - it's the foundation the product is built on.
          </p>
          <p>Here's what that looks like in practice:</p>

          <h3>No Cookies - Ever</h3>
          <p>
            The adnivedAnalytics script sets zero cookies. It doesn't use first-party cookies, third-party cookies, or local storage as a tracking mechanism. There is no persistent identifier placed on a visitor's device.
          </p>
          <p>This alone is the reason a cookie consent banner isn't needed. No cookies means no cookie consent law obligation.</p>

          <h3>IP Addresses Are Never Stored</h3>
          <p>
            When a visitor loads your page, their IP address is used momentarily to derive approximate geographic location (country and region level), then immediately discarded. It is never written to a database, never logged, never retained. There is no way to reconstruct who visited or where they came from at an individual level.
          </p>

          <h3>No Cross-Site Tracking</h3>
          <p>
            Each website using adnivedAnalytics is fully isolated. There's no shared identifier that follows a visitor from your site to another site. No behavioural profile is built. No data is used for advertising purposes or shared with any third party.
          </p>

          <h3>No Personal Data - By Design</h3>
          <p>
            The analytics data collected - page views, sessions, referral sources, browser types, country-level location, time on page - contains nothing that identifies a specific individual. It cannot be combined to re-identify a person. It is, in GDPR terms, not personal data.
          </p>

          <h3>No Consent Required - Legally</h3>
          <p>
            Because no personal data is processed, there is no requirement to establish a lawful basis under GDPR Article 6. adnivedAnalytics can be loaded on page render without asking for permission. This is not a workaround - it's a direct consequence of how the tool is built.
          </p>

          <h3>Privacy-First Infrastructure</h3>
          <p>
            Data is processed and stored with infrastructure chosen specifically for its privacy standards. No data is sent to third-party advertising networks or data brokers.
          </p>

          {/* Comparison Table */}
          <h2>adnivedAnalytics vs Google Analytics: GDPR Comparison</h2>
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
                  ["Cookie consent banner required", false, true],
                  ["Collects personal data", false, true],
                  ["Stores IP addresses", false, true],
                  ["Cross-site tracking", false, true],
                  ["Data sent to third parties", false, true],
                  ["Subject Access Requests possible", false, true],
                  ["GDPR-compliant by default", true, false],
                ].map(([label, adnived, ga]) => (
                  <tr key={label as string} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-2.5 text-foreground">{label as string}</td>
                    <td className="px-4 py-2.5 text-center">
                      {adnived ? (
                        <CheckCircle className="mx-auto h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-xs font-medium text-primary">No</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {ga ? (
                        <span className="text-xs font-medium text-destructive">Yes</span>
                      ) : (
                        <XCircle className="mx-auto h-4 w-4 text-destructive" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm">
            This table reflects default configurations. Google Analytics 4 has introduced some privacy controls, but the default installation still collects personal data, still sets cookies, and still sends data to Google's servers - all of which trigger GDPR consent requirements.
          </p>

          {/* Privacy Policy */}
          <h2>Do You Still Need a Privacy Policy?</h2>
          <p>
            Yes - and this is worth clarifying. Removing your cookie banner doesn't mean removing your <Link to="/privacy" className="text-primary underline underline-offset-4 hover:text-primary/80">privacy policy</Link>.
          </p>
          <p>
            A privacy policy explains how your site handles data broadly - including contact forms, email subscriptions, any third-party embeds, and your analytics. Even if your analytics tool collects no personal data, other parts of your website may.
          </p>
          <p>
            What changes with adnivedAnalytics is what you can say in that privacy policy: your analytics collects no personal data, sets no cookies, and requires no consent. That's a straightforward, honest disclosure - and a much more visitor-friendly one than the typical "we and our 487 partners may process your data" banner.
          </p>

          {/* Cookie Banner */}
          <h2>Can You Remove Your Cookie Banner Entirely?</h2>
          <p>
            If adnivedAnalytics is your only analytics tool and you don't use other cookie-setting services - no chat widgets, no advertising pixels, no social share buttons with tracking - then yes. You can remove your cookie consent banner entirely.
          </p>
          <p>
            This is increasingly valuable as browsers and users become more resistant to consent pop-ups. Removing the banner improves first impressions, reduces bounce rates on the consent screen, and ensures you capture 100% of your visitor data rather than only those who opted in.
          </p>
          <p>
            It also removes an ongoing compliance headache. No consent records to maintain. No withdrawal requests to process. No third-party Consent Management Platform (CMP) to pay for.
          </p>

          {/* What adnivedAnalytics Still Tells You */}
          <h2>What adnivedAnalytics Still Tells You</h2>
          <p>
            Privacy-first doesn't mean data-poor. adnivedAnalytics gives you a clear, real-time view of:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Traffic volume</strong> - sessions and unique visits over time</li>
            <li><strong>Top pages</strong> - which content is performing and what's being ignored</li>
            <li><strong>Referral sources</strong> - where your traffic is coming from (search, social, direct, other sites)</li>
            <li><strong>Geographic breakdown</strong> - country and region level, with no individual tracking</li>
            <li><strong>Device and browser data</strong> - desktop vs mobile, browser split</li>
            <li><strong>Entry and exit pages</strong> - where visitors land and where they leave</li>
          </ul>
          <p>
            For most websites - content blogs, SaaS products, agency sites, e-commerce - this is the data that actually drives decisions. You don't need individual user journeys to know that your pricing page has a high exit rate or that organic search is your biggest channel.
          </p>
          <p>
            You get the insight without the compliance burden. Learn more about all available metrics in our <Link to="/features" className="text-primary underline underline-offset-4 hover:text-primary/80">features overview</Link>.
          </p>

          {/* Who Is It For */}
          <h2>Who Is adnivedAnalytics For?</h2>
          <p>adnivedAnalytics is a good fit if you're a:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>SaaS founder</strong> who wants clean analytics without a legal team reviewing your data practices</li>
            <li><strong>Content publisher or blogger</strong> who's tired of cookie banners disrupting the reading experience</li>
            <li><strong>Agency or freelancer</strong> who wants to offer clients a privacy-compliant analytics solution</li>
            <li><strong>E-commerce operator</strong> with EU traffic who needs reliable data without consent-rate distortion</li>
            <li><strong>Developer</strong> who wants a lightweight script with a minimal performance footprint</li>
          </ul>
          <p>
            If your primary analytics need is aggregate traffic data and content performance - rather than deep individual user journey tracking - adnivedAnalytics is built for you. See our <Link to="/pricing" className="text-primary underline underline-offset-4 hover:text-primary/80">pricing plans</Link> to find the right fit.
          </p>

          {/* Getting Started */}
          <h2>Getting Started Takes Under 60 Seconds</h2>
          <p>
            There's no complex setup. No Google Tag Manager configuration. No data layer to implement. No cookie consent integration to wire up.
          </p>
          <p>
            Add a single script tag to your site's <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">&lt;head&gt;</code>. That's it. Check our <Link to="/docs/add-script" className="text-primary underline underline-offset-4 hover:text-primary/80">installation guide</Link> for step-by-step instructions.
          </p>
          <p>
            Your dashboard populates in real time. Your site loads faster without the consent management overhead. And your visitors see your homepage - not a legal disclaimer - the moment they arrive.
          </p>

          {/* CTA */}
          <h2>Stop Paying the Compliance Tax on Your Analytics</h2>
          <p>
            Cookie banners aren't just annoying - they're a symptom of an analytics approach that was never designed with privacy in mind. Retrofitting GDPR compliance onto a tool built to track individuals is expensive, fragile, and incomplete.
          </p>
          <p>
            adnivedAnalytics starts from a different premise: measure what matters, collect nothing personal, and let your visitors experience your site without friction.
          </p>
          <p className="text-lg font-medium text-foreground">
            GDPR compliance isn't a feature. It's the architecture.
          </p>
          <p>Try adnivedAnalytics free - no credit card required. Setup in under 60 seconds.</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/signup">
                Start Free - No Cookie Banner Required <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/docs">Read the Docs</Link>
            </Button>
          </div>

          {/* Related compliance links */}
          <div className="mt-12 rounded-xl border border-border/60 bg-card p-6">
            <h3 className="mb-4 text-foreground">Related compliance guides</h3>
            <div className="flex flex-wrap gap-3">
              <Link to="/ccpa-compliant-analytics" className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                CCPA Compliance
              </Link>
              <Link to="/pecr-compliant-analytics" className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                PECR Compliance
              </Link>
              <Link to="/privacy-first" className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                Privacy-First Analytics
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GDPRCompliance;
