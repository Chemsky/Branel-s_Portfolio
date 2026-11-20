(function () {
  var root = document.documentElement;

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
    var btn = this, email = 'BranelOng@outlook.com';
    function done() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy email'; }, 1600); }
    if (navigator.clipboard) { navigator.clipboard.writeText(email).then(done, function () { btn.textContent = 'Select the email to copy'; }); }
    else { btn.textContent = 'Select the email to copy'; }
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
    track.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX; startX = null;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    });
    vp.addEventListener('scroll', function () { vp.scrollLeft = 0; });
    window.addEventListener('resize', function () { if (dlg.open) fit(); });
    dlg.reset = function () { go(0); };
  }
  document.querySelectorAll('dialog').forEach(function (d) { if (d.querySelector('.carousel')) makeCarousel(d); });

  // Email me: show a choice of Gmail or Outlook
  var emailMeBtn = document.getElementById('emailMeBtn');
  var mailChoice = document.getElementById('mailChoice');
  emailMeBtn.addEventListener('click', function () {
    mailChoice.hidden = !mailChoice.hidden;
    emailMeBtn.setAttribute('aria-expanded', mailChoice.hidden ? 'false' : 'true');
  });

  // Pop-ups
  function openDialog(id) {
    var d = document.getElementById(id);
    if (d && !d.open) { d.showModal(); if (d.reset) d.reset(); }
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
