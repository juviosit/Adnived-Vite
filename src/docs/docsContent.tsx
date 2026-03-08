import { Link } from "react-router-dom";
import { ComponentType } from "react";

/* ─── Reusable doc primitives ─── */
const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">{children}</code>
);

const CodeBlock = ({ children, title }: { children: string; title?: string }) => (
  <div className="my-4 rounded-xl border border-border bg-card overflow-hidden">
    {title && (
      <div className="border-b border-border px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
      </div>
    )}
    <pre className="overflow-x-auto p-4 text-sm font-mono text-foreground leading-relaxed">
      {children}
    </pre>
  </div>
);

const Tip = ({ children }: { children: React.ReactNode }) => (
  <div className="my-4 rounded-xl border-l-4 border-primary bg-accent/50 p-4 text-sm text-foreground">
    <strong className="text-primary">Tip: </strong>{children}
  </div>
);

const Warning = ({ children }: { children: React.ReactNode }) => (
  <div className="my-4 rounded-xl border-l-4 border-destructive bg-destructive/10 p-4 text-sm text-foreground">
    <strong className="text-destructive">Important: </strong>{children}
  </div>
);

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-10 mb-4 text-xl font-bold text-foreground">{children}</h2>
);

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mt-6 mb-3 text-lg font-semibold text-foreground">{children}</h3>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{children}</p>
);

const Ul = ({ children }: { children: React.ReactNode }) => (
  <ul className="mb-4 space-y-2 pl-6 list-disc text-sm text-muted-foreground">{children}</ul>
);

const Li = ({ children }: { children: React.ReactNode }) => <li>{children}</li>;

const DocLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link to={`/docs/${to}`} className="text-primary hover:underline">{children}</Link>
);

const Table = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <div className="my-4 overflow-x-auto rounded-xl border border-border">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border bg-muted/50">
          {headers.map((h) => (
            <th key={h} className="px-4 py-2 text-left font-semibold text-foreground">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-border last:border-0">
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-2 text-muted-foreground">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ═══════════════════════════════════════════════════
   DOCUMENTATION CONTENT
   ═══════════════════════════════════════════════════ */

const Welcome = () => (
  <>
    <P>
      adnived analytics is an easy-to-use, lightweight, and privacy-friendly web analytics tool.
      It helps you understand your website traffic without compromising visitor privacy — no cookies, no personal data, no consent banners needed.
    </P>

    <H2>New to adnived? Start here</H2>
    <ol className="mb-6 space-y-2 pl-6 list-decimal text-sm text-muted-foreground">
      <li><DocLink to="register-account">Register for an account</DocLink></li>
      <li><DocLink to="add-website">Add your website</DocLink></li>
      <li><DocLink to="add-script">Add the tracking script</DocLink></li>
      <li><DocLink to="verify-installation">Check your installation</DocLink></li>
    </ol>
    <P>Once set up, explore the <DocLink to="dashboard-guide">stats dashboard</DocLink> to see your data.</P>

    <H2>Popular topics</H2>
    <Table
      headers={["Topic", "Description"]}
      rows={[
        ["Goal conversions", "Track signups, purchases, downloads and other actions"],
        ["Funnel analysis", "Follow the visitor journey from landing page to conversion"],
        ["UTM campaigns", "Track your marketing campaigns with UTM tags"],
        ["Privacy", "Learn how we protect visitor privacy by design"],
        ["Team access", "Invite team members and manage roles"],
      ]}
    />

    <H2>Get the most out of adnived</H2>
    <Ul>
      <Li>Set up <DocLink to="goal-conversions">goal conversions</DocLink> to track key actions</Li>
      <Li>Use <DocLink to="utm-tracking">UTM parameters</DocLink> to measure campaign performance</Li>
      <Li>Create <DocLink to="funnel-analysis">funnels</DocLink> to optimize your conversion path</Li>
      <Li>Share dashboards with <DocLink to="shared-links">public links</DocLink></Li>
    </Ul>
  </>
);

const RegisterAccount = () => (
  <>
    <P>Getting started with adnived analytics takes less than a minute.</P>
    <H2>Create your account</H2>
    <ol className="mb-4 space-y-2 pl-6 list-decimal text-sm text-muted-foreground">
      <li>Go to the <Link to="/signup" className="text-primary hover:underline">sign up page</Link></li>
      <li>Enter your full name, email address, and choose a password</li>
      <li>Check your inbox for a verification email and click the confirmation link</li>
      <li>Sign in with your credentials</li>
    </ol>
    <Tip>Use a strong, unique password. We recommend at least 8 characters with a mix of letters, numbers, and symbols.</Tip>
    <P>Once verified, you'll land on your dashboard where you can add your first website.</P>
  </>
);

const AddWebsite = () => (
  <>
    <P>After signing in, add the website you want to track.</P>
    <H2>Steps to add a site</H2>
    <ol className="mb-4 space-y-2 pl-6 list-decimal text-sm text-muted-foreground">
      <li>From your <Link to="/dashboard" className="text-primary hover:underline">dashboard</Link>, click <strong>"Add Site"</strong></li>
      <li>Enter your domain name (e.g., <Code>example.com</Code>) — no <Code>https://</Code> prefix needed</li>
      <li>Click <strong>Create</strong></li>
    </ol>
    <P>Your site will appear in the dashboard sidebar. Next, you'll need to <DocLink to="add-script">add the tracking script</DocLink>.</P>
    <Tip>You can add multiple websites under one account. The number of sites depends on your plan.</Tip>
  </>
);

const AddScript = () => (
  <>
    <P>To start collecting data, add our lightweight tracking script to your website's <Code>&lt;head&gt;</Code> section.</P>
    <H2>The tracking snippet</H2>
    <P>Add this single line to your site:</P>
    <CodeBlock title="index.html">{`<script defer data-domain="yoursite.com"
  src="https://analytics.adnived.com/script.js">
</script>`}</CodeBlock>
    <P>Replace <Code>yoursite.com</Code> with your actual domain name — exactly as you entered it when adding your site.</P>

    <H2>Where to place it</H2>
    <P>The script should go inside the <Code>&lt;head&gt;</Code> tag of every page you want to track. For most sites, this means your main HTML template or layout file.</P>

    <Tip>Our script is under 1KB and loads asynchronously with the <Code>defer</Code> attribute, so it won't slow down your site.</Tip>

    <H2>Framework-specific guides</H2>
    <Ul>
      <Li><DocLink to="integration-react">React / Next.js</DocLink></Li>
      <Li><DocLink to="integration-wordpress">WordPress</DocLink></Li>
      <Li><DocLink to="integration-webflow">Webflow</DocLink></Li>
      <Li><DocLink to="integration-shopify">Shopify</DocLink></Li>
      <Li><DocLink to="integration-spa">Single-page apps (SPA)</DocLink></Li>
    </Ul>
  </>
);

const VerifyInstallation = () => (
  <>
    <P>After adding the script, verify that data is flowing correctly.</P>
    <H2>Quick check</H2>
    <ol className="mb-4 space-y-2 pl-6 list-decimal text-sm text-muted-foreground">
      <li>Open your website in a browser</li>
      <li>Go to your adnived dashboard and select your site</li>
      <li>Switch to the <strong>Realtime</strong> view — you should see your visit within seconds</li>
    </ol>

    <H2>Troubleshooting</H2>
    <Ul>
      <Li><strong>No data appearing?</strong> Make sure the <Code>data-domain</Code> matches exactly what you entered in your site settings</Li>
      <Li><strong>Using an adblocker?</strong> Some adblockers block analytics scripts. See <DocLink to="troubleshoot-adblockers">adblockers guide</DocLink></Li>
      <Li><strong>SPA not tracking navigation?</strong> See our <DocLink to="integration-spa">SPA guide</DocLink></Li>
    </Ul>
    <Tip>It's normal for your own visits to appear. adnived doesn't use cookies, so there's no way to exclude yourself by default.</Tip>
  </>
);

const GeneralSettings = () => (
  <>
    <P>Manage your site settings from the analytics dashboard.</P>
    <H2>Accessing settings</H2>
    <P>Click the <strong>gear icon</strong> in the sidebar of your site's analytics dashboard to open settings.</P>
    <H2>Available settings</H2>
    <Ul>
      <Li><strong>Site name:</strong> A friendly display name shown in your dashboard</Li>
      <Li><strong>Domain:</strong> The domain being tracked (cannot be changed after creation — delete and re-add if needed)</Li>
      <Li><strong>Public dashboard:</strong> Toggle to make your stats publicly accessible via a shareable link</Li>
      <Li><strong>Delete site:</strong> Permanently removes the site and all associated data</Li>
    </Ul>
    <Warning>Deleting a site is permanent and cannot be undone. All pageview data will be lost.</Warning>
  </>
);

const SharedLinks = () => (
  <>
    <P>Share your analytics with stakeholders, clients, or the public without requiring them to log in.</P>
    <H2>Public dashboards</H2>
    <P>Enable the <strong>Public Dashboard</strong> toggle in your site settings. Once enabled, anyone with the link can view your stats.</P>
    <P>The public URL format is: <Code>/share/[site-id]</Code></P>
    <Tip>Public dashboards are read-only. Visitors cannot modify settings, goals, or funnels.</Tip>
  </>
);

const TeamAccess = () => (
  <>
    <P>Collaborate with your team by inviting members to specific sites.</P>
    <H2>Roles</H2>
    <Table
      headers={["Role", "Permissions"]}
      rows={[
        ["Owner", "Full access: settings, goals, funnels, team management, delete site"],
        ["Admin", "View analytics, manage goals and funnels"],
        ["Viewer", "View analytics only"],
      ]}
    />
    <H2>Inviting members</H2>
    <P>Site owners can invite new team members from the site settings page. Members need an existing adnived account.</P>
    <H2>Requesting access</H2>
    <P>Users can request access to a site from the dashboard. The site owner will see pending requests and can approve or deny them.</P>
  </>
);

const DashboardGuide = () => (
  <>
    <P>The adnived dashboard gives you a clear overview of your website's traffic at a glance.</P>
    <H2>Layout</H2>
    <P>The dashboard is organized into sections accessible via the left sidebar:</P>
    <Ul>
      <Li><strong>Traffic:</strong> Overview with key metrics chart, plus source/medium breakdowns</Li>
      <Li><strong>Acquisition:</strong> Referrers, UTM campaigns, and traffic channels</Li>
      <Li><strong>Content:</strong> Top pages, entry pages, exit pages</Li>
      <Li><strong>Audience:</strong> Countries, regions, cities, device types, browsers, OS</Li>
      <Li><strong>Behavior:</strong> Goals, funnels, and custom events</Li>
    </Ul>

    <H2>Interacting with the chart</H2>
    <P>Click any metric card (Unique Visitors, Views, Bounce Rate, etc.) to change what the main chart displays. The chart automatically adjusts its time granularity based on your selected date range.</P>

    <H2>Breakdowns</H2>
    <P>Click any row in a breakdown table to filter the entire dashboard by that value. Click the <strong>details</strong> link to open a full-page breakdown view.</P>
  </>
);

const MetricsDefinitions = () => (
  <>
    <P>Understanding what each metric means helps you make better decisions.</P>
    <Table
      headers={["Metric", "Definition"]}
      rows={[
        ["Unique Visitors", "Counted using a daily-rotating hash. Not a cookie — resets each day."],
        ["Total Pageviews", "The total number of pages viewed across all visitors."],
        ["Views per Visit", "Average number of pages viewed per session."],
        ["Bounce Rate", "Percentage of sessions with exactly one pageview."],
        ["Visit Duration", "Average time spent on site per session (estimated from pageview timestamps)."],
        ["Current Visitors", "Number of visitors on your site in the last 5 minutes (realtime only)."],
      ]}
    />
    <Tip>Because we don't use cookies, "unique visitors" represents daily unique visitors based on a hashed identifier. The hash rotates every 24 hours for privacy.</Tip>
  </>
);

const Filtering = () => (
  <>
    <P>Use date ranges and filters to drill into your data.</P>
    <H2>Date range picker</H2>
    <P>Select from preset ranges (Today, Last 7 days, Last 30 days, etc.) or pick a custom date range using the calendar.</P>
    <H2>Chart granularity</H2>
    <P>The chart automatically selects the best granularity:</P>
    <Ul>
      <Li><strong>Today:</strong> Hourly buckets</Li>
      <Li><strong>7 days:</strong> Daily buckets</Li>
      <Li><strong>30+ days:</strong> Daily or weekly buckets</Li>
    </Ul>
    <H2>Breakdown filters</H2>
    <P>Click any value in a breakdown table (e.g., a country name, a referrer, a page path) to filter the entire dashboard by that dimension.</P>
  </>
);

const Realtime = () => (
  <>
    <P>The realtime view shows visitors on your site right now.</P>
    <H2>How it works</H2>
    <P>The realtime view displays data from the last 5 minutes, grouped into 1-minute buckets. It refreshes automatically every 30 seconds.</P>
    <P>You can see:</P>
    <Ul>
      <Li>Current visitor count</Li>
      <Li>Active pages being viewed</Li>
      <Li>Incoming referrer sources</Li>
    </Ul>
    <Tip>The realtime counter in the sidebar is always visible, regardless of which section you're viewing.</Tip>
  </>
);

const GoalConversions = () => (
  <>
    <P>Goals help you track important actions visitors take on your site.</P>
    <H2>Types of goals</H2>
    <Table
      headers={["Type", "Tracks", "Example"]}
      rows={[
        ["Page visit", "When a visitor views a specific page", "/thank-you, /signup-complete"],
        ["Custom event", "When a specific event is triggered via JavaScript", "Signup, Download, Purchase"],
      ]}
    />
    <H2>Creating a goal</H2>
    <ol className="mb-4 space-y-2 pl-6 list-decimal text-sm text-muted-foreground">
      <li>Go to your site dashboard → <strong>Behavior</strong> → <strong>Goals</strong></li>
      <li>Click <strong>Add Goal</strong></li>
      <li>Choose the goal type and enter the value</li>
      <li>Optionally set a name and conversion value</li>
    </ol>
    <P>Goal conversions will appear in the Goals section of your dashboard with conversion rates and totals.</P>
  </>
);

const CustomEvents = () => (
  <>
    <P>Custom events let you track specific user interactions beyond page views.</P>
    <H2>Sending a custom event</H2>
    <P>Use the global <Code>adnived</Code> function to send custom events from your website:</P>
    <CodeBlock title="JavaScript">{`// Basic event
adnived('Signup');

// Event with properties
adnived('Purchase', { plan: 'pro', value: 29 });`}</CodeBlock>

    <H2>Viewing events</H2>
    <P>Custom events appear in the <strong>Behavior → Goals</strong> section when you create a matching goal with the "Custom event" type.</P>
    <Warning>The tracking script must be loaded before calling the <Code>adnived()</Code> function. Use <Code>defer</Code> or ensure the script is loaded first.</Warning>
  </>
);

const FunnelAnalysis = () => (
  <>
    <P>Funnels let you visualize how visitors progress through a multi-step process.</P>
    <H2>Creating a funnel</H2>
    <ol className="mb-4 space-y-2 pl-6 list-decimal text-sm text-muted-foreground">
      <li>Go to <strong>Behavior → Funnels</strong> in your site dashboard</li>
      <li>Click <strong>Create Funnel</strong></li>
      <li>Name your funnel (e.g., "Signup flow")</li>
      <li>Add steps — each step can be a page visit or custom event</li>
      <li>Order the steps in the sequence you expect visitors to follow</li>
    </ol>
    <H2>Reading funnel data</H2>
    <P>Each step shows the number of visitors who reached it and the drop-off rate from the previous step. This helps you identify where visitors are abandoning the process.</P>
    <Tip>Keep funnels focused — 3-5 steps works best. Too many steps make analysis harder.</Tip>
  </>
);

const Referrers = () => (
  <>
    <P>See where your visitors are coming from.</P>
    <H2>Referrer sources</H2>
    <P>The referrer breakdown shows which websites are sending traffic to you. Sources are automatically categorized and their favicons are resolved for easy recognition.</P>
    <H2>Direct / None</H2>
    <P>Visits with no referrer are labeled as <strong>"Direct / None"</strong>. This includes visitors who typed your URL directly, used a bookmark, or came from an app that doesn't send referrer headers.</P>
  </>
);

const UTMTracking = () => (
  <>
    <P>Use UTM parameters to track the performance of your marketing campaigns.</P>
    <H2>Supported parameters</H2>
    <Table
      headers={["Parameter", "Purpose", "Example"]}
      rows={[
        ["utm_source", "Identifies the source", "google, newsletter, twitter"],
        ["utm_medium", "Identifies the medium", "cpc, email, social"],
        ["utm_campaign", "Campaign name", "spring_sale, launch_2024"],
        ["utm_term", "Paid search keywords", "analytics+tool"],
        ["utm_content", "Differentiates content", "header_cta, sidebar_banner"],
      ]}
    />
    <H2>Example URL</H2>
    <CodeBlock>{`https://yoursite.com/?utm_source=twitter&utm_medium=social&utm_campaign=launch`}</CodeBlock>
    <P>UTM data appears in the <strong>Acquisition</strong> section of your dashboard under Sources, Medium, and Campaigns.</P>
    <Tip>Keep UTM values consistent and lowercase to avoid splitting your data across variations.</Tip>
  </>
);

const Channels = () => (
  <>
    <P>Traffic is automatically categorized into channels based on UTM parameters and referrer data.</P>
    <H2>Channel definitions</H2>
    <Table
      headers={["Channel", "Rule"]}
      rows={[
        ["Organic Search", "Referrer matches a known search engine (Google, Bing, DuckDuckGo, etc.)"],
        ["Paid Search", "utm_medium contains 'cpc', 'ppc', or 'paid'"],
        ["Social", "Referrer matches a social network or utm_medium is 'social'"],
        ["Email", "utm_medium is 'email'"],
        ["Referral", "Has a referrer that doesn't match other categories"],
        ["Direct", "No referrer and no UTM parameters"],
      ]}
    />
  </>
);

const PrivacyApproach = () => (
  <>
    <P>Privacy isn't a feature of adnived — it's the foundation.</P>
    <H2>Our principles</H2>
    <Ul>
      <Li><strong>No cookies:</strong> We never set cookies on your visitors' browsers</Li>
      <Li><strong>No personal data:</strong> We don't collect names, emails, or any PII from visitors</Li>
      <Li><strong>No fingerprinting:</strong> We don't use device fingerprinting techniques</Li>
      <Li><strong>No cross-site tracking:</strong> We don't track visitors across different websites</Li>
      <Li><strong>Hashed IPs:</strong> IP addresses are hashed with a daily-rotating salt and never stored in raw form</Li>
    </Ul>
    <H2>Consent banners</H2>
    <P>Because adnived doesn't collect personal data or use cookies, <strong>you don't need a cookie consent banner</strong> when using our analytics. This is confirmed under GDPR, CCPA, and PECR guidelines.</P>
  </>
);

const GDPR = () => (
  <>
    <P>adnived analytics is fully GDPR compliant without any additional configuration.</P>
    <H2>How we comply</H2>
    <Ul>
      <Li>No personal data is collected or processed</Li>
      <Li>No cookies are used — no consent mechanism needed</Li>
      <Li>IP addresses are hashed with a daily-rotating salt and never stored raw</Li>
      <Li>All data is aggregated and cannot be used to identify individuals</Li>
      <Li>Data is stored securely with encryption at rest and in transit</Li>
    </Ul>
    <H2>Data Processing Agreement</H2>
    <P>Since adnived doesn't process personal data on behalf of our customers, a DPA is not technically required. However, if you need one for your records, please contact us.</P>
  </>
);

const DataPolicy = () => (
  <>
    <P>Here's exactly what data adnived collects from your website visitors.</P>
    <H2>Data collected per pageview</H2>
    <Table
      headers={["Field", "Example", "Personal data?"]}
      rows={[
        ["Page URL path", "/blog/my-post", "No"],
        ["Referrer", "google.com", "No"],
        ["Browser", "Chrome", "No"],
        ["Operating system", "macOS", "No"],
        ["Device type", "Desktop", "No"],
        ["Screen size", "1920x1080", "No"],
        ["Country / Region / City", "US / California / SF", "No (derived from hashed IP)"],
        ["UTM parameters", "source=twitter", "No"],
        ["Session hash", "(daily rotating)", "No (not linkable to person)"],
      ]}
    />
    <H2>Data NOT collected</H2>
    <Ul>
      <Li>IP addresses (hashed and discarded)</Li>
      <Li>Cookies or local storage data</Li>
      <Li>User agent strings (parsed to browser/OS only)</Li>
      <Li>Personal identifiers of any kind</Li>
      <Li>Cross-site tracking identifiers</Li>
    </Ul>
  </>
);

const IntegrationReact = () => (
  <>
    <P>Add adnived analytics to your React or Next.js application.</P>
    <H2>React (Vite, CRA)</H2>
    <P>Add the script to your <Code>index.html</Code> file's <Code>&lt;head&gt;</Code>:</P>
    <CodeBlock title="index.html">{`<script defer data-domain="yoursite.com"
  src="https://analytics.adnived.com/script.js">
</script>`}</CodeBlock>

    <H2>Next.js (App Router)</H2>
    <P>Add the script in your root layout:</P>
    <CodeBlock title="app/layout.tsx">{`import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          defer
          data-domain="yoursite.com"
          src="https://analytics.adnived.com/script.js"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}`}</CodeBlock>

    <P>Our script automatically tracks SPA navigation for both React Router and Next.js routing.</P>
    <Tip>See the <DocLink to="integration-spa">SPA guide</DocLink> for details on how client-side navigation is tracked.</Tip>
  </>
);

const IntegrationWordpress = () => (
  <>
    <P>Add adnived to any WordPress site in under 2 minutes.</P>
    <H2>Option 1: Theme header</H2>
    <ol className="mb-4 space-y-2 pl-6 list-decimal text-sm text-muted-foreground">
      <li>Go to <strong>Appearance → Theme File Editor</strong></li>
      <li>Open <Code>header.php</Code></li>
      <li>Paste the tracking script just before <Code>&lt;/head&gt;</Code></li>
      <li>Save the file</li>
    </ol>
    <H2>Option 2: Plugin</H2>
    <P>Use any "Insert Headers & Footers" plugin (e.g., WPCode) and paste the script in the header section.</P>
    <Warning>If you switch themes, make sure to re-add the script to the new theme's header.</Warning>
  </>
);

const IntegrationWebflow = () => (
  <>
    <P>Add adnived to your Webflow site.</P>
    <H2>Steps</H2>
    <ol className="mb-4 space-y-2 pl-6 list-decimal text-sm text-muted-foreground">
      <li>Go to your Webflow project <strong>Settings → Custom Code</strong></li>
      <li>Paste the tracking script in the <strong>Head Code</strong> section</li>
      <li>Publish your site</li>
    </ol>
    <Tip>The script will automatically work across all pages of your Webflow site.</Tip>
  </>
);

const IntegrationShopify = () => (
  <>
    <P>Track your Shopify store with adnived analytics.</P>
    <H2>Steps</H2>
    <ol className="mb-4 space-y-2 pl-6 list-decimal text-sm text-muted-foreground">
      <li>Go to <strong>Online Store → Themes → Edit Code</strong></li>
      <li>Open <Code>theme.liquid</Code></li>
      <li>Paste the tracking script just before <Code>&lt;/head&gt;</Code></li>
      <li>Save</li>
    </ol>
    <P>adnived will track all pages including product pages, collections, and the checkout thank-you page (if accessible).</P>
  </>
);

const IntegrationSPA = () => (
  <>
    <P>adnived automatically tracks client-side navigation in single-page applications.</P>
    <H2>How it works</H2>
    <P>Our tracking script listens for the browser's <Code>popstate</Code> event and <Code>History.pushState</Code> / <Code>replaceState</Code> calls. When a navigation occurs, a new pageview is recorded automatically.</P>
    <H2>Supported routers</H2>
    <Ul>
      <Li>React Router (v5 & v6)</Li>
      <Li>Next.js App Router & Pages Router</Li>
      <Li>Vue Router</Li>
      <Li>Svelte routing</Li>
      <Li>Any framework using the History API</Li>
    </Ul>
    <Tip>No extra configuration needed — just add the script and SPA tracking works out of the box.</Tip>
  </>
);

const PlansBilling = () => (
  <>
    <P>adnived offers flexible plans based on your traffic needs.</P>
    <H2>Viewing your plan</H2>
    <P>Go to <strong>Dashboard → Plan</strong> tab to see your current plan, usage, and billing period.</P>
    <H2>Usage tracking</H2>
    <P>Each pageview counts as one "hit" against your plan's monthly allowance. The counter resets at the start of each billing period.</P>
    <Tip>If you exceed your plan's limit, your data will continue to be collected. We'll notify you and suggest upgrading.</Tip>
  </>
);

const ChangePlan = () => (
  <>
    <P>You can upgrade, downgrade, or cancel your plan at any time.</P>
    <H2>Upgrading</H2>
    <P>Go to <strong>Dashboard → Plan</strong> and click the upgrade button on the plan you'd like. Payment is processed securely through OnePay.</P>
    <H2>Canceling</H2>
    <P>To cancel, go to Plan settings. Your access continues until the end of the current billing period.</P>
    <Warning>If you cancel and your site count exceeds the free plan limit, you'll need to remove sites before the period ends.</Warning>
  </>
);

const TroubleshootScript = () => (
  <>
    <P>If you're not seeing data in your dashboard, follow these steps.</P>
    <H2>Checklist</H2>
    <ol className="mb-4 space-y-2 pl-6 list-decimal text-sm text-muted-foreground">
      <li><strong>Check the script tag:</strong> Open your page source and verify the script is in the <Code>&lt;head&gt;</Code></li>
      <li><strong>Verify the domain:</strong> The <Code>data-domain</Code> attribute must exactly match what you entered in adnived (no <Code>https://</Code> or trailing slash)</li>
      <li><strong>Check the console:</strong> Open browser DevTools → Network tab, filter for <Code>script.js</Code>. It should return a 200 status</li>
      <li><strong>Disable adblockers:</strong> Temporarily disable any adblocker and reload the page</li>
      <li><strong>Wait a moment:</strong> Data may take up to 30 seconds to appear in the realtime view</li>
    </ol>
    <P>Still not working? Reach out to us at <a href="mailto:support@adnived.com" className="text-primary hover:underline">support@adnived.com</a>.</P>
  </>
);

const TroubleshootAdblockers = () => (
  <>
    <P>Some adblockers and privacy extensions may block analytics scripts, including privacy-friendly ones like adnived.</P>
    <H2>Why this happens</H2>
    <P>Adblockers maintain blocklists that include analytics domains. Even though adnived is privacy-friendly, some blocklists include all analytics scripts indiscriminately.</P>
    <H2>Impact</H2>
    <P>If a visitor uses an adblocker that blocks our script, their visit won't be recorded. This is a fundamental limitation of any client-side analytics tool.</P>
    <H2>Mitigations</H2>
    <Ul>
      <Li><strong>Custom domain:</strong> Serve the script from a subdomain of your own site (e.g., <Code>analytics.yoursite.com</Code>). This reduces blocking significantly</Li>
      <Li><strong>Accept the gap:</strong> Typically 10-15% of visitors use adblockers. Your trends and relative metrics remain accurate even if absolute numbers are slightly lower</Li>
    </Ul>
    <Tip>We're working on making it easier to proxy the script through your own domain. Stay tuned for updates.</Tip>
  </>
);

/* ─── Export map ─── */
export const docContent: Record<string, ComponentType> = {
  welcome: Welcome,
  "register-account": RegisterAccount,
  "add-website": AddWebsite,
  "add-script": AddScript,
  "verify-installation": VerifyInstallation,
  "general-settings": GeneralSettings,
  "shared-links": SharedLinks,
  "team-access": TeamAccess,
  "dashboard-guide": DashboardGuide,
  "metrics-definitions": MetricsDefinitions,
  filtering: Filtering,
  realtime: Realtime,
  "goal-conversions": GoalConversions,
  "custom-events": CustomEvents,
  "phone-click-tracking": PhoneClickTracking,
  "funnel-analysis": FunnelAnalysis,
  referrers: Referrers,
  "utm-tracking": UTMTracking,
  channels: Channels,
  "privacy-policy": PrivacyApproach,
  gdpr: GDPR,
  "data-policy": DataPolicy,
  "integration-react": IntegrationReact,
  "integration-wordpress": IntegrationWordpress,
  "integration-webflow": IntegrationWebflow,
  "integration-shopify": IntegrationShopify,
  "integration-spa": IntegrationSPA,
  "plans-billing": PlansBilling,
  "change-plan": ChangePlan,
  "troubleshoot-script": TroubleshootScript,
  "troubleshoot-adblockers": TroubleshootAdblockers,
};
