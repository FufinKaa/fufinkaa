/* =========================================================
   FUFATHON Dashboard – script.js (copy & paste)
   - LIVE time (HH:MM:SS)
   - přičítání času za sub/dono (demo)
   - TOP donátoři leaderboard
   - goals + money progress
   - events feed
   - theme toggle
   - state v localStorage
   ========================================================= */

const STORAGE_KEY = "fufathon_state_v1";

// Konfigurace
const MONEY_GOAL = 200000;

// milníky (můžeš upravit jak chceš)
const GOALS = [
  { amount: 1000, label: "1 000 Kč – zatočím kolem výzev 🎡" },
  { amount: 2500, label: "2 500 Kč – make-up challenge 💄" },
  { amount: 5000, label: "5 000 Kč – IRL mini blok (pečení / snack test) 🍪" },
  { amount: 7500, label: "7 500 Kč – giveaway 🎁" },
  { amount: 10000, label: "10 000 Kč – boss level challenge 👑" },
  { amount: 20000, label: "20 000 Kč – komunitní hra / special stream 🎮" },
  { amount: 50000, label: "50 000 Kč – velká challenge 💥" },
  { amount: 100000, label: "100 000 Kč – MEGA moment ✨" },
  { amount: 200000, label: "200 000 Kč – FINAL BOSS 🏁" }
];

// Přičítání času
const TIME_RULES = {
  t1: 10 * 60,       // +10 min
  t2: 15 * 60,       // +15 min
  t3: 20 * 60,       // +20 min
  donate100: 15 * 60 // +15 min za 100 Kč (demo)
};

// DOM helper
const $ = (id) => document.getElementById(id);

function now() {
  return Date.now();
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatHMS(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

function formatHMText(ms) {
  const totalMin = Math.max(0, Math.floor(ms / 1000 / 60));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${pad2(h)} h ${pad2(m)} min`;
}

function formatMoney(kc) {
  return `${Number(kc).toLocaleString("cs-CZ")} Kč`;
}

function safeText(str) {
  return String(str ?? "");
}

// ====== State ======
function defaultState() {
  const start = now();
  return {
    // čas
    startedAt: start,
    endsAt: start,          // “konec” v ms (přičítáme čas sem)
    // čísla
    money: 0,
    t1: 0,
    t2: 0,
    t3: 0,
    // feed
    events: [
      { ts: start, text: "💗✨ FUFATHON je LIVE – čekám na první sub/donate 💜" }
    ],
    // top donors
    donors: [], // [{ user, total }]
    // theme
    theme: "dark"
  };
}

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);

    // minimální migrace/ochrana
    const d = defaultState();
    return {
      ...d,
      ...parsed,
      events: Array.isArray(parsed.events) ? parsed.events : d.events,
      donors: Array.isArray(parsed.donors) ? parsed.donors : d.donors
    };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ====== Theme ======
function applyTheme(theme) {
  // pokud tvé CSS používá např. class na body, necháváme to univerzální:
  document.body.dataset.theme = theme; // můžeš v CSS používat [data-theme="light"]...
  const btn = $("themeToggle");
  if (btn) btn.textContent = theme === "light" ? "☀️" : "🌙";
  state.theme = theme;
  saveState();
}

function toggleTheme() {
  const next = (state.theme === "light") ? "dark" : "light";
  applyTheme(next);
}

// ====== Events feed ======
function pushEvent(text) {
  const item = { ts: now(), text: safeText(text) };
  state.events.unshift(item);
  state.events = state.events.slice(0, 30);
  saveState();
  renderEvents();
}

function renderEvents() {
  const el = $("events");
  if (!el) return;

  el.innerHTML = state.events.map(ev => {
    const dt = new Date(ev.ts).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
    return `<li><span class="muted">[${dt}]</span> ${escapeHtml(ev.text)}</li>`;
  }).join("");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[s]));
}

// ====== TOP donors ======
function addDonation(user, amountKc) {
  const name = (user || "Anonym").trim();
  const amt = Number(amountKc) || 0;
  if (amt <= 0) return;

  const found = state.donors.find(d => d.user.toLowerCase() === name.toLowerCase());
  if (found) found.total += amt;
  else state.donors.push({ user: name, total: amt });

  state.donors.sort((a, b) => b.total - a.total);
  state.donors = state.donors.slice(0, 10);

  saveState();
  renderTopDonors();
}

function renderTopDonors() {
  const el = $("topDonors");
  if (!el) return;

  if (!state.donors.length) {
    el.innerHTML = `<li class="muted">Zatím nikdo… první top donátor budeš ty? 💗</li>`;
    return;
  }

  el.innerHTML = state.donors.map((d, i) => `
    <li>
      <span>${i + 1}. ${escapeHtml(d.user)}</span>
      <span class="amt">${Number(d.total).toLocaleString("cs-CZ")} Kč</span>
    </li>
  `).join("");
}

// ====== Time ======
function addSeconds(sec) {
  const add = Number(sec) || 0;
  if (add <= 0) return;

  // pokud endsAt je v minulosti, necháme ho nejdřív "dorovnat" na teď,
  // aby přičítání dávalo smysl i když timer doběhl
  if (state.endsAt < now()) state.endsAt = now();

  state.endsAt += add * 1000;
  saveState();
  renderTime();
}

function renderTime() {
  const remaining = state.endsAt - now();

  // 1) původní formát “00 h 00 min”
  const timerEl = $("timer");
  if (timerEl) timerEl.textContent = formatHMText(remaining);

  // 2) NOVÉ: LIVE HH:MM:SS
  const liveEl = $("liveTime");
  if (liveEl) liveEl.textContent = formatHMS(remaining);

  // 3) konec
  const endEl = $("endTime");
  if (endEl) {
    endEl.textContent = `Konec: ${state.endsAt > 0 ? new Date(state.endsAt).toLocaleString("cs-CZ") : "—"}`;
  }

  // 4) progress času (od startu do endsAt)
  const progressEl = $("timeProgress");
  const progressTextEl = $("timeProgressText");
  if (progressEl && progressTextEl) {
    const total = Math.max(1, state.endsAt - state.startedAt);
    const done = Math.min(total, Math.max(0, now() - state.startedAt));
    const pct = Math.round((done / total) * 100);
    progressEl.style.width = `${pct}%`;
    progressTextEl.textContent = `${pct}%`;
  }
}

// ====== Money + Goals ======
function setMoney(newMoney) {
  state.money = Math.max(0, Number(newMoney) || 0);
  saveState();
  renderMoney();
  renderGoals();
}

function addMoney(amountKc) {
  const amt = Number(amountKc) || 0;
  if (amt <= 0) return;
  setMoney(state.money + amt);
}

function renderMoney() {
  const moneyEl = $("money");
  if (moneyEl) moneyEl.textContent = formatMoney(state.money);

  const pct = Math.min(100, Math.round((state.money / MONEY_GOAL) * 100));
  const barEl = $("moneyProgress");
  const textEl = $("moneyProgressText");
  if (barEl) barEl.style.width = `${pct}%`;
  if (textEl) textEl.textContent = `${formatMoney(state.money).replace(" Kč","")} / ${MONEY_GOAL.toLocaleString("cs-CZ")} Kč`;
}

function renderGoals() {
  const summaryEl = $("goalsSummary");
  const listEl = $("goalsList");
  const progEl = $("goalsProgress");

  if (summaryEl) summaryEl.textContent = `${state.money.toLocaleString("cs-CZ")} / ${MONEY_GOAL.toLocaleString("cs-CZ")} Kč`;

  const pct = Math.min(100, Math.round((state.money / MONEY_GOAL) * 100));
  if (progEl) progEl.style.width = `${pct}%`;

  if (!listEl) return;

  listEl.innerHTML = GOALS.map(g => {
    const done = state.money >= g.amount;
    return `
      <li class="${done ? "done" : ""}">
        <span>${escapeHtml(g.label)}</span>
        <span class="pill">${g.amount.toLocaleString("cs-CZ")} Kč</span>
      </li>
    `;
  }).join("");
}

// ====== Subs ======
function renderSubs() {
  const t1 = $("t1");
  const t2 = $("t2");
  const t3 = $("t3");
  if (t1) t1.textContent = String(state.t1);
  if (t2) t2.textContent = String(state.t2);
  if (t3) t3.textContent = String(state.t3);
}

function handleSub(tier) {
  if (tier === 1) {
    state.t1 += 1;
    addSeconds(TIME_RULES.t1);
    pushEvent(`🎁 T1 sub +10 min`);
  } else if (tier === 2) {
    state.t2 += 1;
    addSeconds(TIME_RULES.t2);
    pushEvent(`🎁 T2 sub +15 min`);
  } else if (tier === 3) {
    state.t3 += 1;
    addSeconds(TIME_RULES.t3);
    pushEvent(`🎁 T3 sub +20 min`);
  }
  saveState();
  renderSubs();
  partyConfetti();
}

function handleDonation(user, amountKc) {
  // Přidáme peníze
  addMoney(amountKc);

  // Přičteme čas (demo: 100 Kč = +15 min; tady “škálujeme” po stovkách)
  const hundreds = Math.floor((Number(amountKc) || 0) / 100);
  if (hundreds > 0) {
    addSeconds(hundreds * TIME_RULES.donate100);
  }

  // leaderboard
  addDonation(user || "Anonym", amountKc);

  // feed
  pushEvent(`💰 Donate ${Number(amountKc).toLocaleString("cs-CZ")} Kč – děkuju! 💗`);

  partyConfetti();
}

// ====== Confetti ======
function partyConfetti() {
  if (typeof confetti !== "function") return;
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.6 }
  });
}

// ====== Demo buttons ======
function bindDemoButtons() {
  const wrap = document.querySelector(".demo-buttons");
  if (!wrap) return;

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    if (!action) return;

    if (action === "t1") return handleSub(1);
    if (action === "t2") return handleSub(2);
    if (action === "t3") return handleSub(3);

    if (action === "donate100") {
      // demo donor jméno – klidně si změň
      return handleDonation("DemoDonor", 100);
    }

    if (action === "reset") {
      state = defaultState();
      saveState();
      // rovnou nastavíme theme podle defaultu
      applyTheme(state.theme);
      renderAll();
      pushEvent("🧪 Reset (demo) – vše vynulováno.");
      return;
    }
  });
}

// ====== Init / Render ======
function renderAll() {
  renderTime();
  renderMoney();
  renderGoals();
  renderSubs();
  renderEvents();
  renderTopDonors();
}

function initTheme() {
  // theme v state, ale když má user něco uloženého, použijeme to
  applyTheme(state.theme || "dark");

  const btn = $("themeToggle");
  if (btn) btn.addEventListener("click", toggleTheme);
}

// start
initTheme();
bindDemoButtons();
renderAll();

// Timer refresh (plynulejší LIVE HH:MM:SS)
setInterval(renderTime, 250);
