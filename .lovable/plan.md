

## Create Standalone Pages for Features, Pricing, and Privacy

### What
Create three new standalone pages at `/features`, `/pricing`, and `/privacy-first` that reuse the existing homepage section components but wrap them in full pages with proper SEO metadata. Keep the homepage sections as-is.

### New Files

1. **`src/pages/Features.tsx`** — Full page with Header, SEO component (title: "Features — adnivedAnalytics", description about all features), FeaturesSection component, CTA, Footer. Add JSON-LD `WebPage` schema.

2. **`src/pages/Pricing.tsx`** — Full page with Header, SEO component (title: "Pricing — adnivedAnalytics"), PricingSection component, FAQ section, CTA, Footer. Add JSON-LD `WebPage` schema.

3. **`src/pages/PrivacyFirst.tsx`** — Full page with Header, SEO component (title: "Privacy-First Analytics — adnivedAnalytics"), PrivacySection component, compliance badges/links, CTA, Footer. Add JSON-LD `WebPage` schema. Route: `/privacy-first` (to avoid conflict with existing `/privacy` policy page).

### Route Changes (`src/App.tsx`)
Add three new routes:
- `/features` → `<Features />`
- `/pricing` → `<Pricing />`
- `/privacy-first` → `<PrivacyFirst />`

### Navigation Updates

**`src/components/landing/Footer.tsx`**:
- Change `<a href="#features">` to `<Link to="/features">`
- Change `<a href="#pricing">` to `<Link to="/pricing">`
- Add link to `/privacy-first` labeled "Privacy-First"

**`src/components/landing/Header.tsx`**: Update any `#features` / `#pricing` anchor links to use the new routes (with fallback to hash links when on homepage).

### SEO File Updates

**`public/sitemap.xml`**: Add three new entries:
- `https://adnived.com/features` (priority 0.9)
- `https://adnived.com/pricing` (priority 0.9)
- `https://adnived.com/privacy-first` (priority 0.8)

**`public/llms.txt`**: Add the three new pages under the "Public Pages" section with descriptions.

**`public/robots.txt`**: No changes needed — all new routes are public and already allowed.

### Summary of Changes
| File | Action |
|------|--------|
| `src/pages/Features.tsx` | Create |
| `src/pages/Pricing.tsx` | Create |
| `src/pages/PrivacyFirst.tsx` | Create |
| `src/App.tsx` | Add 3 routes |
| `src/components/landing/Footer.tsx` | Update links |
| `src/components/landing/Header.tsx` | Update links |
| `public/sitemap.xml` | Add 3 URLs |
| `public/llms.txt` | Add 3 page entries |

