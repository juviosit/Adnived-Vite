

# World Map + Sidebar Navigation for Breakdown Panels

## 1. World Map in Locations Section

Add an SVG-based world map to the Countries tab in the Locations breakdown panel, showing visitor distribution by country with color intensity based on visitor count.

**Approach:**
- Create a new `WorldMap.tsx` component using an inline simplified SVG world map with ISO country code paths
- Color each country path based on visitor count using a gradient from light to dark primary color
- Show tooltip on hover with country name and visitor count
- Place the map above the country breakdown list in the Locations panel
- Use a lightweight approach (no external map library) -- a pre-built SVG with ~180 country paths mapped by ISO alpha-2 codes
- The `topCountries` data already provides country names; we'll need a name-to-ISO mapping to match SVG paths

**Files:**
- Create: `src/components/analytics/WorldMap.tsx`
- Edit: `src/components/analytics/OverviewSection.tsx` (render WorldMap above country list)

## 2. Sidebar Navigation for Each Dashboard Section

Expand the sidebar in `SiteAnalytics.tsx` to include each breakdown panel as its own navigable section, giving users quick access to full-page views.

**New sidebar structure:**
```
Traffic
  Realtime
  Overview

Acquisition
  Sources
  Campaigns

Content
  Pages

Audience
  Locations (with map)
  Technology

Behavior
  Goals
  Funnels

Site
  Settings
```

**Implementation:**
- Add new section types: `"sources"`, `"campaigns"`, `"pages"`, `"locations"`, `"technology"`
- Each renders the relevant breakdown as a full-page view with the date range picker and filter bar
- Extract shared date range/filter state from `OverviewSection` into `SiteAnalytics` or create dedicated full-page wrapper components
- For simplicity, create a new `BreakdownPage.tsx` component that wraps a single breakdown type with its own date picker, data fetching, and the BreakdownDetails modal -- reusing the same data-fetching logic

**Files:**
- Create: `src/components/analytics/BreakdownPage.tsx` (reusable full-page view for a single breakdown type)
- Edit: `src/pages/SiteAnalytics.tsx` (expanded nav items, render new sections)
- Edit: `src/components/analytics/OverviewSection.tsx` (add WorldMap to locations panel)

## Technical Details

### WorldMap Component
- SVG paths for countries stored as a constant map of `{ [isoCode]: svgPathD }`
- Uses a compact world map SVG (Natural Earth projection, simplified paths)
- Country name to ISO code mapping for matching pageview `country` field values
- Hover state shows a floating tooltip with country name + visitor count
- Color scale: `hsl(var(--primary))` with opacity from 0.1 (low) to 1.0 (high) based on visitor proportion

### BreakdownPage Component
- Props: `siteId`, `breakdownType` (sources/campaigns/pages/locations/technology)
- Includes its own date range picker (same preset logic as OverviewSection)
- Fetches pageviews, computes the relevant breakdown
- Shows the full list (not limited to top 10) with sorting
- For locations type, renders WorldMap at the top
- Includes filter bar and CSV export

### Sidebar Changes
- Expand `Section` type union to include new values
- Add icons: `Link2` for Sources, `Megaphone` for Campaigns, `FileText` for Pages, `Globe` for Locations, `Monitor` for Technology
- Each new section renders `<BreakdownPage siteId={siteId} breakdownType="..." />`

