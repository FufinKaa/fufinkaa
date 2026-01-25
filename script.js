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
function formatHMS(sec) {
  sec = Math.max(0, Math.floor(sec || 0));
  const hh = Math.floor(sec / 3600);
  const mm = Math.floor((sec % 3600) / 60);
  const ss = sec % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
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

let latest = null;

async function fetchState() {
  const r = await fetch(API_STATE, { cache: "no-store" });
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
}

function renderAll(data) {
  latest = data;

  // --- LIVE duration
  const liveEl = $("timeLiveHMS");
  if (liveEl) liveEl.textContent = formatHMS(data.liveDurationSec);

  const startEl = $("startTime");
  if (startEl) startEl.textContent = `Start: ${new Date(data.startedAt).toLocaleString("cs-CZ")}`;

  // --- Status
  const statusEl = $("timeLeftHMS"); // použijeme existující “pravý box” (dřív byl countdown)
  const endEl = $("endTime");
  if (statusEl) statusEl.textContent = data.paused ? "PAUZA" : "BĚŽÍ";
  if (endEl) endEl.textContent = data.paused ? "⏸️ Pozastaveno" : "—";

  // --- Money
  const money = Number(data.money || 0);
  const moneyEl = $("money");
  if (moneyEl) moneyEl.textContent = `${money.toLocaleString("cs-CZ")} Kč`;

  const pct = Math.min(100, Math.round((money / MONEY_GOAL) * 100));
  const barEl = $("moneyProgress");
  const textEl = $("moneyProgressText");
  if (barEl) barEl.style.width = `${pct}%`;
  if (textEl) textEl.textContent = `${money.toLocaleString("cs-CZ")} / ${MONEY_GOAL.toLocaleString("cs-CZ")} Kč`;

  // --- Goals
  const summaryEl = $("goalsSummary");
  const progEl = $("goalsProgress");
  const listEl = $("goalsList");

  if (summaryEl) summaryEl.textContent = `${money.toLocaleString("cs-CZ")} / ${MONEY_GOAL.toLocaleString("cs-CZ")} Kč`;
  if (progEl) progEl.style.width = `${pct}%`;

  if (listEl) {
    const next = GOALS.find((g) => money < g.amount);
    listEl.innerHTML = GOALS.map((g) => {
      const reached = money >= g.amount;
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

  // --- Top 5 donors
  const body = $("supportersBody");
  const donors = Array.isArray(data.topDonors) ? data.topDonors : [];
  if (body) {
    if (!donors.length) {
      body.innerHTML = `
        <tr>
          <td colspan="4" class="muted">Zatím nikdo… první top podporovatel budeš ty? 💗</td>
        </tr>`;
    } else {
      body.innerHTML = donors.map((s, i) => {
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
  }

  // --- Events (last 10)
  const evEl = $("events");
  const evs = Array.isArray(data.lastEvents) ? data.lastEvents : [];
  if (evEl) {
    if (!evs.length) {
      evEl.innerHTML = `<li>💗✨ FUFATHON je LIVE – čekám na první sub/donate 💜</li>`;
    } else {
      evEl.innerHTML = evs.map((ev) => {
        const t = new Date(ev.ts).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
        return `<li><span class="muted">[${t}]</span> ${escapeHtml(ev.text)}</li>`;
      }).join("");
    }
  }
}

async function tick() {
  try {
    const data = await fetchState();
    renderAll(data);
  } catch (e) {
    console.log("[FUFATHON] API error:", e);
  }
}

(function init() {
  // první render hned
  tick();
  // refresh každé 2s (rychlé, ale bezpečné)
  setInterval(tick, 2000);
})();
