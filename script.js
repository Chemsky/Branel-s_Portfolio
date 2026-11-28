(function () {
  var root = document.documentElement;
  var MAIL_TO = 'BranelOng@outlook.com';
  var MAIL_SUBJECT = 'Opportunity for Branel Ong';

  // Theme toggle
  try { var saved = localStorage.getItem('theme'); if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved); } catch (e) {}
  document.getElementById('themeBtn').addEventListener('click', function () {
    var current = root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Copy email
  document.getElementById('copyBtn').addEventListener('click', function () {
    var btn = this;
    function show(text, ms) { btn.textContent = text; setTimeout(function () { btn.textContent = 'Copy email'; }, ms); }
    function fail() { show('Select the email to copy', 3000); }
    if (navigator.clipboard) { navigator.clipboard.writeText(MAIL_TO).then(function () { show('Copied', 1600); }, fail); }
    else { fail(); }
  });

  // Sliders inside each pop-up
  function makeCarousel(dlg) {
    var vp = dlg.querySelector('.viewport');
    var track = dlg.querySelector('.track');
    var slides = track.children;
    var dotsBox = dlg.querySelector('.dots');
    var countEl = dlg.querySelector('.count');
    var index = 0;
    Array.prototype.forEach.call(slides, function (_, n) {
      var d = document.createElement('button');
      d.className = 'dot'; d.type = 'button';
      d.setAttribute('aria-label', 'Go to slide ' + (n + 1));
      d.addEventListener('click', function () { go(n); });
      dotsBox.appendChild(d);
    });
    function fit() { vp.style.height = slides[index].offsetHeight + 'px'; }
    function go(n) {
      index = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * index) + '%)';
      Array.prototype.forEach.call(dotsBox.children, function (d, k) { d.setAttribute('aria-current', k === index ? 'true' : 'false'); });
      Array.prototype.forEach.call(slides, function (s, k) { s.setAttribute('aria-hidden', k === index ? 'false' : 'true'); });
      countEl.textContent = (index + 1) + ' / ' + slides.length;
      fit();
    }
    dlg.querySelector('.prev').addEventListener('click', function () { go(index - 1); });
    dlg.querySelector('.next').addEventListener('click', function () { go(index + 1); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') go(index - 1);
      if (e.key === 'ArrowRight') go(index + 1);
    });
    var startX = null;
    track.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    track.addEventListener('pointercancel', function () { startX = null; });
    track.addEventListener('pointerleave', function () { startX = null; });
    track.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX; startX = null;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    });
    vp.addEventListener('scroll', function () { vp.scrollLeft = 0; });
    dlg.reset = function () { go(0); };
    dlg.refit = fit;
  }
  document.querySelectorAll('dialog').forEach(function (d) { if (d.querySelector('.carousel')) makeCarousel(d); });
  window.addEventListener('resize', function () {
    document.querySelectorAll('dialog[open]').forEach(function (d) { if (d.refit) d.refit(); });
  });

  // Email me: show a choice of Gmail or Outlook
  var emailMeBtn = document.getElementById('emailMeBtn');
  var mailChoice = document.getElementById('mailChoice');
  emailMeBtn.addEventListener('click', function () {
    mailChoice.hidden = !mailChoice.hidden;
    emailMeBtn.setAttribute('aria-expanded', mailChoice.hidden ? 'false' : 'true');
  });

  // On phones, open the Gmail / Outlook app; fall back to the web version if it isn't installed.
  // On computers the links simply open the web version in a new tab.
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/.test(ua);
  var APPS = {
    gmail: { ios: 'googlegmail://co?to=', android: 'com.google.android.gm' },
    outlook: { ios: 'ms-outlook://compose?to=', android: 'com.microsoft.office.outlook' }
  };
  function appUrl(app, webUrl) {
    var to = encodeURIComponent(MAIL_TO), su = encodeURIComponent(MAIL_SUBJECT);
    if (isIOS) return APPS[app].ios + to + '&subject=' + su;
    return 'intent:' + MAIL_TO + '?subject=' + su + '#Intent;scheme=mailto;package=' + APPS[app].android +
      ';S.browser_fallback_url=' + encodeURIComponent(webUrl) + ';end';
  }
  var iosFallback = null;
  document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimeout(iosFallback); });
  document.querySelectorAll('[data-app]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (!isIOS && !isAndroid) return; // computers: open the web version
      e.preventDefault();
      var webUrl = link.href;
      window.location.href = appUrl(link.getAttribute('data-app'), webUrl);
      if (isIOS) {
        // iOS has no built-in fallback: if the app didn't open, go to the web version
        clearTimeout(iosFallback);
        iosFallback = setTimeout(function () { if (!document.hidden) window.location.href = webUrl; }, 1500);
      }
    });
  });

  // Pop-ups
  function openDialog(id) {
    var d = document.getElementById(id);
    if (d && !d.open) { d.showModal(); d.scrollTop = 0; if (d.reset) d.reset(); }
  }
  document.querySelectorAll('[data-open]').forEach(function (btn) {
    btn.addEventListener('click', function () { openDialog(btn.getAttribute('data-open')); });
  });
  document.querySelectorAll('dialog').forEach(function (d) {
    d.querySelector('[data-close]').addEventListener('click', function () { d.close(); });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); }); // click outside
  });

  // Open a view from the link, e.g. #skills
  var h = location.hash.slice(1);
  if (['about', 'skills', 'experience', 'contact'].indexOf(h) > -1) openDialog(h);
})();
