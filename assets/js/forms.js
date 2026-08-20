/* Shared handler for any <form class="js-ajax-form">.
   - Validates required fields client-side.
   - Submits via fetch() to the form's `action` (send-email.php).
   - Shows inline status; resets on success.
   - If the endpoint is unreachable (e.g. static hosting with no PHP),
     falls back to opening the user's email client with the message
     pre-filled, so the enquiry is never lost.
*/
(function () {
  var FALLBACK_TO = 'sales@max-intell.com';

  function statusEl(form) {
    return form.querySelector('[role="status"], .form-status') ||
           document.getElementById((form.id || '') + '-status');
  }
  function setStatus(el, msg, kind) {
    if (!el) return;
    var colors = { info: 'text-slate-600', ok: 'text-green-600', err: 'text-red-600' };
    el.className = 'text-sm text-center mt-2 ' + (colors[kind] || colors.info);
    el.textContent = msg;
    el.classList.remove('hidden');
  }
  function buildMailto(fd) {
    var name = fd.get('name') ||
      [fd.get('first_name'), fd.get('last_name')].filter(Boolean).join(' ');
    var lines = [];
    fd.forEach(function (v, k) {
      if (k === 'subject' || !String(v).trim()) return;
      lines.push(k.replace(/_/g, ' ').replace(/\b\w/g, function (c){return c.toUpperCase();}) + ': ' + v);
    });
    var subject = fd.get('subject') || ('Website enquiry' + (name ? ' from ' + name : ''));
    return 'mailto:' + FALLBACK_TO +
           '?subject=' + encodeURIComponent(subject) +
           '&body=' + encodeURIComponent(lines.join('\n'));
  }

  function enhance(form) {
    var submitBtn = form.querySelector('button[type="submit"], [type="submit"]');
    var st = statusEl(form);

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Native validation for required fields.
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var fd = new FormData(form);
      // Compose a single "name" field if the form only has first/last.
      if (!fd.get('name')) {
        var full = [fd.get('first_name'), fd.get('last_name')].filter(Boolean).join(' ').trim();
        if (full) fd.set('name', full);
      }
      // Ensure a message exists (some forms only collect structured fields).
      if (!fd.get('message') || !String(fd.get('message')).trim()) {
        var parts = [];
        ['organization', 'product', 'org_size', 'phone'].forEach(function (k) {
          if (fd.get(k)) parts.push(k.replace(/_/g, ' ') + ': ' + fd.get(k));
        });
        if (parts.length) fd.set('message', parts.join('\n'));
      }

      var oldLabel = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.classList.add('opacity-70', 'cursor-wait'); }
      setStatus(st, 'Sending…', 'info');

      try {
        var res = await fetch(form.action, { method: 'POST', body: fd });
        var text = await res.text();
        if (res.ok) {
          setStatus(st, text || 'Thanks! Your message has been sent.', 'ok');
          form.reset();
        } else {
          setStatus(st, text || ('Something went wrong (HTTP ' + res.status + '). Please try again.'), 'err');
        }
      } catch (err) {
        // Endpoint unreachable → graceful email fallback.
        setStatus(st, 'Opening your email app so you can send this directly…', 'info');
        window.location.href = buildMailto(fd);
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove('opacity-70', 'cursor-wait'); submitBtn.innerHTML = oldLabel; }
      }
    });
  }

  function init() {
    try {
      var forms = document.querySelectorAll('form.js-ajax-form');
      if (!forms.length) { return; }
      forms.forEach(function (f) {
        try { enhance(f); }
        catch (e) { console.error('[forms] could not enhance a form:', e); }
      });
      console.info('[forms] handler active on ' + forms.length + ' form(s).');
    } catch (e) {
      console.error('[forms] init failed:', e);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
