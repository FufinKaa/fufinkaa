// ============================
// FUFATHON Dashboard script.js
// ============================

// 1) API endpoint (fix na tvoji chybu "API_STATE is not defined")
const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";

// 2) Dashboard constants
const GOAL_TOTAL = 200000;

// 3) Goals (všechny tvoje)
const GOALS = [
  { amount: 5000,  title: "Movie night", note: "Rozhodnete o filmu vy! 🎬 Pohodlí zajištěno 🍿" },
  { amount: 10000, title: "Q&A bez cenzury", note: "Zeptáte se na cokoliv, já odpovím! 😏" },
  { amount: 15000, title: "Horror Night", note: "Tepovka na max 👻 Bude strašidelně… a vtipně 😱" },
  { amount: 20000, title: "Jídlo podle chatu", note: "Domácí burgery nebo Pizza! 🍔🍕" },
  { amount: 25000, title: "Kostým stream", note: "Půjdeme společně koupit nějaký kostým… 🤡" },
  { amount: 30000, title: "Just Dance", note: "💃 Kolik hodin vydržíme? Tančíme podle vás!" },
  { amount: 35000, title: "Lego", note: "Potřebujeme doplnit Lego Eevee 🧱" },
  { amount: 40000, title: "Asijská ochutnávka", note: "Asijské dobroty 🍣 Vy vybíráte, já ochutnávám!" },
  { amount: 45000, title: "Minecraft SpeedRun DUO", note: "S kým to bude? Naučí mě to už někdo..⛏️" },
  { amount: 50000, title: "Karaoke stream", note: "🎤 Zpíváme hity podle vás!" },
  { amount: 55000, title: "Battle Royale Challenge", note: "💥 Fortnite / Apex / CoD 🔫" },
  { amount: 60000, title: "Bowling", note: "🎳 Budu to umět s koulema? 🤪" },
  { amount: 65000, title: "Try Not To Laugh", note: "S vodou v puse 💦" },
  { amount: 70000, title: "Běžecký pás", note: "Do konce Fufathonu každý den 10 000 kroků 👣" },
  { amount: 75000, title: "Drunk Stream", note: "🍹 Humorné výzvy (legálně 😅)" },
  { amount: 80000, title: "12h Stream ve stoje", note: "🧍‍♀️ Zvládneme to?!" },
  { amount: 85000, title: "Split Fiction w/ Juraj", note: "Společně budeme hrát a tvořit příběh 🕹️" },
  { amount: 90000, title: "Mystery box opening", note: "🎁 Co najdu tentokrát?" },
  { amount: 95000, title: "Turnaj v LoLku", note: "🏆 Vyherní team získá cenu!" },
  { amount: 100000, title: "Stodolní ve stylu", note: "🎉 Dýmka, hudba, tance!" },
  { amount: 110000, title: "Motokáry", note: "🏎️ Adrenalin, drift a smích!" },
  { amount: 120000, title: "ASMR stream", note: "🎤 Relax s chatem 😌" },
  { amount: 125000, title: "Bolt Tower", note: "⚡ Dáme nahoře kávičku?" },
  { amount: 130000, title: "Otužování", note: "🥶 Půjde mi to líp než minule?" },
  { amount: 140000, title: "MiniGolf", note: "⛳ Zábava a šílené hole!" },
  { amount: 150000, title: "Vířivka", note: "🫧 Potřebujeme si odpočinout 💦" },
  { amount: 160000, title: "Zážitkové ART studio", note: "🎨 Malujeme, tvoříme, zapojíte se?" },
  { amount: 170000, title: "Jízda na koni", note: "🐎 Elegantně nebo bláznivě?" },
  { amount: 180000, title: "Výšlap na Lysou horu", note: "🏔️ Krásné výhledy a dobrodružství" },
  { amount: 190000, title: "Tetování", note: "🖊️😱 Co si necháme udělat?" },
  { amount: 200000, title: "Víkend v Praze", note: "🏙️ Srazy, pobyt, procházky" },
];

// 4) Helpers
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function safeText(sel, value) {
  const el = $(sel);
  if (el) el.textContent = value;
}

function safeHTML(sel, html) {
  const el = $(sel);
  if (el) el.innerHTML = html;
}

function formatKc(n) {
  const num = Number(n) || 0;
  return num.toLocaleString("cs-CZ");
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatHMS(totalSec) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
}

function formatTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  // CZ format
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

// 5) Render goals
function renderGoals(money) {
  const container =
    $("#goalsList") ||
    $("#goals") ||
    document.querySelector('[data-block="goals"]');

  if (!container) return;

  const m = Number(money) || 0;

  const items = GOALS.map((g) => {
    const done = m >= g.amount;
    return `
      <div class="goal-item ${done ? "done" : ""}">
        <div class="goal-left">
          <div class="goal-title">
            <span class="goal-check">${done ? "✅" : "⬜"}</span>
            <span>${g.title}</span>
          </div>
          <div class="goal-note">${g.note || ""}</div>
        </div>
        <div class="goal-amount">${formatKc(g.amount)} Kč</div>
      </div>
    `;
  }).join("");

  container.innerHTML = items;
}

// 6) Render last events
function renderEvents(events) {
  const container =
    $("#eventsList") ||
    $("#lastEvents") ||
    document.querySelector('[data-block="events"]');

  if (!container) return;

  const list = (events || []).slice(0, 10).map((e) => {
    const time = e?.ts ? new Date(e.ts).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" }) : "--:--";
    const text = String(e?.text || "").trim();
    return `<div class="event-row"><span class="event-time">[${time}]</span><span class="event-text">${text}</span></div>`;
  }).join("");

  container.innerHTML = list || `<div class="event-row muted">Zatím nic… 💜</div>`;
}

// 7) Render top donors
function renderTopDonors(donors) {
  const tbody =
    $("#topDonorsBody") ||
    document.querySelector("#topDonors tbody") ||
    document.querySelector('[data-block="topdonors"] tbody');

  if (!tbody) return;

  const rows = (donors || []).slice(0, 5).map((d, i) => {
    const user = String(d?.user || "Anonym");
    const totalKc = Number(d?.totalKc || 0);
    const addedSec = Number(d?.addedSec || 0);
    const addedMin = Math.round(addedSec / 60);

    return `
      <tr>
        <td>${i + 1}</td>
        <td>${user}</td>
        <td>${formatKc(totalKc)} Kč</td>
        <td>+${addedMin} min</td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML = rows || `<tr><td colspan="4" class="muted">Zatím nikdo… 💜</td></tr>`;
}

// 8) Main render
let lastState = null;

function renderState(state) {
  lastState = state;

  const startedAt = Number(state?.startedAt) || null;
  const endsAt = Number(state?.endsAt) || null;
  const paused = !!state?.paused;
  const pausedAt = state?.pausedAt ? Number(state.pausedAt) : null;

  // timeRemainingSec comes from API (already respects pause in your Worker)
  const remaining = Number(state?.timeRemainingSec) || 0;

  // "Do konce zbývá"
  safeText("#remainingTime", formatHMS(remaining));
  safeText("#endsAt", endsAt ? `Konec: ${formatTime(endsAt)}` : "Konec: —");

  // "Jak dlouho streamuju"
  if (startedAt) {
    const now = Date.now();
    const effectiveNow = paused && pausedAt ? pausedAt : now;
    const streamedSec = Math.max(0, Math.floor((effectiveNow - startedAt) / 1000));
    safeText("#streamingTime", formatHMS(streamedSec));
    safeText("#startedAt", `Start: ${formatTime(startedAt)}`);
  } else {
    safeText("#streamingTime", "--:--:--");
    safeText("#startedAt", "Start: —");
  }

  // Progress času (podle start/end)
  if (startedAt && endsAt && endsAt > startedAt) {
    const now = Date.now();
    const effectiveNow = paused && pausedAt ? pausedAt : now;
    const total = endsAt - startedAt;
    const elapsed = clamp01((effectiveNow - startedAt) / total);
    const percent = Math.round(elapsed * 100);

    safeText("#timeProgressPct", `${percent}%`);
    const bar = $("#timeProgressBar");
    if (bar) bar.style.width = `${percent}%`;
  }

  // Money
  const money = Number(state?.money) || 0;
  safeText("#moneyBig", `${formatKc(money)} Kč`);
  safeText("#moneySmall", `${formatKc(money)} / ${formatKc(GOAL_TOTAL)} Kč`);

  // Money progress bar
  const mPct = Math.round(clamp01(money / GOAL_TOTAL) * 100);
  safeText("#moneyPct", `${mPct}%`);
  const mbar = $("#moneyProgressBar");
  if (mbar) mbar.style.width = `${mPct}%`;

  // Subs
  const t1 = Number(state?.t1) || 0;
  const t2 = Number(state?.t2) || 0;
  const t3 = Number(state?.t3) || 0;
  const subsTotal = Number(state?.subsTotal) || (t1 + t2 + t3);

  safeText("#subsTotal", String(subsTotal));
  safeText("#subsBreakdown", `${t1} / ${t2} / ${t3}`);

  // Lists
  renderGoals(money);
  renderTopDonors(state?.topDonors || []);
  renderEvents(state?.lastEvents || []);

  // Optional: status badge
  const statusEl = $("#statusBadge");
  if (statusEl) {
    statusEl.textContent = paused ? "⏸️ Pauza" : "🔴 LIVE";
  }
}

// 9) Fetch loop
async function loadState() {
  try {
    const r = await fetch(API_STATE, { cache: "no-store" });
    if (!r.ok) throw new Error(`API error ${r.status}`);
    const data = await r.json();
    renderState(data);
  } catch (err) {
    console.error("[FUFATHON] loadState error:", err);
    // Fallback: do not crash UI
  }
}

function start() {
  loadState();
  setInterval(loadState, 3000);
}

document.addEventListener("DOMContentLoaded", start);
