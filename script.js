// Fam7 Naturals — site behaviour. Simple and steady: no scroll animations.
(function () {
  var btn = document.getElementById('menuBtn');
  var nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;
  function setOpen(open) {
    nav.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  btn.addEventListener('click', function () { setOpen(nav.hidden); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) setOpen(false); });
})();

// Hero slideshow: fade only, pauses on touch/hover/hidden tab, swipe + arrows + dots.
(function () {
  var wrap = document.getElementById('slides');
  if (!wrap) return;
  var slides = [].slice.call(wrap.querySelectorAll('.slide'));
  var dotsBox = document.getElementById('heroDots');
  var video = document.getElementById('heroVideo');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = 0, timer = null, held = false, DELAY = 6500, vReady = false;
  function playVideo() {
    if (!video || !vReady) return;
    if (cur === 0 && !reduce) { video.currentTime = 0; var p = video.play(); if (p && p.catch) p.catch(function () {}); } else { video.pause(); }
  }
  if (video) {
    video.addEventListener('playing', function () { video.classList.add('is-playing'); });
    window.addEventListener('load', function () { vReady = true; playVideo(); });
  }
  var dots = slides.map(function (s, i) {
    var b = document.createElement('button');
    b.className = 'hero-dot'; b.type = 'button';
    b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    b.innerHTML = '<i></i>';
    b.addEventListener('click', function () { go(i, true); });
    dotsBox.appendChild(b); return b;
  });
  function go(i, user) {
    cur = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) {
      var on = n === cur;
      s.classList.toggle('is-on', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
      [].forEach.call(s.querySelectorAll('a,button'), function (el) { el.tabIndex = on ? 0 : -1; });
    });
    dots.forEach(function (d, n) { d.setAttribute('aria-current', n === cur ? 'true' : 'false'); });
    playVideo();
    schedule(user);
  }
  function schedule(user) {
    clearTimeout(timer);
    if (reduce || user === 'stop' || held || document.hidden) return;
    timer = setTimeout(function () { go(cur + 1); }, cur === 0 ? 7200 : DELAY);
  }
  document.getElementById('heroPrev').addEventListener('click', function () { go(cur - 1, true); });
  document.getElementById('heroNext').addEventListener('click', function () { go(cur + 1, true); });
  wrap.addEventListener('mouseenter', function () { held = true; clearTimeout(timer); });
  wrap.addEventListener('mouseleave', function () { held = false; schedule(); });
  document.addEventListener('visibilitychange', function () { document.hidden ? clearTimeout(timer) : schedule(); });
  var x0 = null;
  wrap.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1), true);
  }, { passive: true });
  go(0);
})();
