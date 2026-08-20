# Why images weren't loading on https://max-intell.com/2026/  — and the fix

## Diagnosis (tested against the live server)
- https://max-intell.com/2026/assets/img/max-logo.png  -> loads (200)   ✓
- https://max-intell.com/2026/hero-bg.svg               -> loads (200)   ✓
- https://max-intell.com/2026/c_logos/acadmax.png       -> 404 NOT FOUND ✗

The HTML was correct — the files simply weren't reachable. Two causes:

1. **Folder permissions were 700 (owner-only), so the web server couldn't read them.**
   `assets/img/` was 755 (that's why max-logo.png worked), but these were 700:
     - assets/img/logos      (product logos)
     - assets/img/max-client (your CLIENT / company logos — the ones you said
       weren't showing earlier)
     - c_logos               (product logos at site root)
   A 700 directory is not web-accessible, so every image inside 404/403'd.

2. The root **c_logos/ folder wasn't reliably deploying** at all.

## What I changed in this package
- Moved the four product logos into `assets/img/` itself (the one folder proven
  to serve correctly) and repointed index.html to `assets/img/acadmax.png` etc.
- **Reset every directory to 755 and every file to 644** so nothing is owner-only.
  This also makes your client logos in `assets/img/max-client/` load again.
- Kept `img-fallback.js` as a safety net: anything that still fails to load shows a
  branded placeholder instead of a broken-image icon.

## What YOU must verify on the server after uploading
Whatever you deploy, make sure directories end up 755 and files 644. If your upload
tool (FTP/host panel) doesn't preserve the permissions in this zip, set them manually:

    find . -type d -exec chmod 755 {} \;
    find . -type f -exec chmod 644 {} \;

If images still 404 after that, the folder genuinely isn't being uploaded — check your
deploy/publish step includes `assets/` (and its subfolders) recursively.

Note: this deploy is under /2026/. All paths in this package are relative, so they work
under /2026/ or the domain root without changes.
