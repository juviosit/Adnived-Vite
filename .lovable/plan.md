

## Fix Em Dashes and Optimize SEO Content

### 1. Remove Em Dashes Sitewide

Replace all `—` (em dash) characters with appropriate alternatives: either `. ` (period + space for sentence breaks), `, ` (comma), or simply remove and rephrase. For table placeholders like `"—"` in admin pages, replace with `-` (hyphen).

**Files with em dashes in user-facing content:**

| File | Count | Notes |
|------|-------|-------|
| `src/components/landing/FeaturesSection.tsx` | 2 | Feature descriptions |
| `src/components/landing/WhySwitchSection.tsx` | 0 | Clean |
| `src/pages/Features.tsx` | 2 | SEO description + JSON-LD |
| `src/pages/Pricing.tsx` | 1 | SEO title separator `–` (en dash, keep or standardize) |
| `src/pages/PrivacyFirst.tsx` | 1 | SEO title separator |
| `src/pages/Index.tsx` | 1 | SEO title separator |
| `src/pages/UTMBuilder.tsx` | ~10 | Descriptions, SEO meta |
| `src/pages/WhyNoSocial.tsx` | 3 | Principles, body text |
| `src/pages/Referral.tsx` | 2 | SEO title, body text |
| `src/pages/SelectPlan.tsx` | 2 | Code comments, coupon display |
| `src/pages/admin/AdminUsers.tsx` | 2 | Table placeholders |
| `src/pages/admin/AdminReferrals.tsx` | 2 | Table placeholder, SEO title |
| `src/pages/compliance/GDPRCompliance.tsx` | ~8 | Headlines, body, comparison |
| `src/pages/compliance/CCPACompliance.tsx` | ~6 | Headlines, body, table |
| `src/pages/compliance/PECRCompliance.tsx` | ~6 | Headlines, body |
| `src/docs/docsContent.tsx` | ~20 | Documentation text throughout |

**Replacement strategy:**
- SEO titles: `–` (en dash) → `-` (hyphen) for consistency
- Prose: `—` → rephrase with period, comma, or "and"
- Table/UI placeholders: `—` → `-`
- Code comments: `—` → `-` or rephrase

### 2. SEO Content Optimization

**H1 tags on standalone pages** (currently missing dedicated H1s on Features, Pricing, PrivacyFirst pages since they reuse section components that use H2):

- **`src/pages/Features.tsx`**: Add a hero section with H1: "Privacy-First Web Analytics Features" before `<FeaturesSection />`
- **`src/pages/Pricing.tsx`**: Add a hero section with H1: "Simple, Transparent Analytics Pricing" before `<PricingSection />`
- **`src/pages/PrivacyFirst.tsx`**: Add a hero section with H1: "Privacy-First Web Analytics Without Cookies" before `<PrivacySection />`

Each hero will include a keyword-rich subtitle paragraph. This ensures every standalone page has exactly one H1, improving SEO structure.

**Keyword optimization in meta descriptions:**
- Features: Include "cookie-free analytics", "lightweight tracking script", "privacy-compliant"
- Pricing: Include "free analytics plan", "affordable web analytics", "no hidden fees"
- PrivacyFirst: Include "cookieless analytics", "GDPR CCPA PECR compliant", "no consent banners"

### 3. Summary of Changes

| File | Changes |
|------|---------|
| `src/pages/Features.tsx` | Add H1 hero, fix em dashes in meta |
| `src/pages/Pricing.tsx` | Add H1 hero, fix em dashes in meta |
| `src/pages/PrivacyFirst.tsx` | Add H1 hero, fix em dashes in meta |
| `src/components/landing/FeaturesSection.tsx` | Remove em dashes from descriptions |
| `src/pages/Index.tsx` | Fix title separator |
| `src/pages/UTMBuilder.tsx` | Remove ~10 em dashes |
| `src/pages/WhyNoSocial.tsx` | Remove 3 em dashes |
| `src/pages/Referral.tsx` | Fix title and body em dashes |
| `src/pages/SelectPlan.tsx` | Fix comment and coupon display |
| `src/pages/admin/AdminUsers.tsx` | Replace `—` with `-` |
| `src/pages/admin/AdminReferrals.tsx` | Replace `—` with `-` |
| `src/pages/compliance/GDPRCompliance.tsx` | Remove ~8 em dashes |
| `src/pages/compliance/CCPACompliance.tsx` | Remove ~6 em dashes |
| `src/pages/compliance/PECRCompliance.tsx` | Remove ~6 em dashes |
| `src/docs/docsContent.tsx` | Remove ~20 em dashes |

No design or layout changes. Only text content and SEO metadata updates.

