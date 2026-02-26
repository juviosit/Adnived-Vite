

# World Map Legend + Navbar Improvements

## 1. Add Color Scale Legend to World Map

Add a horizontal gradient legend below the map showing "Low" to "High" visitor intensity.

**File: `src/components/analytics/WorldMap.tsx`**
- Add a legend bar below the map SVG, inside the existing container div
- Render a horizontal gradient from `hsl(var(--primary) / 0.2)` to `hsl(var(--primary) / 1.0)`
- Labels: "Low" on the left, "High" on the right
- Compact styling: small height (8px), rounded, with text-xs labels

## 2. Change "Access Platform" to "Sign In"

**File: `src/components/landing/Header.tsx`**
- Change button text from "Access Platform" to "Sign In"
- Remove the `ExternalLink` icon (sign-in is internal, not external)

## 3. Add Branded Navbar to Dashboard Layout

The `DashboardLayout` (used by the main user dashboard) currently has a minimal header. Add the "adnived analytics" branding to match the landing page header.

**File: `src/components/dashboard/DashboardLayout.tsx`**
- Already shows the logo icon + "adnived" text -- add "analytics" subtitle text to match the landing page branding pattern

## 4. Add Branded Navbar to Site Analytics

The `SiteAnalytics` page sidebar header only shows a back arrow and site name. Add the platform branding.

**File: `src/pages/SiteAnalytics.tsx`**
- In the sidebar header, replace the plain back-arrow + site name with the "adnived" logo/brand link (linking to `/dashboard`), and move the site name below or keep it as a secondary label
- In the mobile sheet header, apply the same branding

## 5. Ensure Admin Layout Has Consistent Branding

**File: `src/components/admin/AdminLayout.tsx`**
- Already shows "adnived Admin" branding with the logo icon -- this is consistent. No changes needed.

## Technical Summary

| File | Change |
|------|--------|
| `src/components/analytics/WorldMap.tsx` | Add gradient legend bar below the map |
| `src/components/landing/Header.tsx` | "Access Platform" -> "Sign In", remove ExternalLink icon |
| `src/components/dashboard/DashboardLayout.tsx` | Add "analytics" text after "adnived" in header |
| `src/pages/SiteAnalytics.tsx` | Add branded logo in sidebar header alongside site name |

