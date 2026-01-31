
/*
  FUFATHON Dashboard — script.js (FULL)
  - Theme toggle (light/dark)
  - Timer "jak dlouho streamuji" (od 09. 02. 2026 14:00 CET)
  - Countdown "do konce zbývá" (podle endsAt z Workeru)
  - Načítání stavu z Cloudflare Worker API (money, subs, top donors, poslední akce)
  - Render money/sub goals
*/

(() => {
  // =========================
  // CONFIG
  // =========================
  const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";

  // Start Fufathonu (CET)
  const START_AT = new Date("2026-02-09T14:00:00+01:00");

  // Výchozí délka, pokud Worker ještě nevrací endsAt
  const INITIAL_DURATION_HOURS = 24;

  // Pravidla přidávání času (používám pro výpočet „Přidaný čas“ v tabulce)
  // 100 Kč = 15 min  => 0.15 min / Kč
  const MINUTES_PER_CZK = 15 / 100;

  // Theme
  const THEME_KEY = "fufathon-theme";

  // Polling
  const POLL_MS = 5000;

  // =========================
  // HELPERS
  // =========================
  const $ = (id) => document.getElementById(id);

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatKc(n) {
    const x = Number(n || 0);
    return x.toLocaleString("cs-CZ");
  }

  function msToClock(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return {
      days,
      h,
      m,
      sec,
      text: days > 0 ? `${days}d ${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(h)}:${pad(m)}:${pad(sec)}`
    };
  }

  function minutesToPretty(mins) {
    const totalSec = Math.round((mins || 0) * 60);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${pad(m)}m`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
  }

  function safeText(el, value) {
    if (!el) return;
    el.textContent = value;
  }

  // =========================
  // THEME
  // =========================
  (function themeInit() {
    const btn = $("themeBtn");
    const icon = $("themeIcon");
    const text = $("themeText");
    if (!btn) return;

    const root = document.documentElement;

    function apply(theme) {
      root.setAttribute("data-theme", theme);
      if (icon) icon.textContent = theme === "light" ? "☀️" : "🌙";
      if (text) text.textContent = theme === "light" ? "Den" : "Noc";
    }

    const saved = localStorage.getItem(THEME_KEY);
    apply(saved === "light" ? "light" : "dark");

    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, next);
      apply(next);
    });
  })();

  // =========================
  // TIMERS
  // =========================
  let subathonEndTime = new Date(START_AT.getTime() + INITIAL_DURATION_HOURS * 3600 * 1000);

  (function runningTimerInit() {
    const el = $("timeRunning");
    const info = $("startedAtText");
    if (!el) return;

    function tick() {
      const diff = Date.now() - START_AT.getTime();
      const clock = msToClock(diff);
      safeText(el, clock.text);
      if (info) safeText(info, "Start: 09. 02. 2026 14:00");
    }

    tick();
    setInterval(tick, 1000);
  })();

  (function countdownInit() {
    const el = $("timeLeft");
    const info = $("endsAtText");
    const bar = $("timeProgress");
    const pct = $("timePct");
    if (!el) return;

    function formatEndsAt(d) {
      try {
        return d.toLocaleString("cs-CZ", { timeZone: "Europe/Prague" });
      } catch {
        return d.toLocaleString("cs-CZ");
      }
    }

    function tick() {
      const now = Date.now();
      const left = subathonEndTime.getTime() - now;
      const clock = msToClock(left);

      safeText(el, clock.text);
      if (info) safeText(info, `Konec: ${formatEndsAt(subathonEndTime)}`);

      // Progress (0–100) podle toho, kolik zbývá z (end-start)
      const total = Math.max(1, subathonEndTime.getTime() - START_AT.getTime());
      const done = Math.min(total, Math.max(0, now - START_AT.getTime()));
      const p = Math.max(0, Math.min(100, (done / total) * 100));

      if (bar) bar.style.width = `${p.toFixed(1)}%`;
      if (pct) safeText(pct, `${p.toFixed(0)}%`);
    }

    tick();
    setInterval(tick, 1000);
  })();

  // =========================
  // GOALS (money + subs)
  // =========================
  // (Zachovávám tvoje seznamy – použité i pro highlight dosažených milníků)
  const GOALS = [
    { amount: 5000, icon: "🎬", title: "Movie night" },
    { amount: 10000, icon: "😏", title: "Q&A bez cenzury" },
    { amount: 15000, icon: "👻", title: "Horror Night" },
    { amount: 20000, icon: "🍔", title: "Jídlo podle chatu" },
    { amount: 25000, icon: "🤡", title: "Kostým stream" },
    { amount: 30000, icon: "💃", title: "Just Dance" },
    { amount: 35000, icon: "🧱", title: "Lego" },
    { amount: 40000, icon: "🍣", title: "Asijská ochutnávka" },
    { amount: 45000, icon: "⛏️", title: "Minecraft SpeedRun DUO" },
    { amount: 50000, icon: "🎤", title: "Karaoke stream" },
    { amount: 55000, icon: "🔫", title: "Battle Royale Challenge" },
    { amount: 60000, icon: "🎳", title: "Bowling" },
    { amount: 65000, icon: "💦", title: "Try Not To Laugh" },
    { amount: 70000, icon: "👣", title: "Běžecký pás" },
    { amount: 75000, icon: "🍹", title: "Drunk Stream" },
    { amount: 80000, icon: "🧍‍♀️", title: "12h Stream ve stoje" },
    { amount: 85000, icon: "🕹️", title: "Split Fiction w/ Juraj" },
    { amount: 90000, icon: "🎁", title: "Mystery box opening" },
    { amount: 95000, icon: "🏆", title: "Turnaj v LoLku" },
    { amount: 100000, icon: "🎉", title: "Stodolní ve stylu" },
    { amount: 110000, icon: "🏎️", title: "Motokáry" },
    { amount: 120000, icon: "🎧", title: "ASMR stream" },
    { amount: 125000, icon: "⚡", title: "Bolt Tower" },
    { amount: 130000, icon: "🥶", title: "Otužování" },
    { amount: 140000, icon: "⛳", title: "MiniGolf" },
    { amount: 150000, icon: "🫧", title: "Vířivka" },
    { amount: 160000, icon: "🎨", title: "Zážitkové ART studio" },
    { amount: 170000, icon: "🐎", title: "Jízda na koni" },
    { amount: 180000, icon: "🏔️", title: "Výšlap na Lysou horu" },
    { amount: 190000, icon: "🖊️", title: "Tetování" },
    { amount: 200000, icon: "🏙️", title: "Víkend v Praze" }
  ];

  const SUB_GOALS = [
    { amount: 100, icon: "🍳", title: "Snídaně podle chatu" },
    { amount: 200, icon: "💄", title: "Make-up challenge" },
    { amount: 300, icon: "👗", title: "Outfit vybíráte vy" },
    { amount: 400, icon: "⚖️", title: "Kontrola váhy od teď" },
    { amount: 500, icon: "⚔️", title: "1v1 s chatem" },
    { amount: 600, icon: "🎮", title: "Vybíráte hru na hlavní blok dne" },
    { amount: 700, icon: "👑", title: "Rozhoduje o dni" },
    { amount: 800, icon: "🍽️", title: "Luxusní restaurace v Ostravě" },
    { amount: 900, icon: "👾", title: "Turnaj ve Fortnite" },
    { amount: 1000, icon: "🏎️", title: "Jízda ve sporťáku" }
  ];

  
function renderGoals(currentMoney = 0) {
  const body = $("goalTableBody");
  if (!body) return;
  body.innerHTML = "";

  for (const g of GOALS) {
    const done = currentMoney >= g.amount;
    const tr = document.createElement("tr");
    tr.className = "goal-tr" + (done ? " done" : "");
    tr.innerHTML = `
      <td class="goal-check">${done ? "✅" : "⬜"}</td>
      <td class="goal-name">${g.icon} ${g.title}</td>
      <td class="goal-threshold">${formatKc(g.amount)} Kč</td>
    `;
    body.appendChild(tr);
  }
}
)();
