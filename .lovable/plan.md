

# Make adnived analytics Match Plausible Analytics

## Overview

After analyzing Plausible's open-source codebase, documentation, and live demo dashboard, here's a comprehensive plan to bring adnived analytics to feature parity. Many core features already exist (metrics, sources, pages, locations, technology, goals, funnels). This plan focuses on the gaps.

## Current State vs Plausible

| Feature | adnived analytics | Plausible | Gap |
|---------|-------------------|-----------|-----|
| Top metrics strip | Yes | Yes | -- |
| % change comparison | Yes | Yes | -- |
| Sources/Pages two-column | Yes | Yes | -- |
| Entry/Exit pages | Yes | Yes | -- |
| Channels/UTM tabs | Yes | Yes | -- |
| Locations (country/region/city) | Yes | Yes | -- |
| Technology (browser/OS/device) | Yes | Yes | -- |
| Goals + conversions | Yes | Yes | -- |
| Funnels | Yes | Yes | -- |
| Realtime visitors badge | Yes | Yes | -- |
| **Clickable metric switching on chart** | No | Yes | **New** |
| **Realtime 30-min graph** | No | Yes | **New** |
| **Auto-refresh realtime (30s)** | No | Yes | **New** |
| **Chart interval toggle (Days/Hours/Weeks)** | No | Yes | **New** |
| **"Details" expandable views** | No | Yes | **New** |
| **Public shared dashboards** | Schema exists, no UI | Yes | **New** |
| **CSV/data export** | No | Yes | **New** |
| **Site settings page** | No (inline only) | Yes | **New** |
| **Source favicons** | No | Yes | **New** |
| **UTM Term and Content** | No | Yes | **New** |
| **Scroll depth tracking** | No | Yes | Deferred |
| **Email reports** | No | Yes | Deferred |

## Implementation Plan

### 1. Clickable Metric Switching on Chart

In Plausible, clicking any metric (Unique Visitors, Total Visits, Pageviews, etc.) switches the chart to display that metric over time. The selected metric is underlined.

**Changes:**
- `OverviewSection.tsx`: Add `activeMetric` state, highlight the selected metric in the strip, and change the chart `dataKey` to render the selected metric's time series (computing visitors, visits, pageviews, bounce rate, etc. per bucket).

### 2. Realtime 30-Minute Graph with Auto-Refresh

Plausible shows a dedicated realtime view with a 30-minute graph updated every 30 seconds.

**Changes:**
- `OverviewSection.tsx`: When `preset === "realtime"`, render a 30-minute chart with 1-minute buckets, auto-refresh the data every 30 seconds using `setInterval`, and show "Last 30 minutes" label.

### 3. Chart Interval Toggle (Hours/Days/Weeks/Months)

Plausible lets users toggle chart granularity. For "Last 30 days" you can pick Days or Weeks; for "Today" you can pick Minutes or Hours.

**Changes:**
- `OverviewSection.tsx`: Add an interval selector dropdown next to the chart title. Available options depend on the date range. Recompute chart buckets based on selected interval.

### 4. "Details" Expandable Views with Sorting

Each breakdown panel in Plausible has a "Details" link that opens a full list with extra columns (bounce rate, visit duration per source/page).

**Changes:**
- Create a new `BreakdownDetails` dialog/modal component that shows the full list (not limited to top 10) with additional computed columns.
- Add a "Details" button at the bottom of each breakdown section in `OverviewSection.tsx`.
- Support sorting by clicking column headers (visitors, bounce rate, duration).

### 5. Public Shared Dashboards

The `sites` table already has a `public_share` boolean column. Need UI to toggle it and a public route to view the dashboard without auth.

**Changes:**
- Add a "Visibility" toggle in site settings (new section in `SiteAnalytics.tsx` header or a settings dialog).
- Create a new route `/share/:siteId` that renders `OverviewSection` without requiring authentication, gated by `public_share = true`.
- Add an RLS policy allowing anonymous SELECT on pageviews when the site's `public_share` is true.
- New page: `src/pages/SharedDashboard.tsx`.

### 6. CSV Export

Plausible allows downloading chart data and breakdown lists as CSV.

**Changes:**
- Add a download icon button next to the chart and each breakdown panel.
- Utility function to convert data arrays to CSV and trigger browser download.

### 7. Source Favicons

Plausible shows favicons next to referral sources using DuckDuckGo's favicon API.

**Changes:**
- In the `BreakdownList` component, prepend an `<img>` tag using `https://icons.duckduckgo.com/ip3/{domain}.ico` for source items.
- Parse the referrer URL to extract the domain for the favicon lookup.

### 8. UTM Term and Content Tracking

Plausible tracks `utm_term` and `utm_content` in addition to source/medium/campaign.

**Changes:**
- **Database migration**: Add `utm_term` and `utm_content` columns to the `pageviews` table.
- **Edge function** (`track/index.ts`): Parse and store `utm_term` and `utm_content` from the query string.
- **Tracker script**: Send `utm_term` and `utm_content` in the payload.
- **OverviewSection.tsx**: Add "Term" and "Content" sub-tabs under the Campaigns tab.

### 9. Site Settings Page

A dedicated settings page per site for managing domain, visibility, shared links, and danger zone (delete site).

**Changes:**
- Add a "Settings" nav item to the sidebar in `SiteAnalytics.tsx`.
- Create `src/components/analytics/SiteSettingsPanel.tsx` with sections for: General (name, domain), Visibility (public share toggle, share link), Danger Zone (delete site).

## Technical Details

### Database Migration
```sql
ALTER TABLE public.pageviews 
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS utm_content text;
```

### Files to Create
- `src/pages/SharedDashboard.tsx` -- public shared dashboard page
- `src/components/analytics/SiteSettingsPanel.tsx` -- per-site settings
- `src/components/analytics/BreakdownDetails.tsx` -- full breakdown modal with sorting

### Files to Modify
- `src/components/analytics/OverviewSection.tsx` -- clickable metrics, realtime graph, interval toggle, details buttons, CSV export, favicons, UTM term/content tabs
- `src/pages/SiteAnalytics.tsx` -- add Settings nav item
- `src/App.tsx` -- add `/share/:siteId` route
- `supabase/functions/track/index.ts` -- add utm_term/utm_content to tracker script and storage

### Deferred (Out of Scope)
- Scroll depth tracking (requires significant tracker changes)
- Automated email reports (requires scheduled functions + email service)
- Keyboard shortcuts
- Browser/OS version drilldown

