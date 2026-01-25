/* =========================================================
   FUFATHON Dashboard – script.js (API-driven)
   - “Jak dlouho už streamuji” (startedAt)
   - Money + Goals auto-check
   - Top 5 supporters (donations only)
   - Last 10 actions (from Worker)
   ========================================================= */

const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";
const MONEY_GOAL = 200000;

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
  { amount: 200000, label: "Víkend v Praze 🏙️" },
];

const $ = (id) => document.getElementById(id);

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
function formatMoney(kc) {
  return `${Number(kc || 0).toLocaleString("cs-CZ")} Kč`;
}
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (s) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[s]));
}

let lastState = null;

async function fetchState() {
  const r = await fetch(API_STATE, { cache: "no-store" });
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
}

function renderDuration(startedAt) {
  // “Už streamuju”
  const now = Date.now();
  const liveMs = now - Number(startedAt || now);
  if ($("timeLiveHMS")) $("timeLiveHMS").textContent = formatHMS(liveMs);
  if ($("startTime")) $("startTime").textContent = `Start: ${new Date(Number(startedAt || now)).toLocaleString("cs-CZ")}`;

  // pokud máš v HTML “stav času” box, tak ho nastavíme na “BĚŽÍ”
  if ($("timeLeftHMS")) $("timeLeftHMS").textContent = "—";
  if ($("endTime")) $("endTime").textContent = "—";
}

function renderMoneyAndGoals(money) {
  const m = Number(money || 0);

  if ($("money")) $("money").textContent = formatMoney(m);

  const pct = Math.min(100, Math.round((m / MONEY_GOAL) * 100));
  if ($("moneyProgress")) $("moneyProgress").style.width = `${pct}%`;
  if ($("moneyProgressText")) $("moneyProgressText").textContent = `${m.toLocaleString("cs-CZ")} / ${MONEY_GOAL.toLocaleString("cs-CZ")} Kč`;

  if ($("goalsSummary")) $("goalsSummary").textContent = `${m.toLocaleString("cs-CZ")} / ${MONEY_GOAL.toLocaleString("cs-CZ")} Kč`;
  if ($("goalsProgress")) $("goalsProgress").style.width = `${pct}%`;

  const listEl = $("goalsList");
  if (!listEl) return;

  const next = GOALS.find((g) => m < g.amount);
  listEl.innerHTML = GOALS.map((g) => {
    const reached = m >= g.amount;
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

function renderTopDonors(topDonors) {
  const body = $("supportersBody");
  if (!body) return;

  const arr = Array.isArray(topDonors) ? topDonors : [];
  if (!arr.length) {
    body.innerHTML = `
      <tr>
        <td colspan="4" class="muted">Zatím nikdo… první top podporovatel budeš ty? 💗</td>
      </tr>`;
    return;
  }

  body.innerHTML = arr.map((s, i) => {
    const addedMin = Math.round((Number(s.addedSec || 0)) / 60);
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(s.user)}</td>
        <td>${Number(s.totalKc || 0).toLocaleString("cs-CZ")} Kč</td>
        <td>+${addedMin.toLocaleString("cs-CZ")} min</td>
      </tr>
    `;
  }).join("");
}

function renderEvents(lastEvents) {
  const el = $("events");
  if (!el) return;

  const arr = Array.isArray(lastEvents) ? lastEvents : [];
  if (!arr.length) {
    el.innerHTML = `<li>💗✨ FUFATHON je LIVE – čekám na první sub/donate 💜</li>`;
    return;
  }

  // Worker posílá už hotový text (hezké věty)
  el.innerHTML = arr.map((ev) => {
    const t = new Date(ev.ts).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
    return `<li><span class="muted">[${t}]</span> ${escapeHtml(ev.text)}</li>`;
  }).join("");
}

async function tick() {
  try {
    const s = await fetchState();
    lastState = s;

    renderDuration(s.startedAt);
    renderMoneyAndGoals(s.money);
    renderTopDonors(s.topDonors);
    renderEvents(s.lastEvents);
  } catch (e) {
    // když API spadne, necháme poslední známý stav a jen dál běží čas
    if (lastState?.startedAt) renderDuration(lastState.startedAt);
    console.log("[FUFATHON] API error:", e);
  }
}

(function init() {
  // Pokud máš theme toggle, nech ho jak máš v HTML (neměním)
  // Jen spustíme pravidelný refresh
  tick();
  setInterval(tick, 2000);
  setInterval(() => {
    if (lastState?.startedAt) renderDuration(lastState.startedAt);
  }, 250);
})();
