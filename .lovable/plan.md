

# Events Setup: URL-Based Conversion Tracking

## Overview
Add a "Goals" (events) management UI to the site analytics page, allowing users to configure URL-based triggers. When a site visitor lands on a matching URL, it automatically fires as a conversion event. The tracking edge function will be updated to check for matching goals on every pageview and auto-record them as custom events.

---

## How It Works

1. User creates a goal in the site analytics page (e.g., name: "Signup completed", URL: "/thank-you")
2. When any visitor hits that URL on the tracked site, the tracking script automatically records a `custom_event` with the goal name
3. The analytics page shows goal conversion counts alongside pageview data

---

## Implementation Steps

### 1. Update the Track Edge Function (`supabase/functions/track/index.ts`)

After inserting a pageview, query the `goals` table for the current site where `goal_type = 'page_visit'` and `goal_value` matches the current `pathname`. For each match, insert a `custom_event` with `event_name` set to the goal's name (derived from goal_value or a new `name` column).

**Problem**: The `goals` table doesn't have a `name` column -- it only has `goal_type` and `goal_value`. We need to add a `name` column so users can label their goals (e.g., "Signup completed" for URL "/thank-you").

### 2. Database Migration

Add a `name` column to the `goals` table:

```sql
ALTER TABLE public.goals ADD COLUMN name text NOT NULL DEFAULT '';
```

### 3. Create Goals Management Component (`src/components/analytics/GoalsPanel.tsx`)

A new component rendered within the `SiteAnalytics` page that:
- Lists all configured goals for the site (from the `goals` table)
- Shows a form to add a new goal: name (text) + URL path (text, goal_type="page_visit")
- Delete button for each goal
- Displays conversion count for each goal (count of matching `custom_events`)

### 4. Update Site Analytics Page (`src/pages/SiteAnalytics.tsx`)

- Import and render the `GoalsPanel` component below the existing breakdown cards
- Fetch `custom_events` for the site to display goal conversion metrics
- Add a "Goals" section with conversion counts per goal

### 5. Update Track Edge Function Logic

In the POST handler, after inserting the pageview:

```
// After pageview insert, check for matching goals
const { data: matchingGoals } = await supabase
  .from("goals")
  .select("id, name, goal_value")
  .eq("site_id", site.id)
  .eq("goal_type", "page_visit");

for (const goal of matchingGoals || []) {
  if (pathname === goal.goal_value || pathname.startsWith(goal.goal_value)) {
    await supabase.from("custom_events").insert({
      site_id: site.id,
      event_name: `goal:${goal.name}`,
      properties: { goal_id: goal.id, pathname },
    });
  }
}
```

This runs server-side so no client changes are needed -- goals fire automatically on matching pageviews.

---

## Technical Details

### Database Changes
- Add `name` text column to `goals` table (non-nullable, default empty string)
- No new RLS policies needed -- existing policies already cover goals CRUD for site owners/members and admin access

### Files Modified
| File | Change |
|------|--------|
| `supabase/functions/track/index.ts` | Add goal-matching logic after pageview insert |
| `src/pages/SiteAnalytics.tsx` | Add GoalsPanel section, fetch custom_events data |
| New: `src/components/analytics/GoalsPanel.tsx` | Goals CRUD UI with conversion counts |
| Migration SQL | Add `name` column to `goals` table |

### Edge Function Insert Permissions
The track function uses the service role key, so it can insert into `custom_events` without RLS restrictions. The `custom_events` table currently has no INSERT policy for regular users, which is correct -- events are only created server-side by the tracker.

