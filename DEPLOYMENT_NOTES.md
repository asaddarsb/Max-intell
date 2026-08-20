# Deployment fix — site runs under /2026/ subfolder

The live site is served from https://max-intell.com/2026/ (a subfolder), but several
paths were ROOT-ABSOLUTE (began with "/"), so they resolved to the domain root and
404'd in production. This is why, on the live site, the hero + section background
images were missing and the helper scripts weren't running.

Fixed to be subfolder-safe (work at any deployment path):
- assets/css/style.css: section backgrounds url("/hero-bg*.svg") -> url("../../hero-bg*.svg")
  (resolved relative to the CSS file, so #hero-section / #solutions-overview /
  #why-max-intelligence / #core-pillars now show their backgrounds).
- All <script> includes (img-fallback.js, forms.js, talk-expert-loader.js) changed from
  /assets/js/... to depth-correct relative paths per page.
- talk-expert-loader.js now derives its asset base from its OWN script URL, so the
  "Talk to Expert" modal loads on interior pages (it previously failed off the site root),
  and the injected modal form posts to the correct send-email.php at any depth.
- Social/schema image URLs (og:image, twitter:image, JSON-LD logo) set to the absolute
  deployed URL so link previews work.
- localize_remote_images.py now rewrites to relative paths too.

No root-absolute front-end asset paths remain (verified: 0 in CSS, HTML src/href, and meta content).

Note: meta canonical/og:url still say https://maxintelligence.com/ (your SEO config, left as-is).
If your canonical domain is actually max-intell.com/2026, update those too.
