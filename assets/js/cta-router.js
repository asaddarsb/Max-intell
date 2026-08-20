/* CTA router — gives every call-to-action button somewhere to go.
   Many buttons in the design are <button> elements with no href/handler
   (Request Demo, Talk to an Expert, Schedule Consultation, Explore …).
   This wires them up by intent, without editing each page's markup.
   Real <a> links, form submits, and menu toggles are left untouched.
*/
(function () {
  // Site base (…/2026/) derived from this script's own URL.
  var BASE = (function () {
    var src = (document.currentScript && document.currentScript.src) || (function () {
      var ss = document.getElementsByTagName('script');
      for (var i = 0; i < ss.length; i++) if (/assets\/js\/cta-router\.js/.test(ss[i].src)) return ss[i].src;
      return '';
    })();
    return src.replace(/assets\/js\/cta-router\.js.*$/, '');
  })();

  function go(path) { window.location.href = BASE + path; }
  function openExpert() {
    if (window.MaxTalkExpert && window.MaxTalkExpert.open) window.MaxTalkExpert.open();
    else go('contact-max.html');
  }
  function scrollTo(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else go('index.html#' + id);
  }

  // Product name -> page (for "Explore Acadmax" etc.)
  var PRODUCT = {
    acadmax: 'solutions/campus/acadmax.html', admax: 'solutions/campus/admax.html',
    libmax:  'solutions/campus/libmax.html',  qec:   'solutions/campus/qec_system.html',
    dashboard: 'solutions/campus/executive_dash.html', campus: 'solutions/campus_suite.html'
  };

  // Ordered rules: first match wins.
  var RULES = [
    // Talk to / connect with a human -> open the expert modal
    { re: /\btalk to\b|\bconnect with\b|expert call|schedule (a |an )?(expert|discovery) call|talk to .*(team|architect|designer|specialist|expert)/i,
      act: openExpert },
    // Demo / consultation / trial / quote / assessment -> contact page
    { re: /\b(request|schedule|book|get)\b.*\b(demo|consultation|call|assessment|proposal|quote|callback|dashboard demo)\b|start (a )?free trial|start your project|request consultation|request callback|build saas platform|modernize your systems|connect dashboard|discuss your use case|request .*assessment|schedule assessment|schedule a discovery call/i,
      act: function () { go('contact-max.html'); } },
    // High-level explore -> on-page overview anchors
    { re: /explore solutions|view all solutions/i, act: function () { scrollTo('solutions-overview'); } },
    { re: /view all services|explore services/i,   act: function () { scrollTo('services-overview'); } },
    // Explore a specific product
    { re: /explore (acadmax|admax|libmax|qec|dashboard|campus)/i,
      act: function (m) { go(PRODUCT[m[1].toLowerCase()] || 'solutions/campus_suite.html'); } },
    // Catch-all for remaining info / media CTAs so nothing is a dead end.
    // (Starts with an action verb — avoids widget tabs like Week / Photo / Renew.)
    { re: /^(view|watch|download|learn more|read|see|get started|request|schedule|book)\b/i,
      act: function () { go('contact-max.html'); } },
  ];

  function eligible(el) {
    if (el.closest('#talkExpertModal')) return false;          // modal's own controls
    if (el.tagName === 'A' && el.getAttribute('href')) return false; // real link
    if (el.hasAttribute('onclick')) return false;
    if (el.getAttribute('type') === 'submit') return false;
    var cls = (el.className || '') + ' ' + (el.id || '');
    if (/menu|nav-toggle|dropdown|hamburger/i.test(cls)) return false; // nav toggles
    if (el.getAttribute('data-cta-wired')) return false;
    return true;
  }

  function wire() {
    Array.prototype.forEach.call(document.querySelectorAll('button, a'), function (el) {
      if (!eligible(el)) return;
      var txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!txt || txt.length > 60) return;
      for (var i = 0; i < RULES.length; i++) {
        var m = txt.match(RULES[i].re);
        if (m) {
          (function (rule, match) {
            el.setAttribute('data-cta-wired', '1');
            el.style.cursor = 'pointer';
            el.addEventListener('click', function (e) { e.preventDefault(); rule.act(match); });
          })(RULES[i], m);
          break;
        }
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
