

## Analytics SaaS Platform — Plausible-Style

A privacy-friendly, cookie-free web analytics platform where users sign up, add their websites, embed a lightweight tracking script, and view clean dashboards with full metrics.

---

### 1. Landing Page & Marketing Site
- Hero section with value proposition: "Simple, privacy-friendly analytics"
- Feature highlights with icons (real-time, no cookies, lightweight script, GDPR-friendly)
- Live demo dashboard preview
- Pricing section (free tier + paid plans)
- Call-to-action buttons for sign up / login

### 2. Authentication & Onboarding
- Sign up / login with email and password (Supabase Auth)
- Email verification flow
- Password reset flow with dedicated reset page
- Post-signup onboarding: guided "Add your first website" flow

### 3. Site Management
- **Add a site**: Enter domain name, get a unique site ID and tracking snippet
- **Site list dashboard**: See all registered sites with quick stats (today's visitors)
- **Site settings**: Edit domain, delete site, manage shared access
- **Tracking snippet**: Auto-generated `<script>` tag users copy into their website

### 4. Tracking Script & Data Collection
- Lightweight edge function endpoint that receives pageview events (URL, referrer, screen size, country, browser, OS)
- No cookies — uses a daily-rotating hash of IP + User-Agent for unique visitor counting
- Events stored in Supabase database with site_id, timestamp, and all dimensions
- Support for custom events (button clicks, form submissions, file downloads)

### 5. Analytics Dashboard (per site)
- **Top metrics bar**: Unique visitors, total visits, pageviews, views per visit, bounce rate, visit duration — each with % change vs previous period
- **Time-series chart**: Line/area chart of visitors over time (recharts) with granularity toggle (hours/days/months)
- **Date range picker**: Today, last 7 days, last 30 days, last 12 months, custom range, with comparison to previous period
- **Real-time view**: Current visitors count, live updating every 30 seconds
- **Breakdown panels** (below chart):
  - **Top Pages**: Most visited pages with visit counts
  - **Top Sources/Referrers**: Where traffic comes from (direct, social, search, referral)
  - **Locations**: Countries and cities with visitor counts (map optional)
  - **Devices**: Browser, OS, and screen size breakdown
  - **UTM Campaigns**: Channel grouping for utm_source, utm_medium, utm_campaign

### 6. Goals & Conversions
- Create goals: pageview goals (specific URL visited) or custom event goals
- Goal conversion rate displayed on dashboard
- Revenue tracking: attach monetary value to conversion events

### 7. Conversion Funnels
- Define multi-step funnels (e.g., Landing → Signup → Purchase)
- Visual funnel chart showing drop-off at each step with conversion percentages

### 8. Filtering & Segmentation
- Click any metric to filter the entire dashboard (e.g., click "Chrome" to see only Chrome users)
- Combine multiple filters (country + source + page)
- Save filter combinations as named segments

### 9. Data Export & Sharing
- Export dashboard data as CSV
- Public/shared dashboard links (optional, toggled per site)
- API access via edge functions for programmatic data retrieval

### 10. Settings & Account
- Profile management (name, email)
- Billing placeholder page
- Team members: invite others to view a site's analytics (viewer/admin roles)
- User roles table with RLS for secure multi-tenant access

### 11. Database Architecture
- **profiles** table (linked to auth.users)
- **sites** table (domain, site_id, owner)
- **site_members** table (shared access with roles)
- **user_roles** table (admin/user roles — separate from profiles)
- **pageviews** table (site_id, timestamp, pathname, referrer, country, browser, os, screen_size, session_hash)
- **custom_events** table (site_id, event_name, properties, timestamp)
- **goals** table (site_id, goal_type, goal_value)
- **funnels** table + **funnel_steps** table
- Full RLS policies ensuring users only see their own sites' data

### 12. Design & Style
- Clean, minimal design inspired by Plausible's aesthetic
- Light mode with subtle purple/indigo accent color
- Card-based layout for metric panels
- Responsive — works on desktop and mobile

