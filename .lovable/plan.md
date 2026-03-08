

## Plan: Secure Subscription Changes + Dashboard Text Visibility

### 1. Secure Subscription Downgrade via Backend Function

**Problem**: The `PlanTab.tsx` component tries to update `user_subscriptions` directly from the client to schedule downgrades, but the RLS policy only allows admins to update subscriptions. This means downgrades silently fail for regular users.

**Solution**: Create a backend function `schedule-downgrade` that:
- Accepts `{ target_plan_id }` from the authenticated user
- Validates the target plan exists and is a lower-priced plan than the current one
- Updates `scheduled_plan_id` on the user's subscription using the service role key
- Similarly, create a `cancel-downgrade` function for cancelling scheduled downgrades

**Files to create:**
- `supabase/functions/schedule-downgrade/index.ts` — validates and sets `scheduled_plan_id`
- `supabase/functions/cancel-downgrade/index.ts` — clears `scheduled_plan_id`

**Files to modify:**
- `src/components/dashboard/PlanTab.tsx` — replace direct `.update()` calls with `supabase.functions.invoke("schedule-downgrade")` and `supabase.functions.invoke("cancel-downgrade")`

### 2. Dashboard Text Visibility Improvements

**Problem**: Secondary text (descriptions, dates, card subtitles) in the dashboard area appears too light against the warm cream background, making it hard to read.

**Changes in `src/index.css`:**
- Darken `--card-foreground` slightly for better contrast on card surfaces
- Darken `--muted-foreground` further in light mode (from current `20 10% 35%` to `20 12% 28%`)

**Changes in dashboard components** (`DashboardLayout.tsx`, `SitesTab.tsx`, `SettingsTab.tsx`, `PlanTab.tsx`):
- Replace `text-muted-foreground` with `text-foreground/70` on key descriptive text where more contrast is needed
- Ensure card descriptions, dates, and secondary labels use stronger contrast values

### Summary of Changes

| Area | What changes |
|------|-------------|
| `schedule-downgrade` edge function | New — handles downgrade securely server-side |
| `cancel-downgrade` edge function | New — handles cancel securely server-side |
| `PlanTab.tsx` | Use edge functions instead of direct DB updates; improve text contrast |
| `SitesTab.tsx` | Improve text contrast on card descriptions and dates |
| `SettingsTab.tsx` | Improve text contrast on descriptions |
| `DashboardLayout.tsx` | Improve email text contrast in header |
| `src/index.css` | Darken `--muted-foreground` for better readability |

