#!/usr/bin/env python3
"""
Localize externally-hosted images (UX Pilot / storage.googleapis.com) so the
site is self-contained.

What it does:
  1. Finds every https://storage.googleapis.com/... image URL across all .html files.
  2. Downloads each unique image into assets/img/remote/.
  3. Rewrites every reference to a root-absolute local path (/assets/img/remote/<file>),
     matching the site's existing convention (e.g. url("/hero-bg.svg")).

Safe to re-run: already-downloaded files are skipped, and a URL is only rewritten
once its file exists locally, so a failed download never breaks a page.

Usage:
    python3 localize_remote_images.py            # download + rewrite
    python3 localize_remote_images.py --dry-run  # show what would happen
"""
import os, re, sys, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DEST = ROOT / "assets" / "img" / "remote"
URL_RE = re.compile(r'https://storage\.googleapis\.com/[^\s"\'\)]+')
DRY = "--dry-run" in sys.argv

def local_ref(html_path, name):
    """Path from a given HTML file to assets/img/remote/<name> (subfolder-safe)."""
    depth = os.path.relpath(html_path, ROOT).count(os.sep)
    return ("../" * depth) + "assets/img/remote/" + name

html_files = [p for p in ROOT.rglob("*.html")
              if "__MACOSX" not in p.parts and "node_modules" not in p.parts]

# 1) collect unique urls
urls = set()
for f in html_files:
    urls.update(URL_RE.findall(f.read_text(encoding="utf-8", errors="replace")))
urls = sorted(urls)
print(f"Found {len(urls)} unique external image URLs across {len(html_files)} pages.\n")

if not DRY:
    DEST.mkdir(parents=True, exist_ok=True)

# 2) download
url_to_local = {}
ok = fail = skip = 0
for u in urls:
    name = u.split("/")[-1].split("?")[0]
    out = DEST / name
    url_to_local[u] = name   # store basename; per-file relative path computed at rewrite
    if out.exists() and out.stat().st_size > 0:
        skip += 1;  continue
    if DRY:
        print(f"  would download  {u}  ->  {out.relative_to(ROOT)}");  continue
    try:
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
        out.write_bytes(data)
        print(f"  downloaded  {name}  ({len(data)//1024} KB)")
        ok += 1
    except Exception as e:
        print(f"  FAILED      {u}\n              {e}")
        url_to_local.pop(u, None)   # keep original URL in HTML if download failed
        fail += 1

print(f"\nDownloads: {ok} new, {skip} already present, {fail} failed.")

# 3) rewrite references (only for successfully-localized URLs)
if DRY:
    print("\n[dry-run] no files modified.")
    sys.exit(0)

rewritten_pages = 0
total_refs = 0
for f in html_files:
    txt = f.read_text(encoding="utf-8", errors="replace")
    new = txt
    for u, name in url_to_local.items():
        if u in new:
            cnt = new.count(u)
            new = new.replace(u, local_ref(f, name))
            total_refs += cnt
    if new != txt:
        f.write_text(new, encoding="utf-8")
        rewritten_pages += 1

print(f"Rewrote {total_refs} references across {rewritten_pages} pages "
      f"-> assets/img/remote/ (relative)\nDone. The site now serves these images locally.")
