

## Two Fixes

### 1. Password change requires current password

Currently `SettingsTab.tsx` only asks for new + confirm password and calls `supabase.auth.updateUser({ password })` directly. This means any logged-in session can change the password without verifying identity.

**Fix**: Add a "Current password" field. Before updating, re-authenticate the user by calling `supabase.auth.signInWithPassword({ email, password: currentPassword })`. Only proceed with `updateUser` if that succeeds.

**Changes**: `src/components/dashboard/SettingsTab.tsx`
- Add `currentPassword` state
- Add "Current password" input field above "New password"
- In `handleChangePassword`, first call `signInWithPassword` with the current password to verify identity, then call `updateUser({ password: newPassword })`

### 2. SelectPlan page shown to users who already have a plan

The `SelectPlan` page checks `plan_selected` on mount and redirects if true, but there's a race condition — the plans list loads first and renders the UI before the profile check completes. Also, browser back-button navigation can show the page briefly.

**Fix**: 
- In `SelectPlan.tsx`, start with a loading state that covers both the plans fetch AND the profile check. Only render the plan selection UI after confirming `plan_selected` is false.
- In `ProtectedRoute.tsx`, when the user is on `/select-plan` AND already has `plan_selected = true`, redirect them to `/dashboard` instead of bypassing the check entirely.

**Changes**:

`src/pages/SelectPlan.tsx`
- Add a `profileChecked` state (default false)
- Gate rendering on both `loading` (plans) AND `profileChecked`
- Only show plan UI when `profileChecked === true` and user hasn't selected a plan

`src/components/ProtectedRoute.tsx`
- When `location.pathname === "/select-plan"`, still run the profile check instead of skipping it
- If `plan_selected` is already true, redirect to `/dashboard`

