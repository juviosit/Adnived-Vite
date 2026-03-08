export interface DocPage {
  slug: string;
  title: string;
  category: string;
}

export interface DocCategory {
  name: string;
  pages: DocPage[];
}

export const docCategories: DocCategory[] = [
  {
    name: "Get Started",
    pages: [
      { slug: "welcome", title: "Welcome", category: "Get Started" },
      { slug: "register-account", title: "Register an account", category: "Get Started" },
      { slug: "add-website", title: "Add your website", category: "Get Started" },
      { slug: "add-script", title: "Add the tracking script", category: "Get Started" },
      { slug: "verify-installation", title: "Verify installation", category: "Get Started" },
    ],
  },
  {
    name: "Website Settings",
    pages: [
      { slug: "general-settings", title: "General settings", category: "Website Settings" },
      { slug: "shared-links", title: "Shared & public dashboards", category: "Website Settings" },
      { slug: "team-access", title: "Team access & roles", category: "Website Settings" },
    ],
  },
  {
    name: "Stats Dashboard",
    pages: [
      { slug: "dashboard-guide", title: "Dashboard overview", category: "Stats Dashboard" },
      { slug: "metrics-definitions", title: "Metrics & definitions", category: "Stats Dashboard" },
      { slug: "filtering", title: "Filtering & date ranges", category: "Stats Dashboard" },
      { slug: "realtime", title: "Realtime view", category: "Stats Dashboard" },
    ],
  },
  {
    name: "Goals & Funnels",
    pages: [
      { slug: "goal-conversions", title: "Goal conversions", category: "Goals & Funnels" },
      { slug: "custom-events", title: "Custom events", category: "Goals & Funnels" },
      { slug: "phone-click-tracking", title: "Phone & email click tracking", category: "Goals & Funnels" },
      { slug: "funnel-analysis", title: "Funnel analysis", category: "Goals & Funnels" },
    ],
  },
  {
    name: "Acquisition",
    pages: [
      { slug: "referrers", title: "Referrer sources", category: "Acquisition" },
      { slug: "utm-tracking", title: "UTM campaign tracking", category: "Acquisition" },
      { slug: "channels", title: "Traffic channels", category: "Acquisition" },
    ],
  },
  {
    name: "Privacy & Compliance",
    pages: [
      { slug: "privacy-policy", title: "Our approach to privacy", category: "Privacy & Compliance" },
      { slug: "gdpr", title: "GDPR compliance", category: "Privacy & Compliance" },
      { slug: "data-policy", title: "What data we collect", category: "Privacy & Compliance" },
    ],
  },
  {
    name: "Integration Guides",
    pages: [
      { slug: "integration-react", title: "React / Next.js", category: "Integration Guides" },
      { slug: "integration-wordpress", title: "WordPress", category: "Integration Guides" },
      { slug: "integration-webflow", title: "Webflow", category: "Integration Guides" },
      { slug: "integration-shopify", title: "Shopify", category: "Integration Guides" },
      { slug: "integration-spa", title: "Single-page apps (SPA)", category: "Integration Guides" },
    ],
  },
  {
    name: "Billing",
    pages: [
      { slug: "plans-billing", title: "Plans & billing", category: "Billing" },
      { slug: "change-plan", title: "Change or cancel plan", category: "Billing" },
    ],
  },
  {
    name: "Troubleshooting",
    pages: [
      { slug: "troubleshoot-script", title: "Script not tracking", category: "Troubleshooting" },
      { slug: "troubleshoot-adblockers", title: "Adblockers", category: "Troubleshooting" },
    ],
  },
];

export function getDocBySlug(slug: string): DocPage | undefined {
  for (const cat of docCategories) {
    const found = cat.pages.find((p) => p.slug === slug);
    if (found) return found;
  }
  return undefined;
}

export function getAdjacentDocs(slug: string): { prev?: DocPage; next?: DocPage } {
  const allPages = docCategories.flatMap((c) => c.pages);
  const idx = allPages.findIndex((p) => p.slug === slug);
  return {
    prev: idx > 0 ? allPages[idx - 1] : undefined,
    next: idx < allPages.length - 1 ? allPages[idx + 1] : undefined,
  };
}
