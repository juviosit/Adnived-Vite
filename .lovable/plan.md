

# Fix Homepage, Admin Dashboard, and Plan Sync

## Problems Identified

1. **Homepage still says "Request Access"** in HeroSection, CTASection, and Header -- should say "Get Started" / "Sign Up Free"
2. **PricingSection is hardcoded** -- prices don't update when admin changes them; should fetch from database dynamically
3. **Admin Users page is empty** -- the `profiles` table returns no rows, likely because the admin user was created before the profile-creation trigger was set up, so no profile row exists
4. **Admin Sites shows "Unknown" owner** -- same root cause (no profile rows to map emails)

## Plan

### 1. Database: Backfill missing profiles
Run a migration that inserts into `profiles` from `auth.users` for any users who don't have a profile row yet. This ensures existing users (like the admin) appear in the admin panel.

```sql
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', '')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
```

Also verify the `handle_new_user` trigger is attached to `auth.users` so new signups auto-create profiles going forward.

### 2. Homepage text changes
- **HeroSection.tsx**: Change "Request Access" button to "Get Started Free"
- **CTASection.tsx**: Change "Request Access" button to "Start for Free"
- **Header.tsx**: Change "Request Access" button to "Sign Up Free"

### 3. Dynamic PricingSection
Update `PricingSection.tsx` to fetch plans from the database instead of using hardcoded values. This way, when an admin updates pricing in the admin panel, the landing page reflects the changes automatically.

### 4. Admin Users fix
The admin users page relies on profiles to display users. Once profiles are backfilled (step 1), existing users will appear. No code change needed beyond the migration.

### 5. Admin Sites fix  
Same root cause -- once profiles are populated, the owner email lookup will work correctly.

## Technical Details

### Files to modify:
- `src/components/landing/HeroSection.tsx` -- change button text
- `src/components/landing/CTASection.tsx` -- change button text
- `src/components/landing/Header.tsx` -- change button text
- `src/components/landing/PricingSection.tsx` -- rewrite to fetch plans from DB dynamically, map features based on plan slug

### Database migration:
- Backfill profiles from `auth.users`
- Ensure trigger `on_auth_user_created` exists on `auth.users`

