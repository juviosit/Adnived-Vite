

## Three Issues to Fix

### Issue 1: Admin plan update not visible after page reload

**Root cause**: When `changePlan` runs for a user without a `sub_id` (because the subscription wasn't matched during merge), it uses `upsert`. However, after page reload, `fetchData` re-fetches all data. The issue is likely that the `changePlan` succeeds (toast shows success) but the admin's client-side query may not be returning the updated data due to stale state or a timing issue with the `fetchData()` call after upsert.

**Fix**: Ensure `changePlan` always uses upsert (simplify the logic), and ensure `fetchData` properly resets state. Also add a small delay or use the response to confirm before calling fetchData.

### Issue 2: Email shows verified in admin but not for the user

**Root cause**: The `SitesTab.tsx` email verification check uses a fragile heuristic — it compares `email_confirmed_at` to `created_at` and if the gap is < 2 seconds, considers the email as "auto-confirmed" (i.e., not truly verified). When the admin verifies a user whose email was already auto-confirmed at signup, `updateUserById({ email_confirm: true })` may NOT update the `email_confirmed_at` timestamp if it's already set. So the original auto-confirmed timestamp persists, the delta remains < 2 seconds, and the user still appears unverified.

**Fix**: Remove the `wasAutoConfirmed` heuristic entirely. Instead, simply check if `email_confirmed_at` is truthy — that means the email is confirmed. If the intent was to enforce real email verification (not auto-confirm), that should be configured at the auth level, not detected client-side with timestamp heuristics.

### Issue 3: Coupon for Pro plan 6 months free — shows Free plan

**Root cause**: The DB actually shows this user IS on the Pro plan. The `create-payment` edge function correctly updates the subscription to Pro when a free_months coupon makes the price $0. However, the `current_period_end` is NOT extended to reflect the 6 free months — it uses the default (30 days). Additionally, if the user is referring to what the admin page showed before the fix, the plan dropdown may have shown stale data. The coupon free_months value is ignored when setting the subscription period.

**Fix**: In `create-payment`, when a `free_months` coupon is used, set `current_period_end` to `now() + (free_months * 30 days)` instead of the default 30 days.

---

### Changes Required

**1. `src/components/dashboard/SitesTab.tsx`**
- Remove the `wasAutoConfirmed` timestamp delta heuristic
- Simply check `!!freshUser?.email_confirmed_at` to determine verification status

**2. `src/pages/admin/AdminUsers.tsx`**
- Simplify `changePlan` to always use upsert with `onConflict: "user_id"`
- Ensure consistent behavior regardless of whether `sub_id` exists

**3. `supabase/functions/create-payment/index.ts`**
- When coupon type is `free_months` and price is $0, calculate `current_period_end` as `now + (free_months * 30 days)` 
- Update the subscription with the extended period end date

