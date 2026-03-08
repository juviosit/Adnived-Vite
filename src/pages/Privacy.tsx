import SEO from "@/components/SEO";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Privacy Policy" description="Learn how adnivedAnalytics handles data. We never use cookies, never track personal information, and are GDPR compliant by design." path="/privacy" />
      <Header />
      <main className="container max-w-3xl py-16">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
        <p className="mb-4 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-foreground">
          <p>
            At adnived analytics, privacy is at the core of everything we build. This policy explains how we handle data when you use our website and analytics service.
          </p>

          <h2>1. What We Collect</h2>
          <h3>Website Visitors (our marketing site)</h3>
          <p>
            We use our own privacy-first analytics to track aggregated page views. No cookies are set, no personal data is collected, and no IP addresses are stored. We do not use any third-party tracking scripts.
          </p>

          <h3>Registered Users (our analytics product)</h3>
          <p>
            When you sign up, we collect your email address and name to create your account. Payment information is processed securely through OnePay and is never stored on our servers.
          </p>

          <h2>2. Analytics Data We Process</h2>
          <p>
            When you add our tracking script to your website, we collect the following <strong>non-personal, aggregated</strong> data from your visitors:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Page URLs visited</li>
            <li>Referrer sources</li>
            <li>Browser and operating system type</li>
            <li>Device type and screen size</li>
            <li>Country, region, and city (derived from IP, which is immediately hashed and discarded)</li>
            <li>UTM campaign parameters</li>
          </ul>
          <p>
            We do <strong>not</strong> collect: cookies, IP addresses (stored), device fingerprints, cross-site identifiers, or any personally identifiable information.
          </p>

          <h2>3. How We Use Data</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>To provide you with aggregated website analytics</li>
            <li>To maintain and improve our service</li>
            <li>To process payments and manage subscriptions</li>
            <li>To communicate important service updates</li>
          </ul>

          <h2>4. Data Sharing</h2>
          <p>
            We do not sell, rent, or share your data with third parties for advertising or marketing purposes. Data may be shared only with service providers essential to operating our service (e.g., payment processing, hosting).
          </p>

          <h2>5. Data Retention</h2>
          <p>
            Analytics data is retained for as long as your account is active. IP-derived hashes are rotated daily and never stored permanently. You may export or delete your data at any time from your dashboard.
          </p>

          <h2>6. GDPR & CCPA Compliance</h2>
          <p>
            adnived analytics is fully compliant with GDPR, CCPA, and PECR. Because we do not collect personal data from your website visitors, no cookie consent banner is required when using our analytics script.
          </p>

          <h2>7. Your Rights</h2>
          <p>
            You have the right to access, correct, export, or delete your account data at any time. Contact us at <a href="mailto:privacy@adnived.com" className="text-primary hover:underline">privacy@adnived.com</a> for any data-related requests.
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will notify registered users of significant changes via email.
          </p>

          <h2>9. Contact</h2>
          <p>
            For questions about this privacy policy, contact us at <a href="mailto:privacy@adnived.com" className="text-primary hover:underline">privacy@adnived.com</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
