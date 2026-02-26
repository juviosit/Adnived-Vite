

# Add Tracking Snippet to Settings + Plausible-Style Improvements

## 1. Add Tracking Snippet Card to Site Settings

Add a new "Tracking Snippet" card to `SiteSettingsPanel.tsx`, placed as the first card (above General), matching Plausible's settings layout where the snippet is prominently shown in site settings.

**Design (Plausible-inspired):**
- Card titled "Tracking Snippet" with description "Add this snippet to your website"
- Instruction text: "Paste this snippet into the `<head>` section of your site."
- Code block with the full `<script>` tag, dynamically using the site's current domain
- Copy button in the top-right corner of the code block
- The snippet URL uses `VITE_SUPABASE_PROJECT_ID` env var to build the endpoint URL
- Note below explaining that the snippet will automatically track pageviews once installed

**Snippet format:**
```
<script defer data-domain="{site.domain}" src="https://{projectId}.supabase.co/functions/v1/track"></script>
```

The `data-domain` attribute updates dynamically based on the site's domain field.

**File: `src/components/analytics/SiteSettingsPanel.tsx`**
- Add `Code` icon import from lucide-react
- Add a new "Tracking Snippet" Card as the first section
- Include a code block with the snippet and a Copy button
- Remove the tracking snippet dialog from the SiteAnalytics header (since it now lives in settings) -- OR keep both for quick access

## 2. Keep Header Snippet Button (Quick Access)

Keep the existing "Tracking snippet" button in the `SiteAnalytics.tsx` header as a convenient shortcut. Both locations serve different purposes: header for quick copy, settings for detailed setup instructions.

No changes needed to `SiteAnalytics.tsx`.

## Technical Details

| File | Change |
|------|--------|
| `src/components/analytics/SiteSettingsPanel.tsx` | Add "Tracking Snippet" card at top with dynamic domain, code block, copy button |

The tracking snippet already uses `site.domain` in `SiteAnalytics.tsx` (line 80). The same pattern will be used in the settings panel, reading `VITE_SUPABASE_PROJECT_ID` from env and building the snippet string with the site's current domain. When the domain is updated and saved, the snippet in settings will reflect the new domain immediately since it reads from the `site.domain` prop.

