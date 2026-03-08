

## Fix Mobile Responsiveness

### Problems Identified

1. **`App.css` constraining layout**: `#root` has `max-width: 1280px`, `padding: 2rem`, and `text-align: center` — this is leftover Vite boilerplate causing horizontal constraints and padding issues on all pages. Not imported but may still apply since the element exists in `index.html`.

2. **Landing Header**: No mobile menu — nav links are hidden on mobile (`hidden md:flex`) but there's no hamburger menu to access them. The auth buttons (Log in + Get started) always show and can crowd the header on small screens.

3. **WhySwitchSection comparison grid**: Uses `grid-cols-[1fr_auto_1fr]` which gets cramped on mobile — the "bad vs good" comparison squeezes text.

4. **Dashboard header**: Items can overflow on very small screens — UTM Builder button + sign out + email all compete for space.

5. **SiteAnalytics**: Already has a mobile Sheet sidebar — looks reasonable but the header title + current visitors can overflow on small screens.

6. **SelectPlan page**: The 3-column plan grid only breaks at `md` — could be tight on tablets.

### Plan

#### 1. Remove `App.css` boilerplate
Delete or empty `src/App.css` — it's not imported anywhere but the `#root` styles may interfere. Clean it out completely.

#### 2. Add mobile hamburger menu to landing Header
- Add a Sheet/Drawer that opens on mobile (`md:hidden`) with all nav links (Features, Pricing, Privacy, UTM Builder, Docs) plus Log in / Get started buttons.
- Keep desktop nav unchanged.

#### 3. Fix WhySwitchSection comparison cards for mobile
- Change `grid-cols-[1fr_auto_1fr]` to stack vertically on mobile: single column with the arrow between rows, switching to the 3-column grid on `md` and up.

#### 4. Dashboard header mobile tweaks
- Already hides email on mobile and UTM text on small screens — minor tweak to ensure no overflow by adding `overflow-hidden` and `min-w-0` where needed.

#### 5. SiteAnalytics header mobile fix
- Wrap the title + visitors info so it truncates properly on small screens instead of overflowing.

#### 6. General overflow prevention
- Add `overflow-x-hidden` to the root layout wrapper or body to prevent horizontal scrolling on all pages.

### Technical Details
- **Header mobile menu**: Use the existing `Sheet` component (already in the project) with `side="left"` for the mobile nav drawer.
- **WhySwitchSection**: On mobile, each comparison card becomes a vertical stack (bad item → arrow → good item). On `md+`, keeps current 3-column layout.
- **Overflow**: Add `overflow-x-hidden` to `<html>` or `body` via `index.css` as a safety net.
- Files to modify: `src/App.css`, `src/index.css`, `src/components/landing/Header.tsx`, `src/components/landing/WhySwitchSection.tsx`, `src/components/dashboard/DashboardLayout.tsx`, `src/pages/SiteAnalytics.tsx`

