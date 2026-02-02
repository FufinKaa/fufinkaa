/* FUFATHON Dashboard — FINÁLNÍ VERZE (POLL z Cloudflare /api/state) */

(function () {
  // ========= KONFIGURACE =========
  const API_BASE = "https://fufathon-api.pajujka191.workers.dev";
  const API_STATE = `${API_BASE}/api/state`;
  const START_AT = new Date("2026-02-09T14:00:00+01:00");
  const THEME_KEY = "fufathon-theme";
  const POLL_MS = 10000; // 10 sekund

  // ========= GOALS =========
  const DONATE_GOALS = [
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
    { amount: 65000, icon: "😂", title: "Try Not To Laugh" },
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
    { amount: 160000, icon: "🎨", title: "Zažitkové ART studio" },
    { amount: 170000, icon: "🐴", title: "Jízda na koni" },
    { amount: 180000, icon: "⛰️", title: "Výšlap na Lysou horu" },
    { amount: 190000, icon: "✏️", title: "Tetování" },
    { amount: 200000, icon: "🏙️", title: "Víkend v Praze" }
  ];

  const SUB_GOALS = [
    { amount: 100, icon: "🍳", title: "Snídaně podle chatu" },
    { amount: 200, icon: "💄", title: "Make-up challenge" },
    { amount: 300, icon: "👗", title: "Outfit vybíráte vy" },
    { amount: 400, icon: "⚖️", title: "Kontrola váhy od teď" },
    { amount: 500, icon: "⚔️", title: "1v1 s chatem" },
    { amount: 600, icon: "🎮", title: "Vybíráte hru na hlavní blok dne" },
    { amount: 700, icon: "👑", title: "Rozhoduje chat o dni" },
    { amount: 800, icon: "✨", title: "Něco extra (800 subs)" },
    { amount: 1000, icon: "🏎️", title: "Jízda ve sporťáku" }
  ];

  // ========= HELPERS =========
  const $ = (id) => document.getElementById(id);
  function pad(n) { return String(n).padStart(2, "0"); }
  function formatKc(n) { return Number(n || 0).toLocaleString("cs-CZ"); }

  function safeText(el, value) {
    if (!el) return;
    el.textContent = value;
  }

  function fmtTime(ts) {
    if (!ts) return "—";
    const d = new Date(ts);
    if (isNaN(d.getTime())) return "—";
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // ========= TÉMA =========
  function initTheme() {
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
  }

  // ========= TIMER =========
  function initTimer() {
    const el = $("timeRunning");
    if (!el) return;

    function updateTimer() {
      const now = new Date();
      const diff = now - START_AT;
      if (diff < 0) {
        el.textContent = "00:00:00";
        return;
      }

      const seconds = Math.floor(diff / 1000);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      el.textContent = `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  // ========= API =========
  async function fetchState() {
    try {
      const res = await fetch(API_STATE, { cache: "no-store" });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error("API error:", e);
      return null;
    }
  }

  // ========= RENDER GOALS =========
  function renderDonateGoals(money) {
    const body = $("goalTableBody");
    if (!body) return;

    body.innerHTML = "";

    DONATE_GOALS.forEach(goal => {
      const done = money >= goal.amount;
      const tr = document.createElement("tr");
      tr.className = "goal-tr" + (done ? " done" : "");
      tr.innerHTML = `
        <td class="goal-check">${done ? "✅" : "⬜"}</td>
        <td class="goal-name">${goal.icon} ${goal.title}</td>
        <td class="goal-threshold">${formatKc(goal.amount)} Kč</td>
      `;
      body.appendChild(tr);
    });
  }

  function renderSubGoals(subs) {
    const body = $("subGoalTableBody");
    if (!body) return;

    body.innerHTML = "";

    SUB_GOALS.forEach(goal => {
      const done = subs >= goal.amount;
      const tr = document.createElement("tr");
      tr.className = "goal-tr" + (done ? " done" : "");
      tr.innerHTML = `
        <td class="goal-check">${done ? "✅" : "⬜"}</td>
        <td class="goal-name">${goal.icon} ${goal.title}</td>
        <td class="goal-threshold">${goal.amount} subs</td>
      `;
      body.appendChild(tr);
    });
  }

  // ========= TOP 5 DONÁTORŮ =========
  function renderTopDonators(list) {
    const body = $("topTableBody");
    if (!body) return;

    body.innerHTML = "";

    if (!list || list.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4" class="muted">Zatím žádné donaty ✨</td>`;
      body.appendChild(tr);
      return;
    }

    list.slice(0, 5).forEach((donor, idx) => {
      const name = donor.name ?? donor.username ?? "Anonymous";
      const amount = Number(donor.amount || 0);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${name}</td>
        <td>${formatKc(amount)} Kč</td>
        <td>${Math.round(amount * 0.15)} min</td>
      `;
      body.appendChild(tr);
    });
  }

  // ========= 10 POSLEDNÍCH AKCÍ =========
  function renderRecentActivity(events) {
    const feed = $("feed");
    if (!feed) return;

    feed.innerHTML = "";

    if (!events || events.length === 0) {
      const div = document.createElement("div");
      div.className = "activity-item muted";
      div.textContent = "Zatím nic nového…";
      feed.appendChild(div);
      return;
    }

    events.slice(0, 10).forEach(ev => {
      const type = ev.type;
      const d = ev.data || {};

      let text = "Akce";
      if (type === "tip") {
        const who = d.username || "Anonymous";
        const amt = Number(d.amount || 0);
        const cur = d.currency || "CZK";
        text = `💰 ${who} poslal/a ${amt} ${cur}`;
      } else if (type === "sub") {
        const who = d.username || "Anonymous";
        const tier = d.tier ? ` (T${d.tier})` : "";
        text = `🎮 ${who} dal/a sub${tier}`;
      } else if (type === "cheer") {
        const who = d.username || "Anonymous";
        const amt = Number(d.amount || 0);
        text = `✨ ${who} poslal/a ${amt} bits`;
      }

      const div = document.createElement("div");
      div.className = "activity-item";
      div.innerHTML = `
        <span class="activity-time">${fmtTime(ev.ts || ev.time || ev.timestamp)}</span>
        <span class="activity-text">${text}</span>
      `;
      feed.appendChild(div);
    });
  }

  // ========= HLAVNÍ UPDATE =========
  async function updateDashboard() {
    const state = await fetchState();
    if (!state) return;

    // Cloudflare state: totalDonations, totalSubs, topDonors, events, totalMinutes
    const money = Number(state.totalDonations || 0);
    const subs = Number(state.totalSubs || 0);

    safeText($("money"), `${formatKc(money)} Kč`);
    safeText($("moneySmall"), `${formatKc(money)} / 200 000 Kč`);
    safeText($("subsTotal"), String(subs));
    safeText($("subGoalHeader"), `${subs} / 1000 subs`);
    safeText($("goalHeader"), `${formatKc(money)} / 200 000 Kč`);

    // Pokud máš někde minuty (když ne, nic se nestane)
    if ($("minutesTotal")) safeText($("minutesTotal"), String(state.totalMinutes || 0));

    renderDonateGoals(money);
    renderSubGoals(subs);
    renderTopDonators(state.topDonors);
    renderRecentActivity(state.events);

    console.log("✅ Aktualizováno:", { money, subs, minutes: state.totalMinutes });
  }

  // ========= START =========
  document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 FUFATHON Dashboard startuje...");

    initTheme();
    initTimer();

    updateDashboard();
    setInterval(updateDashboard, POLL_MS);

    window.refreshDashboard = updateDashboard;
  });

})();
