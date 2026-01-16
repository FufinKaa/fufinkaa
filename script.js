/* =========================================================
   FUFATHON Dashboard – script.js (REMOTE MODE via Worker API)
   - Time left / Time live (z API)
   - Money + Goals auto-check (z API)
   - Top supporters (z API)
   - Last actions (z API)
   - Pause/Resume support (paused/pausedAt)
   - Cute theme toggle (lokálně uložené)
   ========================================================= */

// =====================
// REMOTE MODE (Cloudflare Worker API)
// =====================
const API_BASE = "https://fufathon-api.pajujka191.workers.dev";
const REMOTE_MODE = true; // true = čte stav z API, false = demo/localStorage

const STORAGE_KEY = "fufathon_state_v3"; // používá se jen když REMOTE_MODE=false
const THEME_KEY = "fufathon_theme_v1";

const MONEY_GOAL = 200000;

// demo-only (v remote módu počítá backend)
const DONATION_SECONDS_PER_KC = 9;
const SUB_MINUTES = { t1: 10, t2: 15, t3: 20 };

// Goals
const GOALS = [
  { amount: 5000, label: "Movie night 🎬" },
  { amount: 10000, label: "Q&A bez cenzury 😈" },
  { amount: 15000, label: "Horror Night 😱" },
  { amount: 20000, label: "Jídlo podle chatu 🍽️" },
  { amount: 25000, label: "Kostým stream 👗" },
  { amount: 30000, label: "Just Dance 💃" },
  { amount: 35000, label: "Lego 🧱" },
  { amount: 40000, label: "Asijská ochutnávka 🍜" },
  { amount: 45000, label: "Minecraft SpeedRun DUO ⛏️" },
  { amount: 50000, label: "Karaoke stream 🎤" },
  { amount: 55000, label: "Battle Royale Challenge 🏹" },
  { amount: 60000, label: "Bowling 🎳" },
  { amount: 65000, label: "Try Not To Laugh 😂" },
  { amount: 70000, label: "Běžecký pás 🏃‍♀️" },
  { amount: 75000, label: "Drunk Stream 🍹" },
  { amount: 80000, label: "12h Stream ve stoje 🧍‍♀️" },
  { amount: 85000, label: "Split Fiction w/ Juraj 🤝" },
  { amount: 90000, label: "Mystery box opening 🎁" },
  { amount: 95000, label: "Turnaj v LoLku 🏆" },
  { amount: 100000, label: "Stodolní ve stylu ✨" },
  { amount: 110000, label: "Motokáry 🏎️" },
  { amount: 120000, label: "ASMR stream 🎧" },
  { amount: 125000, label: "Bolt Tower 🗼" },
  { amount: 130000, label: "Otužování 🧊" },
  { amount: 140000, label: "MiniGolf ⛳" },
  { amount: 150000, label: "Vířivka 🫧" },
  { amount: 160000, label: "Zažitkové ART studio 🎨" },
  { amount: 170000, label: "Jízda na koni 🐴" },
  { amount: 180000, label: "Výšlap na Lysou horu 🏔️" },
  { amount: 190000, label: "Tetování 🖋️" },
  { amount: 200000, label: "Víkend v Praze 🏙️" }
];

const $ = (id) => document.getElementById(id);

function now(){ return Date.now(); }
function pad2(n){ return String(n).padStart(2, "0"); }

function formatHMS(ms){
  const total = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

function formatMoney(kc){
  return `${Number(kc).toLocaleString("cs-CZ")} Kč`;
}

function escapeHtml(str){
  return String(str ?? "").replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[s]));
}

// ---------- State ----------
function defaultState(){
  const start = now();
  const initialMinutes = 24 * 60; // jen fallback pro UI; reálně přepíše API
  return {
    startedAt: start,
    endsAt: start + initialMinutes * 60 * 1000,

    paused: false,
    pausedAt: null,

    money: 0,
    t1: 0,
    t2: 0,
    t3: 0,

    events: [
      { ts: start, text: "💗✨ FUFATHON je LIVE – čekám na první sub/donate 💜" }
    ],

    supporters: [],
    theme: "dark"
  };
}

let state = loadState();

function loadState(){
  if (REMOTE_MODE) {
    const s = defaultState();
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "light" || savedTheme === "dark") s.theme = savedTheme;
    return s;
  }

  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const d = defaultState();
    return {
      ...d,
      ...parsed,
      events: Array.isArray(parsed.events) ? parsed.events : d.events,
      supporters: Array.isArray(parsed.supporters) ? parsed.supporters : d.supporters
    };
  }catch{
    return defaultState();
  }
}

function saveState(){
  if (REMOTE_MODE) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------- Theme ----------
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  const btn = $("themeToggle");
  if(btn) btn.textContent = theme === "light" ? "☀️" : "🌙";
  state.theme = theme;

  try { localStorage.setItem(THEME_KEY, theme); } catch {}
  saveState();
}

function toggleTheme(){
  applyTheme(state.theme === "light" ? "dark" : "light");
}

// ---------- Confetti ----------
function party(){
  if(typeof confetti !== "function") return;
  confetti({ particleCount: 70, spread: 55, origin: { y: 0.65 } });
}

// ---------- Events ----------
function renderEvents(){
  const el = $("events");
  if(!el) return;
  el.innerHTML = state.events.map(ev => {
    const t = new Date(ev.ts).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
    return `<li><span class="muted">[${t}]</span> ${escapeHtml(ev.text)}</li>`;
  }).join("");
}

// ---------- Top supporters ----------
function renderSupporters(){
  const body = $("supportersBody");
  if(!body) return;

  if(!state.supporters.length){
    body.innerHTML = `
      <tr>
        <td colspan="4" class="muted">Zatím nikdo… první top podporovatel budeš ty? 💗</td>
      </tr>`;
    return;
  }

  body.innerHTML = state.supporters.map((s, i) => {
    const addedMin = Math.round((Number(s.addedSec) || 0) / 60);
    return `
      <tr>
        <td>${i+1}</td>
        <td>${escapeHtml(s.user)}</td>
        <td>${Number(s.totalKc).toLocaleString("cs-CZ")} Kč</td>
        <td>+${addedMin.toLocaleString("cs-CZ")} min</td>
      </tr>
    `;
  }).join("");
}

// ---------- Money + Goals ----------
function renderMoney(){
  const moneyEl = $("money");
  if(moneyEl) moneyEl.textContent = formatMoney(state.money);

  const pct = Math.min(100, Math.round((state.money / MONEY_GOAL) * 100));
  const barEl = $("moneyProgress");
  const textEl = $("moneyProgressText");
  if(barEl) barEl.style.width = `${pct}%`;
  if(textEl) textEl.textContent = `${state.money.toLocaleString("cs-CZ")} / ${MONEY_GOAL.toLocaleString("cs-CZ")} Kč`;
}

function renderGoals(){
  const summaryEl = $("goalsSummary");
  const progEl = $("goalsProgress");
  const listEl = $("goalsList");

  if(summaryEl) summaryEl.textContent = `${state.money.toLocaleString("cs-CZ")} / ${MONEY_GOAL.toLocaleString("cs-CZ")} Kč`;
  const pct = Math.min(100, Math.round((state.money / MONEY_GOAL) * 100));
  if(progEl) progEl.style.width = `${pct}%`;

  if(!listEl) return;

  const next = GOALS.find(g => state.money < g.amount);

  listEl.innerHTML = GOALS.map(g => {
    const reached = state.money >= g.amount;
    const isNext = next && next.amount === g.amount;

    return `
      <li class="goal-item ${reached ? "reached" : ""} ${isNext ? "next" : ""}">
        <div class="goal-left">
          <div class="goal-name">${reached ? "✅" : "🎯"} ${escapeHtml(g.label)}</div>
          <div class="goal-meta">${reached ? "splněno 💗" : (isNext ? "další na řadě ✨" : "čeká…")}</div>
        </div>
        <div class="goal-amount">${g.amount.toLocaleString("cs-CZ")} Kč</div>
      </li>
    `;
  }).join("");
}

// ---------- Subs ----------
function renderSubs(){
  if($("t1")) $("t1").textContent = String(state.t1);
  if($("t2")) $("t2").textContent = String(state.t2);
  if($("t3")) $("t3").textContent = String(state.t3);
}

// ---------- Time render (PAUSE AWARE) ----------
function renderTime(){
  const nowMs = now();
  const effectiveNowMs = (state.paused && state.pausedAt) ? state.pausedAt : nowMs;

  const leftMs = state.endsAt - effectiveNowMs;
  const liveMs = effectiveNowMs - state.startedAt;

  const leftEl = $("timeLeftHMS");
  const liveEl = $("timeLiveHMS");
  if(leftEl) leftEl.textContent = formatHMS(leftMs);
  if(liveEl) liveEl.textContent = formatHMS(liveMs);

  const endEl = $("endTime");
  const startEl = $("startTime");
  if(endEl) endEl.textContent = `Konec: ${new Date(state.endsAt).toLocaleString("cs-CZ")}`;
  if(startEl) startEl.textContent = `Start: ${new Date(state.startedAt).toLocaleString("cs-CZ")}`;

  const elapsed = Math.max(0, effectiveNowMs - state.startedAt);
  const remaining = Math.max(0, state.endsAt - effectiveNowMs);
  const total = Math.max(1, elapsed + remaining);
  const pct = Math.round((elapsed / total) * 100);

  const barEl = $("timeProgress");
  const textEl = $("timeProgressText");
  if(barEl) barEl.style.width = `${pct}%`;
  if(textEl) textEl.textContent = `${pct}%`;
}

// ---------- Remote fetch ----------
async function fetchRemoteState(){
  try{
    const res = await fetch(`${API_BASE}/api/state`, { cache: "no-store" });
    if(!res.ok) return;

    const remote = await res.json();

    state.startedAt = remote.startedAt;
    state.endsAt = remote.endsAt;

    state.paused = !!remote.paused;
    state.pausedAt = remote.pausedAt || null;

    state.money = remote.money || 0;
    state.t1 = remote.t1 || 0;
    state.t2 = remote.t2 || 0;
    state.t3 = remote.t3 || 0;

    if(Array.isArray(remote.lastEvents)){
      state.events = remote.lastEvents.map(e => ({ ts: e.ts, text: e.text }));
    }

    if(Array.isArray(remote.topDonors)){
      state.supporters = remote.topDonors.map(d => ({
        user: d.user,
        totalKc: d.totalKc,
        addedSec: d.addedSec
      }));
    }

    renderAll();
  }catch{
    // ignore
  }
}

// ---------- Init ----------
function renderAll(){
  renderTime();
  renderMoney();
  renderGoals();
  renderSubs();
  renderEvents();
  renderSupporters();
}

(function init(){
  applyTheme(state.theme || "dark");
  $("themeToggle")?.addEventListener("click", toggleTheme);

  renderAll();

  // smooth timer UI
  setInterval(renderTime, 250);

  if(REMOTE_MODE){
    fetchRemoteState();
    setInterval(fetchRemoteState, 2000);
  }
})();
