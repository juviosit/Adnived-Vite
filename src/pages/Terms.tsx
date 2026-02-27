import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-3xl py-16">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">Terms of Service</h1>
        <p className="mb-4 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground">
          <p>
            Welcome to adnived analytics. By using our service, you agree to the following terms.
          </p>

          <h2>1. Service Description</h2>
          <p>
            adnived analytics provides privacy-first web analytics. We offer a tracking script that collects aggregated, anonymous visitor data for websites. Our service does not use cookies or collect personal data from your website visitors.
          </p>

          <h2>2. Account Registration</h2>
          <p>
            You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. You must be at least 18 years old to use this service.
          </p>

          <h2>3. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Send artificially inflated traffic to manipulate analytics data</li>
            <li>Resell or redistribute the service without authorization</li>
            <li>Use the service to track individuals or collect personal data</li>
          </ul>

          <h2>4. Plans & Billing</h2>
          <p>
            Paid plans are billed on a recurring basis. You may cancel at any time; your access continues until the end of the current billing period. Refunds are handled on a case-by-case basis. We reserve the right to change pricing with 30 days' notice.
          </p>

          <h2>5. Data Ownership</h2>
          <p>
            You retain full ownership of your analytics data. We do not claim any rights to the data collected through your websites. You may export or delete your data at any time.
          </p>

          <h2>6. Service Availability</h2>
          <p>
            We strive for high uptime but do not guarantee uninterrupted service. We are not liable for any damages resulting from service downtime or data loss. We recommend exporting important data regularly.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            adnived analytics is provided "as is" without warranties of any kind. Our total liability is limited to the amount you have paid us in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.
          </p>

          <h2>8. Termination</h2>
          <p>
            We may suspend or terminate your account for violations of these terms. You may delete your account at any time. Upon termination, your data will be deleted within 30 days.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the service after changes constitutes acceptance. We will notify users of material changes via email.
          </p>

          <h2>10. Contact</h2>
          <p>
            For questions about these terms, contact us at <a href="mailto:hello@adnived.com" className="text-primary hover:underline">hello@adnived.com</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
