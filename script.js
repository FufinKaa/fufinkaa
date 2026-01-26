// ============================
// FUFATHON Dashboard script.js
// ============================

const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";
const GOAL_TOTAL = 200000;

const GOALS = [
  { amount: 5000, title: "Movie night" },
  { amount: 10000, title: "Q&A bez cenzury" },
  { amount: 15000, title: "Horror Night" },
  { amount: 20000, title: "Jídlo podle chatu" },
  { amount: 25000, title: "Kostým stream" },
  { amount: 30000, title: "Just Dance" },
  { amount: 35000, title: "Lego" },
  { amount: 40000, title: "Asijská ochutnávka" },
  { amount: 45000, title: "Minecraft SpeedRun DUO" },
  { amount: 50000, title: "Karaoke stream" },
  { amount: 55000, title: "Battle Royale Challenge" },
  { amount: 60000, title: "Bowling" },
  { amount: 65000, title: "Try Not To Laugh" },
  { amount: 70000, title: "Běžecký pás" },
  { amount: 75000, title: "Drunk Stream" },
  { amount: 80000, title: "12h Stream ve stoje" },
  { amount: 85000, title: "Split Fiction w/ Juraj" },
  { amount: 90000, title: "Mystery box opening" },
  { amount: 95000, title: "Turnaj v LoLku" },
  { amount: 100000, title: "Stodolní ve stylu" },
  { amount: 110000, title: "Motokáry" },
  { amount: 120000, title: "ASMR stream" },
  { amount: 125000, title: "Bolt Tower" },
  { amount: 130000, title: "Otužování" },
  { amount: 140000, title: "MiniGolf" },
  { amount: 150000, title: "Vířivka" },
  { amount: 160000, title: "Zážitkové ART studio" },
  { amount: 170000, title: "Jízda na koni" },
  { amount: 180000, title: "Výšlap na Lysou horu" },
  { amount: 190000, title: "Tetování" },
  { amount: 200000, title: "Víkend v Praze" },
];

// ----------------------------
// Helpers
// ----------------------------
const $ = (sel) => document.querySelector(sel);

function safeText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
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

function formatDateTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
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

function goalEmoji(title) {
  const t = (title || "").toLowerCase();
  if (t.includes("movie")) return "🎬";
  if (t.includes("q&a")) return "😏";
  if (t.includes("horror")) return "👻";
  if (t.includes("jídlo") || t.includes("jidlo")) return "🍕";
  if (t.includes("kostým") || t.includes("kostym")) return "🤡";
  if (t.includes("dance")) return "💃";
  if (t.includes("lego")) return "🧱";
  if (t.includes("asij")) return "🍣";
  if (t.includes("minecraft")) return "⛏️";
  if (t.includes("karaoke")) return "🎤";
  if (t.includes("battle")) return "🔫";
  if (t.includes("bowling")) return "🎳";
  if (t.includes("laugh")) return "💦";
  if (t.includes("běžeck") || t.includes("bezeck")) return "👣";
  if (t.includes("drunk")) return "🍹";
  if (t.includes("stoje")) return "🧍‍♀️";
  if (t.includes("split")) return "🕹️";
  if (t.includes("mystery")) return "🎁";
  if (t.includes("lol")) return "🏆";
  if (t.includes("stodol")) return "🎉";
  if (t.includes("motok")) return "🏎️";
  if (t.includes("asmr")) return "🎧";
  if (t.includes("tower")) return "⚡";
  if (t.includes("otu")) return "🥶";
  if (t.includes("golf")) return "⛳";
  if (t.includes("vířiv") || t.includes("viriv")) return "🫧";
  if (t.includes("art")) return "🎨";
  if (t.includes("koni")) return "🐎";
  if (t.includes("lysou")) return "🏔️";
  if (t.includes("tet")) return "🖊️";
  if (t.includes("praze")) return "🏙️";
  return "🎯";
}

// ----------------------------
// Theme toggle
// ----------------------------
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const icon = $("#themeIcon");
  const text = $("#themeText");
  if (icon) icon.textContent = theme === "light" ? "☀️" : "🌙";
  if (text) text.textContent = theme === "light" ? "Den" : "Noc";
}

function initTheme() {
  const saved = localStorage.getItem("fufathon_theme");
  const theme = saved === "light" ? "light" : "dark";
  applyTheme(theme);

  const btn = $("#themeBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem("fufathon_theme", next);
      applyTheme(next);
    });
  }
}

// ----------------------------
// Renderers
// ----------------------------
function renderGoals(money) {
  const list = $("#goalList");
  if (!list) return;

  const m = Number(money) || 0;

  list.innerHTML = GOALS.map((g) => {
    const done = m >= g.amount;
    return `
      <div class="goalItem ${done ? "done" : ""}">
        <div class="goalCheck">${done ? "✅" : "⬜"}</div>
        <div>
          <div class="goalTitle">${goalEmoji(g.title)} ${g.title}</div>
        </div>
        <div class="goalKc">${formatKc(g.amount)} Kč</div>
      </div>
    `;
  }).join("");
}

function renderTopDonors(topDonors) {
  const wrap = $("#topTable");
  if (!wrap) return;

  const rows = (topDonors || []).slice(0, 5).map((d, idx) => {
    const user = String(d?.user || "Anonym");
    const totalKc = Number(d?.totalKc || 0);
    const addedSec = Number(d?.addedSec || 0);
    const addedMin = Math.round(addedSec / 60);
    return `
      <div class="topRow">
        <div class="badge">${idx + 1}</div>
        <div class="topName">${user}</div>
        <div class="topKc">${formatKc(totalKc)} Kč</div>
        <div class="topTime">+${addedMin} min</div>
      </div>
    `;
  }).join("");

  wrap.innerHTML = rows || `<div class="empty">Zatím nikdo… 💜</div>`;
}

function renderFeed(events) {
  const feed = $("#feed");
  if (!feed) return;

  const items = (events || []).slice(0, 10).map((e) => {
    const ts = Number(e?.ts) || null;
    const time = ts
      ? new Date(ts).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })
      : "--:--";
    const text = String(e?.text || "").trim();
    return `
      <div class="feedItem">
        <div class="feedTime">[${time}]</div>
        <div class="feedText">${text}</div>
      </div>
    `;
  }).join("");

  feed.innerHTML = items || `<div class="empty">Zatím žádné akce… 💜</div>`;
}

// ----------------------------
// Main render
// ----------------------------
function renderState(state) {
  const startedAt = Number(state?.startedAt) || null;
  const endsAt = Number(state?.endsAt) || null;
  const paused = !!state?.paused;
  const pausedAt = state?.pausedAt ? Number(state.pausedAt) : null;

  // Remaining is already pause-safe from Worker
  const remaining = Number(state?.timeRemainingSec) || 0;
  safeText("timeLeft", formatHMS(remaining));
  safeText("endsAtText", endsAt ? `Konec: ${formatDateTime(endsAt)}` : "Konec: —");

  // Running time (pause-safe)
  if (startedAt) {
    const now = Date.now();
    const effectiveNow = paused && pausedAt ? pausedAt : now;
    const streamedSec = Math.max(0, Math.floor((effectiveNow - startedAt) / 1000));
    safeText("timeRunning", formatHMS(streamedSec));
    safeText("startedAtText", `Start: ${formatDateTime(startedAt)}`);
  } else {
    safeText("timeRunning", "--:--:--");
    safeText("startedAtText", "Start: —");
  }

  // Time progress
  if (startedAt && endsAt && endsAt > startedAt) {
    const now = Date.now();
    const effectiveNow = paused && pausedAt ? pausedAt : now;
    const totalMs = endsAt - startedAt;
    const elapsed = clamp01((effectiveNow - startedAt) / totalMs);
    const pct = Math.round(elapsed * 100);
    safeText("timePct", `${pct}%`);
    const fill = $("#timeProgress");
    if (fill) fill.style.width = `${pct}%`;
  } else {
    safeText("timePct", "0%");
    const fill = $("#timeProgress");
    if (fill) fill.style.width = `0%`;
  }

  // Money
  const money = Number(state?.money) || 0;
  safeText("money", `${formatKc(money)} Kč`);
  safeText("moneySmall", `${formatKc(money)} / ${formatKc(GOAL_TOTAL)} Kč`);
  const mPct = Math.round(clamp01(money / GOAL_TOTAL) * 100);
  const mFill = $("#moneyProgress");
  if (mFill) mFill.style.width = `${mPct}%`;

  // Goal header + goal bar
  safeText("goalHeader", `${formatKc(money)} / ${formatKc(GOAL_TOTAL)} Kč`);
  const gPct = Math.round(clamp01(money / GOAL_TOTAL) * 100);
  const gFill = $("#goalBar");
  if (gFill) gFill.style.width = `${gPct}%`;

  // Subs
  const t1 = Number(state?.t1) || 0;
  const t2 = Number(state?.t2) || 0;
  const t3 = Number(state?.t3) || 0;
  const subsTotal = Number(state?.subsTotal) || (t1 + t2 + t3);
  safeText("subsTotal", String(subsTotal));
  safeText("subsBreak", `${t1} / ${t2} / ${t3}`);

  // Lists
  renderGoals(money);
  renderTopDonors(state?.topDonors || []);
  renderFeed(state?.lastEvents || []);
}

// ----------------------------
// Fetch loop
// ----------------------------
async function loadState() {
  try {
    const r = await fetch(API_STATE, { cache: "no-store" });
    if (!r.ok) throw new Error(`API error ${r.status}`);
    const data = await r.json();
    renderState(data);
  } catch (err) {
    console.error("[FUFATHON] loadState error:", err);
  }
}

function start() {
  initTheme();
  loadState();
  setInterval(loadState, 3000);
}

document.addEventListener("DOMContentLoaded", start);
