// ============================
// FUFATHON Dashboard script.js
// ============================

const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";
const GOAL_TOTAL = 200000;

// tvoje pravidla (musí sedět s workerem)
const SUB_MINUTES = { 1: 10, 2: 20, 3: 30 };

// Goals – bez dlouhých textů (jen cute název + emoji)
const GOALS = [
  { amount: 5000, icon:"🎬", title:"Movie night" },
  { amount: 10000, icon:"😏", title:"Q&A bez cenzury" },
  { amount: 15000, icon:"👻", title:"Horror Night" },
  { amount: 20000, icon:"🍔", title:"Jídlo podle chatu" },
  { amount: 25000, icon:"🤡", title:"Kostým stream" },
  { amount: 30000, icon:"💃", title:"Just Dance" },
  { amount: 35000, icon:"🧱", title:"Lego" },
  { amount: 40000, icon:"🍣", title:"Asijská ochutnávka" },
  { amount: 45000, icon:"⛏️", title:"Minecraft SpeedRun DUO" },
  { amount: 50000, icon:"🎤", title:"Karaoke stream" },
  { amount: 55000, icon:"🔫", title:"Battle Royale Challenge" },
  { amount: 60000, icon:"🎳", title:"Bowling" },
  { amount: 65000, icon:"💦", title:"Try Not To Laugh" },
  { amount: 70000, icon:"👣", title:"Běžecký pás" },
  { amount: 75000, icon:"🍹", title:"Drunk Stream" },
  { amount: 80000, icon:"🧍‍♀️", title:"12h Stream ve stoje" },
  { amount: 85000, icon:"🕹️", title:"Split Fiction w/ Juraj" },
  { amount: 90000, icon:"🎁", title:"Mystery box opening" },
  { amount: 95000, icon:"🏆", title:"Turnaj v LoLku" },
  { amount: 100000, icon:"🎉", title:"Stodolní ve stylu" },
  { amount: 110000, icon:"🏎️", title:"Motokáry" },
  { amount: 120000, icon:"🎧", title:"ASMR stream" },
  { amount: 125000, icon:"⚡", title:"Bolt Tower" },
  { amount: 130000, icon:"🥶", title:"Otužování" },
  { amount: 140000, icon:"⛳", title:"MiniGolf" },
  { amount: 150000, icon:"🫧", title:"Vířivka" },
  { amount: 160000, icon:"🎨", title:"Zážitkové ART studio" },
  { amount: 170000, icon:"🐎", title:"Jízda na koni" },
  { amount: 180000, icon:"🏔️", title:"Výšlap na Lysou horu" },
  { amount: 190000, icon:"🖊️", title:"Tetování" },
  { amount: 200000, icon:"🏙️", title:"Víkend v Praze" },
];

const $ = (sel) => document.querySelector(sel);

function formatKc(n) {
  const num = Number(n) || 0;
  return num.toLocaleString("cs-CZ");
}

function pad2(n) { return String(n).padStart(2, "0"); }

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
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function clamp01(x) { return Math.max(0, Math.min(1, x)); }

function setText(id, val) {
  const el = $(id);
  if (el) el.textContent = val;
}

function setWidth(id, pct) {
  const el = $(id);
  if (el) el.style.width = `${pct}%`;
}

// --------------------
// Goals
// --------------------
function renderGoals(money) {
  const m = Number(money) || 0;

  setText("#goalHeader", `${formatKc(m)} / ${formatKc(GOAL_TOTAL)} Kč`);
  const gpct = Math.round(clamp01(m / GOAL_TOTAL) * 100);
  setWidth("#goalBar", gpct);

  const list = $("#goalList");
  if (!list) return;

  list.innerHTML = GOALS.map((g) => {
    const done = m >= g.amount;
    return `
      <div class="goalRow ${done ? "done" : ""}">
        <div class="goalLeft">
          <span class="goalCheck">${done ? "✅" : "⬜"}</span>
          <span class="goalIcon">${g.icon || "🎯"}</span>
          <span class="goalTitle">${g.title}</span>
        </div>
        <div class="goalAmt">${formatKc(g.amount)} Kč</div>
      </div>
    `;
  }).join("");
}

// --------------------
// Top donors
// --------------------
function renderTop(donors) {
  const box = $("#topTable");
  if (!box) return;

  const rows = (donors || []).slice(0, 5).map((d, i) => {
    const user = String(d?.user || "Anonym");
    const totalKc = Number(d?.totalKc || 0);
    const addedSec = Number(d?.addedSec || 0);
    const addedMin = Math.round(addedSec / 60);

    return `
      <div class="tr">
        <div class="td rank">${i + 1}</div>
        <div class="td name">${user}</div>
        <div class="td kc">${formatKc(totalKc)} Kč</div>
        <div class="td time">+${addedMin} min</div>
      </div>
    `;
  }).join("");

  box.innerHTML = `
    <div class="thead">
      <div class="th rank">#</div>
      <div class="th name">Jméno</div>
      <div class="th kc">Kč celkem</div>
      <div class="th time">Přidaný čas</div>
    </div>
    ${rows || `<div class="muted">Zatím nikdo… 💜</div>`}
  `;
}

// --------------------
// Feed (agregace giftů)
// --------------------
function normalizeEvent(e) {
  // podporuje i legacy {text}
  return {
    ts: e?.ts ?? null,
    kind: e?.kind ?? null,
    tier: e?.tier ?? null,
    months: e?.months ?? null,
    count: e?.count ?? 1,
    sender: e?.sender ?? null,
    recipient: e?.recipient ?? null,
    amountKc: e?.amountKc ?? null,
    text: e?.text ?? "",
  };
}

function eventLine(ev) {
  const t = ev.tier ? Number(ev.tier) : null;
  const mins = t ? (SUB_MINUTES[t] || 10) : 0;

  if (ev.kind === "donation") {
    // když worker posílá text, necháme ho
    return ev.text || `💰 Donate ${formatKc(ev.amountKc || 0)} Kč 💜`;
  }

  if (ev.kind === "sub") {
    const who = ev.sender || "Anonym";
    return `⭐ ${who} si pořídil sub (T${t || 1}) (+${mins} min) 💗`;
  }

  if (ev.kind === "resub") {
    const who = ev.sender || "Anonym";
    const m = ev.months ? ` (${ev.months} měs.)` : "";
    return `🔁 ${who} resub${m} (T${t || 1}) (+${mins} min) 💗`;
  }

  if (ev.kind === "gift") {
    // sem se normálně nedostaneme (gift agregujeme), ale fallback:
    const who = ev.sender || "Anonym";
    return `🎁 ${who} daroval sub (T${t || 1}) (+${mins} min) 💗`;
  }

  return ev.text || "—";
}

function renderFeed(eventsRaw) {
  const feed = $("#feed");
  if (!feed) return;

  const events = (eventsRaw || []).map(normalizeEvent);

  const out = [];
  const nowLimit = 10;

  for (let i = 0; i < events.length && out.length < nowLimit; i++) {
    const e = events[i];

    // AGREGACE: po sobě jdoucí gift eventy od stejného sender + stejný tier v krátkém okně
    if (e.kind === "gift" && e.sender) {
      const sender = e.sender;
      const tier = Number(e.tier || 1);
      let count = 0;

      const baseTs = Number(e.ts || 0);
      let j = i;

      while (j < events.length) {
        const x = events[j];
        const xTs = Number(x.ts || 0);

        const same =
          x.kind === "gift" &&
          String(x.sender || "").toLowerCase() === String(sender).toLowerCase() &&
          Number(x.tier || 1) === tier;

        // okno 45s (aby SE stihlo poslat recipienty)
        const inWindow = Math.abs((xTs || baseTs) - baseTs) <= 45000;

        if (!same || !inWindow) break;
        count += Number(x.count || 1);
        j++;
      }

      const mins = SUB_MINUTES[tier] || 10;
      const time = e.ts ? new Date(e.ts).toLocaleTimeString("cs-CZ", { hour:"2-digit", minute:"2-digit" }) : "--:--";
      out.push({
        time,
        text: `🎁 ${sender} daroval ${count}× sub (T${tier}) (+${count * mins} min) 💗`,
      });

      i = j - 1;
      continue;
    }

    // normální event
    const time = e.ts ? new Date(e.ts).toLocaleTimeString("cs-CZ", { hour:"2-digit", minute:"2-digit" }) : "--:--";
    out.push({ time, text: eventLine(e) });
  }

  feed.innerHTML = out.length
    ? out.map((r) => `<div class="feedRow"><span class="feedTime">[${r.time}]</span><span class="feedText">${r.text}</span></div>`).join("")
    : `<div class="muted">Zatím nic… 💜</div>`;
}

// --------------------
// Main render
// --------------------
let lastState = null;

function render(state) {
  lastState = state;

  const startedAt = Number(state?.startedAt) || null;
  const endsAt = Number(state?.endsAt) || null;

  const paused = !!state?.paused;
  const pausedAt = state?.pausedAt ? Number(state.pausedAt) : null;

  // čas do konce (server už to počítá správně)
  const remaining = Number(state?.timeRemainingSec) || 0;
  setText("#timeLeft", formatHMS(remaining));
  setText("#endsAtText", endsAt ? `Konec: ${formatDateTime(endsAt)}` : "Konec: —");

  // jak dlouho streamuje
  if (startedAt) {
    const now = Date.now();
    const effectiveNow = paused && pausedAt ? pausedAt : now;
    const streamedSec = Math.max(0, Math.floor((effectiveNow - startedAt) / 1000));
    setText("#timeRunning", formatHMS(streamedSec));
    setText("#startedAtText", `Start: ${formatDateTime(startedAt)}`);
  } else {
    setText("#timeRunning", "--:--:--");
    setText("#startedAtText", "Start: —");
  }

  // progress času
  if (startedAt && endsAt && endsAt > startedAt) {
    const now = Date.now();
    const effectiveNow = paused && pausedAt ? pausedAt : now;
    const total = endsAt - startedAt;
    const elapsed = clamp01((effectiveNow - startedAt) / total);
    const pct = Math.round(elapsed * 100);
    setWidth("#timeProgress", pct);
    setText("#timePct", `${pct}%`);
  }

  // money
  const money = Number(state?.money) || 0;
  setText("#money", `${formatKc(money)} Kč`);
  setText("#moneySmall", `${formatKc(money)} / ${formatKc(GOAL_TOTAL)} Kč`);
  setWidth("#moneyProgress", Math.round(clamp01(money / GOAL_TOTAL) * 100));

  // subs
  const t1 = Number(state?.t1) || 0;
  const t2 = Number(state?.t2) || 0;
  const t3 = Number(state?.t3) || 0;
  const subsTotal = Number(state?.subsTotal) || (t1 + t2 + t3);
  setText("#subsTotal", String(subsTotal));
  setText("#subsBreak", `${t1} / ${t2} / ${t3}`);

  renderGoals(money);
  function renderTop(donors) {
  const tbody = document.querySelector("#topTableBody");
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

  tbody.innerHTML = rows || `
    <tr>
      <td colspan="4" class="mutedCell">Zatím nikdo… 💜</td>
    </tr>
  `;
}

  renderFeed(state?.lastEvents || state?.events || []);
}

// --------------------
// Fetch loop
// --------------------
async function loadState() {
  const r = await fetch(API_STATE, { cache: "no-store" });
  if (!r.ok) throw new Error(`API error ${r.status}`);
  const data = await r.json();
  render(data);
}

function start() {
  loadState().catch(console.error);
  setInterval(() => loadState().catch(console.error), 3000);
}

document.addEventListener("DOMContentLoaded", start);
