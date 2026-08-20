/* Graceful fallback for images that fail to load (e.g. remote UX-Pilot
   assets that 403 in production). Instead of a broken-image icon, the
   <img> is swapped for a branded, correctly-sized inline SVG so layout
   and shape are preserved. Avatars (rounded / small square) get initials;
   larger graphics get a subtle gradient tile with the alt text.
*/
(function () {
  var BRAND = '#DC2626', DARK = '#0F172A', SOFT = '#E5E7EB';

  function initials(txt) {
    if (!txt) return '';
    var w = txt.trim().split(/\s+/).slice(0, 2);
    return w.map(function (s) { return s.charAt(0).toUpperCase(); }).join('');
  }
  function svgDataUri(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function isAvatar(img) {
    var c = img.className || '';
    return /rounded-full/.test(c) || (img.naturalWidth === 0 && /avatar/i.test(img.src));
  }

  function placeholderFor(img) {
    var w = img.getBoundingClientRect().width || img.width || 96;
    var h = img.getBoundingClientRect().height || img.height || 96;
    w = Math.max(24, Math.round(w)); h = Math.max(24, Math.round(h));
    var alt = img.getAttribute('alt') || '';

    if (isAvatar(img)) {
      var ini = initials(alt) || '•';
      var s = Math.max(w, h);
      return svgDataUri(
        '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="' + BRAND + '"/><stop offset="1" stop-color="' + DARK + '"/></linearGradient></defs>' +
        '<rect width="' + s + '" height="' + s + '" fill="url(#g)"/>' +
        '<text x="50%" y="50%" dy=".35em" text-anchor="middle" fill="#fff" ' +
        'font-family="Comfortaa, sans-serif" font-weight="700" font-size="' + Math.round(s * 0.4) + '">' + ini + '</text></svg>'
      );
    }
    // Generic graphic tile
    var label = (alt || 'Max Intelligence').replace(/&/g, '&amp;').replace(/</g, '&lt;');
    var fs = Math.max(11, Math.min(20, Math.round(w / 18)));
    return svgDataUri(
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#F8FAFC"/><stop offset="1" stop-color="' + SOFT + '"/></linearGradient></defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#g)"/>' +
      '<rect x="1" y="1" width="' + (w - 2) + '" height="' + (h - 2) + '" fill="none" stroke="' + SOFT + '" stroke-width="2" rx="10"/>' +
      '<circle cx="' + (w / 2) + '" cy="' + (h / 2 - fs) + '" r="' + Math.min(w, h) / 8 + '" fill="none" stroke="' + BRAND + '" stroke-width="2.5"/>' +
      '<text x="50%" y="' + (h / 2 + fs * 1.6) + '" text-anchor="middle" fill="' + DARK + '" ' +
      'font-family="Comfortaa, sans-serif" font-size="' + fs + '" opacity="0.75">' + label + '</text></svg>'
    );
  }

  function handle(img) {
    if (img.dataset.fallbackApplied) return;
    img.dataset.fallbackApplied = '1';
    img.src = placeholderFor(img);
    img.removeAttribute('srcset');
  }

  function attach(img) {
    // Already failed before this script ran?
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
      handle(img);
      return;
    }
    img.addEventListener('error', function () { handle(img); }, { once: true });
  }

  function init() {
    document.querySelectorAll('img').forEach(attach);
    // Catch images added later (e.g. injected modal).
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (n.nodeType !== 1) return;
          if (n.tagName === 'IMG') attach(n);
          else if (n.querySelectorAll) n.querySelectorAll('img').forEach(attach);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
