# QA round 2 — fixes applied

## Root causes found (these drove most of the reported symptoms)

### 1. Undefined color classes → "colors impact", washed-out sections, harsh borders
Pages used `text-accent` (58×), `border-softgray` (40×), `bg-teal`/`text-teal`/gradients,
but the Tailwind config only defined `primary/secondary/dark/light/brand-*`.
Undefined classes generate no color, so accent body text fell back to default and
"soft" borders rendered in the text colour. **`e_s_p.html` alone had 99 such uses.**

Fix: added a consistent palette to **all 25 pages'** configs — `accent:#64748B`
(muted text), `softgray:#E5E7EB` (borders), `teal:#0D9488`. `executive_dash.html`
kept its own red `accent` and just gained the two new keys. All 25 configs validated
as parseable JS afterwards.

### 2. Images not displaying online
- The homepage product logos (already repathed in round 1).
- 63 images hot-linked from UX-Pilot's bucket (`storage.googleapis.com`) that 403
  in production. Two-part fix:
  - `assets/js/img-fallback.js` (loaded on every page): swaps any image that fails
    to load for a branded, correctly-sized SVG placeholder (initials for avatars,
    a labelled gradient tile for graphics), so pages never show broken-image icons
    and layout/shape is preserved.
  - `localize_remote_images.py` (from round 1): downloads all remote images locally
    and rewrites references. Run it on a networked machine to make the site fully
    self-contained.

### 3. Broken internal links (28 unique targets)
- `contact-max-intelligence.html` → `contact-max.html` (13 links)
- friendly-name links → real filenames: `custom_business_solutions.html`→`c_b_s.html`,
  `enterprise_saas_platforms.html`→`e_s_p.html`, `hostel_management.html`→`hos.html` (12 each)
- menu links ending in `.php` → `.html` for pages that ship as `.html` (27 links;
  `send-email.php` left untouched)

Re-scan after fixes: **0 broken internal links.**

## Forms
- **e_s_p.html demo form** was inert (no `name`/`id`/`action`/`method`). Rewired with
  field names, `action="../send-email.php"`, a hidden subject, a status line, and the
  shared handler.
- New `assets/js/forms.js` handles any `form.js-ajax-form`: validates, submits via
  fetch, shows inline status, resets on success, and — if the endpoint is unreachable
  (e.g. static hosting with no PHP) — **falls back to opening the user's email client
  pre-filled** so the enquiry is never lost.
- The contact-page form and the Talk-to-Expert modal already POSTed to `send-email.php`;
  both got the same email-fallback added to their error paths.

## Responsive / "data cut off / out of shape"
Appended a safety-net layer to `assets/css/style.css`:
- `*{min-width:0}` — stops flex/grid children overflowing (the main cause of sideways scroll).
- `html,body{overflow-x:hidden;max-width:100%}` and `img,svg,video{max-width:100%}`.
- `overflow-wrap:anywhere` so long words/URLs wrap instead of widening the layout.
- Mobile clamps for `text-5xl…8xl` so big display headings don't clip on phones.
- Consistent sizing/alignment for client-logo strips (`img[src*="max-client/"]`), and the
  logo "pill" spans changed to `inline-flex items-center gap-2` so logo + name align.

## Structural check on the 9 flagged pages
All have balanced `div`/`section` tags and no empty image sources — no structural
breakage. (`about.html` has 10 `href="#"` placeholder links, likely footer social icons
to be filled in later — left as-is.)

## Not done here / needs your input
- **No screenshots**: this environment has no browser and can't reach the image host,
  so the visual result wasn't rendered. Open the pages locally to eyeball them.
- **Forms need a backend**: `send-email.php` requires PHP hosting. On static hosting the
  email fallback kicks in, but for true form capture use PHP hosting or a form service
  (Formspree/Web3Forms/Netlify Forms) — say the word and I'll wire whichever you use.
- **Remote images**: run `localize_remote_images.py` where there's internet to fully
  localise the 63 UX-Pilot images; otherwise the fallback placeholders cover them.
