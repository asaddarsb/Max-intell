/* "Talk to an Expert" modal — fully self-contained.
   - Modal markup is embedded here (no runtime fetch of an include file, so it
     can't be broken by deploy paths, folder permissions, or CORS).
   - Binds EVERY "Talk to Expert" trigger on the page (nav, hero, footer…),
     not just the first one.
   - Submits via send-email.php (path derived from this script's own URL so it
     works under any subfolder such as /2026/), with an email fallback.
*/
(function () {
  // Base URL of the deployment (…/2026/) derived from THIS script's src.
  var ASSET_BASE = (function () {
    var src = (document.currentScript && document.currentScript.src) || (function () {
      var ss = document.getElementsByTagName('script');
      for (var i = 0; i < ss.length; i++) {
        if (/assets\/js\/talk-expert-loader\.js/.test(ss[i].src)) return ss[i].src;
      }
      return '';
    })();
    return src.replace(/assets\/js\/talk-expert-loader\.js.*$/, '');
  })();

  var MODAL_HTML =
    '<div id="talkExpertModal" class="fixed inset-0 hidden items-center justify-center z-50">' +
      '<div id="talkExpertOverlay" class="fixed inset-0 bg-black/50"></div>' +
      '<div class="relative bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 p-6 z-50">' +
        '<button id="talkExpertClose" type="button" aria-label="Close" class="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl leading-none">&times;</button>' +
        '<h3 class="text-xl font-semibold mb-4">Talk to an Expert</h3>' +
        '<form id="talkExpertForm" action="' + ASSET_BASE + 'send-email.php" method="POST" class="space-y-4" novalidate>' +
          '<input type="hidden" name="subject" value="Talk to Expert Request">' +
          '<div><label for="te-name" class="block text-sm font-medium text-slate-700 mb-1">Full name</label>' +
            '<input id="te-name" name="name" required class="w-full px-3 py-2 border rounded-md" placeholder="Your full name"></div>' +
          '<div><label for="te-email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>' +
            '<input id="te-email" name="email" type="email" required class="w-full px-3 py-2 border rounded-md" placeholder="you@company.com"></div>' +
          '<div><label for="te-phone" class="block text-sm font-medium text-slate-700 mb-1">Phone</label>' +
            '<input id="te-phone" name="phone" type="tel" class="w-full px-3 py-2 border rounded-md" placeholder="+1 555 555 5555"></div>' +
          '<div><label for="te-message" class="block text-sm font-medium text-slate-700 mb-1">Message</label>' +
            '<textarea id="te-message" name="message" rows="4" required class="w-full px-3 py-2 border rounded-md" placeholder="How can we help?"></textarea></div>' +
          '<div><button type="submit" class="w-full bg-primary text-white py-2 rounded-md hover:bg-secondary transition">Send Request</button></div>' +
          '<p id="talk-expert-status" role="status" aria-live="polite" class="text-sm mt-2 hidden"></p>' +
        '</form>' +
      '</div>' +
    '</div>';

  function injectModal() {
    if (!document.getElementById('talkExpertModal')) {
      document.body.insertAdjacentHTML('beforeend', MODAL_HTML);
    }
  }

  function findTriggers() {
    var set = [];
    // by id (allow duplicates across the page)
    Array.prototype.forEach.call(document.querySelectorAll('#talk-to-expert-btn'), function (el) { set.push(el); });
    // by visible text — any button/link that says "Talk to (an) Expert"
    Array.prototype.forEach.call(document.querySelectorAll('button, a'), function (el) {
      if (el.closest('#talkExpertModal')) return;            // skip controls inside the modal
      if (/talk to (an )?expert/i.test((el.textContent || '').trim())) set.push(el);
    });
    // de-dupe
    return set.filter(function (el, i) { return set.indexOf(el) === i; });
  }

  function init() {
    injectModal();
    var modal   = document.getElementById('talkExpertModal');
    var overlay = document.getElementById('talkExpertOverlay');
    var closeBtn= document.getElementById('talkExpertClose');
    var form    = document.getElementById('talkExpertForm');
    var status  = document.getElementById('talk-expert-status');
    if (!modal) return;

    function open(e) { if (e && e.preventDefault) e.preventDefault(); modal.classList.remove('hidden'); modal.classList.add('flex'); }
    function close()  { modal.classList.add('hidden'); modal.classList.remove('flex'); }

    // Expose globally so the CTA router (and any other script) can open it.
    window.MaxTalkExpert = { open: open, close: close };

    findTriggers().forEach(function (btn) { btn.addEventListener('click', open); });
    if (overlay)  overlay.addEventListener('click', close);
    if (closeBtn) closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    if (form) {
      form.addEventListener('submit', async function (ev) {
        ev.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var fd = new FormData(form);                          // declared in outer scope of handler
        if (status) { status.className = 'text-sm text-slate-600 mt-2'; status.textContent = 'Sending request…'; status.classList.remove('hidden'); }
        try {
          var r = await fetch(form.action, { method: 'POST', body: fd });
          var t = await r.text();
          if (r.ok) {
            if (status) { status.className = 'text-sm text-green-600 mt-2'; status.textContent = t || 'Thanks! We will contact you shortly.'; }
            form.reset(); setTimeout(close, 1400);
          } else if (status) {
            status.className = 'text-sm text-red-600 mt-2'; status.textContent = t || ('Failed to send request (HTTP ' + r.status + ').');
          }
        } catch (err) {
          if (status) { status.className = 'text-sm text-slate-600 mt-2'; status.textContent = 'Opening your email app so you can send this directly…'; }
          var lines = [];
          fd.forEach(function (v, k) { if (k !== 'subject' && String(v).trim()) lines.push(k.replace(/_/g, ' ') + ': ' + v); });
          window.location.href = 'mailto:sales@max-intell.com?subject=' +
            encodeURIComponent(fd.get('subject') || 'Talk to Expert Request') +
            '&body=' + encodeURIComponent(lines.join('\n'));
        }
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
