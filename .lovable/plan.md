

## Referral Program

### Overview
Paid users can refer others by email. If the referred person signs up within 30 days, both get 1 free month of Pro. A public landing page promotes the program. Admins see a referral log.

### Database Changes (Migration)

**New table: `referrals`**
- `id` uuid PK
- `referrer_id` uuid (references profiles.id via user_id pattern)
- `referral_email` text NOT NULL
- `referral_code` text UNIQUE NOT NULL (generated code)
- `referred_user_id` uuid nullable (filled when they sign up)
- `status` text default 'pending' (pending | completed | expired)
- `reward_applied` boolean default false
- `created_at` timestamptz default now()
- `completed_at` timestamptz nullable
- `expires_at` timestamptz default now() + 30 days

**RLS policies on `referrals`:**
- Users can INSERT where `referrer_id = auth.uid()`
- Users can SELECT where `referrer_id = auth.uid()`
- Admins can SELECT all
- Admins can UPDATE all

**Database function: `handle_referral_signup()`**
- Trigger on `profiles` INSERT (new user created)
- Checks if the new user's email matches a pending, non-expired referral
- If match: sets `referred_user_id`, `status = 'completed'`, `completed_at = now()`
- Applies reward: finds Pro plan, gives both referrer and referred user a free month by updating their `user_subscriptions` (extend `current_period_end` by 30 days if already on Pro, or temporarily upgrade to Pro for 1 month)

### New Files

1. **`src/components/dashboard/ReferralTab.tsx`** — Dashboard tab for paid users only
   - Shows referral link/code
   - Form to enter email and "send" referral (inserts into `referrals` table)
   - List of sent referrals with status (pending/completed/expired)
   - Hidden from free users (check subscription like SettingsTab does)

2. **`src/pages/Referral.tsx`** — Public landing page at `/refer`
   - Same design language as homepage (Header + Footer, gradient hero)
   - Explains the program: "Refer a friend, both get 1 month of Pro free"
   - How it works steps
   - CTA to sign up or log in
   - Accepts `?ref=CODE` query param, stores in localStorage for signup flow

3. **`src/pages/admin/AdminReferrals.tsx`** — Admin page at `/admin/referrals`
   - Table showing all referrals: referrer email, referred email, status, date, reward applied
   - Joins with profiles to show emails

### Modified Files

4. **`src/pages/Dashboard.tsx`** — Add `referral` tab key, render `ReferralTab`
5. **`src/components/dashboard/DashboardLayout.tsx`** — Add "Referral" tab trigger (conditionally shown for paid users, or always shown but content handles gating)
6. **`src/pages/Signup.tsx`** — On signup, check localStorage for ref code and pass it via user metadata or call an edge function to link the referral
7. **`src/App.tsx`** — Add `/refer` route, `/admin/referrals` route
8. **`src/components/admin/AdminLayout.tsx`** — Add "Referrals" nav item
9. **`src/components/landing/Header.tsx`** — Add "Refer & Earn" link in nav

### Signup Flow Integration
- When user lands on `/refer?ref=CODE`, store code in localStorage
- On `/signup`, after successful signup, read localStorage ref code
- Call a small edge function `complete-referral` that validates the code, matches email, and applies rewards server-side using service role key (secure, can't be manipulated client-side)

### Edge Function: `supabase/functions/complete-referral/index.ts`
- Accepts `{ referral_code, user_id }` 
- Validates code exists, is pending, not expired, and referred email matches the new user's email
- Updates referral record to completed
- Applies Pro plan reward to both users (extends period or creates temporary subscription)
- Returns success/failure

### Reward Logic
- For users already on Pro/Max: extend `current_period_end` by 30 days
- For users on Free: temporarily set their plan to Pro, set `current_period_end` to now + 30 days (they'll revert to free after)

