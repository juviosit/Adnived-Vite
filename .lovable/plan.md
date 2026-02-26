

# Download Reports, Plan Display Fix, and E2E Polish

## 1. Download PDF Reports Feature

Create a new "Download Report" dialog accessible from the site analytics page. Users can configure:
- **Metrics to include**: Checkboxes for Visitors, Pageviews, Bounce Rate, Visit Duration, Sources, Pages, Countries, Technology
- **Time period**: Same presets as overview (24h, 7d, 30d, Lifetime, Custom date range)
- **Generate PDF**: Build an HTML report in-memory, render it using the browser's `window.print()` with a print-optimized stylesheet (no external PDF library needed)

### Implementation

**New file: `src/components/analytics/DownloadReportDialog.tsx`**
- Dialog with metric checkboxes (using existing Checkbox component)
- Date range selector (reusing the same preset/calendar pattern from OverviewSection)
- "Generate Report" button that:
  1. Fetches pageview data for the selected period
  2. Computes selected metrics (visitors, pageviews, bounce rate, etc.)
  3. Computes breakdowns (sources, pages, countries) if selected
  4. Opens a new window with a styled HTML report and triggers `window.print()` for PDF save
- Report includes: site name, date range header, metric summary cards, breakdown tables

**Edit: `src/pages/SiteAnalytics.tsx`**
- Add a "Download Report" button (with `Download` icon) in the header bar next to "Sign out"
- Import and render the `DownloadReportDialog` component

## 2. Fix Plan Display - Show Millions Instead of Thousands

The `PlanTab.tsx` currently formats max_hits as `${(plan.max_hits / 1000).toFixed(0)}K pageviews` which shows e.g. "1000K" for 1 million. Fix to use smart formatting.

**Edit: `src/components/dashboard/PlanTab.tsx`**
- Add a `formatHits` helper (same pattern already exists in `PricingSection.tsx`):
  - >= 1,000,000: show as `1M`, `10M`, etc.
  - >= 1,000: show as `10K`, `100K`, etc.
  - Otherwise: raw number
- Update line 136 from `${(plan.max_hits / 1000).toFixed(0)}K pageviews` to use `formatHits(plan.max_hits)` + " pageviews"
- Also update the current usage display (line 98) to use the same formatter for consistency

## 3. End-to-End Polish and Fixes

Based on codebase review, the following issues need attention:

**a. SharedDashboard consistency**
- Review and ensure the shared (public) dashboard has proper branding and works without auth

**b. Navigation consistency**
- The SiteAnalytics header has "Sign out" but no link back to dashboard (only in sidebar). Add a visible "Back to Dashboard" link in the main header for clarity.

**c. Supabase query limit awareness**
- The pageview queries don't specify a limit, which means they default to Supabase's 1000-row limit. For sites with significant traffic, data will be silently truncated. Add `.limit(10000)` or paginated fetching for accuracy.

### Technical Summary

| File | Change |
|------|--------|
| `src/components/analytics/DownloadReportDialog.tsx` | New -- report config dialog with metric selection, date range, and PDF generation |
| `src/pages/SiteAnalytics.tsx` | Add "Download Report" button in header |
| `src/components/dashboard/PlanTab.tsx` | Fix hits formatting to show M for millions, add `formatHits` helper |
| `src/components/analytics/OverviewSection.tsx` | Increase query limit to avoid silent data truncation |
| `src/components/analytics/BreakdownPage.tsx` | Increase query limit to avoid silent data truncation |
| `src/pages/SharedDashboard.tsx` | Review and ensure branding consistency |

