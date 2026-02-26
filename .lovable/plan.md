

# Fix Realtime (5 min) + World Map Illumination

## 1. Realtime: Show only last 5 minutes

Currently the realtime view fetches 30 minutes of data and renders 30 one-minute buckets. Change to 5 minutes with 5 buckets.

**File: `src/components/analytics/OverviewSection.tsx`**
- Line 48: Change `subMinutes(now, 30)` to `subMinutes(now, 5)` in `dateRange`
- Line 113: Change `subMinutes(now, 30)` to `subMinutes(now, 5)` in fetch
- Line 239: Change loop from `i = 29` to `i = 4` (5 buckets)
- Update the `rangeLabel` from "Last 30 minutes" to "Last 5 minutes"

**File: `src/pages/SiteAnalytics.tsx`**
- The current visitors count also uses 5 minutes already (line ~69), so that stays consistent.

## 2. Fix World Map country illumination

The `WorldMap.tsx` uses `react-simple-maps` with `countries-110m.json` TopoJSON. The issue is that the TopoJSON from `world-atlas@2` uses **numeric ISO codes** in its properties, not `ISO_A2`/`ISO_A3`/`NAME` string properties. The code tries to read `geo.properties.ISO_A2`, `ISO_A3`, and `NAME` which likely don't exist in this dataset, so no countries ever match and nothing illuminates.

**Fix approach**: Switch the TopoJSON source to Natural Earth's GeoJSON which includes `ISO_A2`, `ISO_A3`, and `NAME` properties, OR use a CDN that provides those properties. The best option is to use the `countries-50m.json` from a source that includes named properties, or map the numeric codes.

**File: `src/components/analytics/WorldMap.tsx`**
- Change `GEO_URL` to use a Natural Earth TopoJSON that includes `ISO_A2`/`NAME` properties (e.g., from `cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json` won't help since it has numeric IDs)
- Instead, update the matching logic: the `world-atlas` TopoJSON uses numeric IDs but the `Geographies` component from `react-simple-maps` enriches each geography with `properties` from the feature. We need to use a TopoJSON source that has named country properties, such as the Natural Earth vectors hosted at `https://cdn.jsdelivr.net/npm/@observablehq/plot/data/countries-110m.json` or a raw Natural Earth GeoJSON
- Best fix: Switch to `https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson` or similar that has `name` properties, then match country names directly from the `COUNTRY_NAME_TO_ISO` mapping (reversed -- match by name)
- Add a reverse lookup: given a geo feature name, find if any pageview country matches it

**File: `src/components/analytics/worldMapData.ts`**
- Add a reverse mapping `ISO_TO_COUNTRY_NAME` if needed, or enhance matching to handle the geo feature's `name` property directly

### Technical Details

The core fix for the map: use a GeoJSON/TopoJSON source that provides country `name` properties, then match against the pageview `country` field (which stores country names like "United States", "Germany", etc.) both directly and via the ISO mapping. This ensures countries with visitor data get colored correctly.

