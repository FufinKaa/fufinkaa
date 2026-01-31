
// Timer: jak dlouho streamuji (od 09. 02. 2026 14:00 CET)
(function () {
  const el = document.getElementById('timeRunning');
  const info = document.getElementById('startedAtText');
  if (!el) return;

  const start = new Date('2026-02-09T14:00:00+01:00');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = new Date();
    let diff = now - start;
    if (diff < 0) diff = 0;

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    el.textContent = (days > 0)
      ? `${days}d ${pad(hours)}:${pad(mins)}:${pad(secs)}`
      : `${pad(hours)}:${pad(mins)}:${pad(secs)}`;

    if (info) info.textContent = 'Start: 09. 02. 2026 14:00';
  }

  tick();
  setInterval(tick, 1000);
})();

// Light / Dark mode toggle
(function () {
  const btn = document.getElementById('themeBtn');
  const icon = document.getElementById('themeIcon');
  const text = document.getElementById('themeText');
  if (!btn) return;

  const root = document.documentElement;
  const key = 'fufathon-theme';

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    if (icon) icon.textContent = theme === 'light' ? '☀️' : '🌙';
    if (text) text.textContent = theme === 'light' ? 'Den' : 'Noc';
  }

  const saved = localStorage.getItem(key);
  if (saved === 'light' || saved === 'dark') apply(saved);

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem(key, next);
    apply(next);
  });
})();
