// ============================
// FUFATHON Dashboard script.js
// ============================

const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";
const GOAL_TOTAL = 200000;

// pravidla subů (musí sedět s workerem)
const SUB_MINUTES = { 1: 10, 2: 20, 3: 30 };

// Goaly – cute, bez dlouhých textů
const GOALS = [
  { amount: 5000,  icon:"🎬", title:"Movie night" },
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

// ============================
// STREAMELEMENTS KONFIGURACE
// ============================
// ZDE VLOŽ SVŮJ JWT TOKEN Z: StreamElements > Settings > API tokens
const SE_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaXRhZGVsIiwiZXhwIjoxNzg1MTg5NzQ3LCJqdGkiOiJlMjU4YWRjNy04NmViLTQ1NjAtODBmZS1kMTUwOGU2ODk5NTciLCJjaGFubmVsIjoiNWJhN2M4NTY2NzE2NmQ5MTUwYjQwNmZlIiwicm9sZSI6Im93bmVyIiwiYXV0aFRva2VuIjoiYU9PQ0E1UmR3V2M2OTZ0WVJzUU1pQjRjNzZ2ZUdBUFdxN0hsYXJLczhxSHZIb2xJIiwidXNlciI6IjViYTdjODU2NjcxNjZkM2U5OGI0MDZmZCIsInVzZXJfaWQiOiIyOGE3MTNkZS00ZDAzLTQxYzQtOTliMi1hMWQ0NDY0NmY0NDkiLCJ1c2VyX3JvbGUiOiJjcmVhdG9yIiwicHJvdmlkZXIiOiJ0d2l0Y2giLCJwcm92aWRlcl9pZCI6IjI1MzExNjI5MSIsImNoYW5uZWxfaWQiOiI1NGQwNzRjYi1hODQ0LTRmMDctOWZhNC02NWVlNDRmNjJiZGUiLCJjcmVhdG9yX2lkIjoiZDU5MGJmYzMtNDgwYS00MTc0LWEyOWUtZWRlOTI1MjI3N2YyIn0.6m8xyFNGWKwywrT8iDko7C9u2GwLT-tsagsbQlirc_0';
let seSocket = null;
let realtimeEvents = []; // Udržuje si vlastní seznam událostí pro feed

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
// Theme toggle
// --------------------
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const isLight = theme === "light";
  setText("#themeIcon", isLight ? "☀️" : "🌙");
  setText("#themeText", isLight ? "Den" : "Noc");
}
function initTheme() {
  const saved = localStorage.getItem("fuf_theme");
  applyTheme(saved || "dark");
  $("#themeBtn")?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("fuf_theme", next);
    applyTheme(next);
  });
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
  const tbody = $("#topTableBody");
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
    <tr><td colspan="4" class="mutedCell">Zatím nikdo… 💜</td></tr>
  `;
}

// --------------------
// Feed (agregace giftů) - UPRAVENO PRO REALTIME
// --------------------
function normalizeEvent(e) {
  // podporuje i legacy {text}
  return {
    ts: e?.ts ?? Date.now(),
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
  const t = ev.tier ? Number(ev.tier) : 1;
  const mins = SUB_MINUTES[t] || 10;

  // pokud worker poslal hotový text, použijeme ho (legacy / system)
  if (ev.text && (!ev.kind || ev.kind === "system")) return ev.text;

  if (ev.kind === "donation") {
    return ev.text || `💰 Donate ${formatKc(ev.amountKc || 0)} Kč 💜`;
  }

  if (ev.kind === "sub") {
    const who = ev.sender || "Anonym";
    return `⭐ ${who} si pořídil sub (T${t}) (+${mins} min) 💗`;
  }

  if (ev.kind === "resub") {
    const who = ev.sender || "Anonym";
    const m = ev.months ? ` (${ev.months} měs.)` : "";
    return `🔁 ${who} resub${m} (T${t}) (+${mins} min) 💗`;
  }

  if (ev.kind === "gift") {
    const who = ev.sender || "Anonym";
    const c = Number(ev.count || 1);
    return `🎁 ${who} daroval ${c}× sub (T${t}) (+${c * mins} min) 💗`;
  }

  return ev.text || "—";
}

function renderFeed(eventsRaw) {
  const feed = $("#feed");
  if (!feed) return;

  const events = (eventsRaw || []).map(normalizeEvent);
  const out = [];
  const limit = 10;

  // Agregace: po sobě jdoucí gift recipienty od stejného sender+tier v krátkém okně
  for (let i = 0; i < events.length && out.length < limit; i++) {
    const e = events[i];

    if (e.kind === "gift" && e.sender) {
      const sender = e.sender;
      const tier = Number(e.tier || 1);
      let count = Number(e.count || 1);

      const baseTs = Number(e.ts || 0);
      let j = i + 1;

      while (j < events.length) {
        const x = events[j];
        const xTs = Number(x.ts || 0);

        const same =
          x.kind === "gift" &&
          String(x.sender || "").toLowerCase() === String(sender).toLowerCase() &&
          Number(x.tier || 1) === tier;

        const inWindow = Math.abs((xTs || baseTs) - baseTs) <= 60000;

        if (!same || !inWindow) break;

        count += Number(x.count || 1);
        j++;
      }

      const time = e.ts
        ? new Date(e.ts).toLocaleTimeString("cs-CZ", { hour:"2-digit", minute:"2-digit" })
        : "--:--";

      // Pokud worker poslal už purchase s count>1, tady se to hezky vykreslí rovnou.
      out.push({ time, text: eventLine({ ...e, count }) });
      i = j - 1;
      continue;
    }

    const time = e.ts
      ? new Date(e.ts).toLocaleTimeString("cs-CZ", { hour:"2-digit", minute:"2-digit" })
      : "--:--";

    out.push({ time, text: eventLine(e) });
  }

  feed.innerHTML = out.length
    ? out.map((r) =>
        `<div class="feedRow">
          <span class="feedTime">[${r.time}]</span>
          <span class="feedText">${r.text}</span>
        </div>`
      ).join("")
    : `<div class="muted">Zatím nic… 💜</div>`;
}

// --------------------
// STREAMELEMENTS REALTIME FUNKCE
// --------------------
function connectStreamElements() {
  if (!SE_JWT_TOKEN || SE_JWT_TOKEN === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaXRhZGVsIiwiZXhwIjoxNzg1MTg5NzQ3LCJqdGkiOiJlMjU4YWRjNy04NmViLTQ1NjAtODBmZS1kMTUwOGU2ODk5NTciLCJjaGFubmVsIjoiNWJhN2M4NTY2NzE2NmQ5MTUwYjQwNmZlIiwicm9sZSI6Im93bmVyIiwiYXV0aFRva2VuIjoiYU9PQ0E1UmR3V2M2OTZ0WVJzUU1pQjRjNzZ2ZUdBUFdxN0hsYXJLczhxSHZIb2xJIiwidXNlciI6IjViYTdjODU2NjcxNjZkM2U5OGI0MDZmZCIsInVzZXJfaWQiOiIyOGE3MTNkZS00ZDAzLTQxYzQtOTliMi1hMWQ0NDY0NmY0NDkiLCJ1c2VyX3JvbGUiOiJjcmVhdG9yIiwicHJvdmlkZXIiOiJ0d2l0Y2giLCJwcm92aWRlcl9pZCI6IjI1MzExNjI5MSIsImNoYW5uZWxfaWQiOiI1NGQwNzRjYi1hODQ0LTRmMDctOWZhNC02NWVlNDRmNjJiZGUiLCJjcmVhdG9yX2lkIjoiZDU5MGJmYzMtNDgwYS00MTc0LWEyOWUtZWRlOTI1MjI3N2YyIn0.6m8xyFNGWKwywrT8iDko7C9u2GwLT-tsagsbQlirc_0') {
    console.log('⚠️ StreamElements: JWT token není nastaven. Realtime feed nebude fungovat.');
    return;
  }

  if (!window.io) {
    console.error('❌ Socket.io knihovna není načtena!');
    return;
  }

  console.log('🔄 StreamElements: Připojuji se...');
  seSocket = io('https://realtime.streamelements.com', {
    transports: ['websocket']
  });

  seSocket.on('connect', () => {
    console.log('✅ StreamElements: Připojeno!');
    seSocket.emit('authenticate', {
      method: 'jwt',
      token: SE_JWT_TOKEN
    });
  });

  seSocket.on('event', (data) => {
    console.log('🎬 StreamElements event:', data.listener);
    handleStreamEvent(data);
  });

  seSocket.on('error', (err) => {
    console.error('❌ StreamElements error:', err);
  });

  seSocket.on('disconnect', () => {
    console.log('⚠️ StreamElements: Odpojeno.');
  });
}

function handleStreamEvent(data) {
  const listener = data.listener;
  const event = data.event;
  
  let newEvent = {
    ts: Date.now(),
    kind: 'system',
    text: ''
  };

  switch (listener) {
    case 'subscriber':
      const tierMap = { 1000: 1, 2000: 2, 3000: 3 };
      const tier = tierMap[event.tier] || 1;
      newEvent.kind = event.resub ? 'resub' : 'sub';
      newEvent.sender = event.displayName || event.username;
      newEvent.tier = tier;
      newEvent.months = event.cumulativeMonths;
      newEvent.text = `${event.resub ? '🔁 Resub' : '⭐ Nový sub'} (T${tier}) od ${newEvent.sender} 💗`;
      break;

    case 'tip':
      newEvent.kind = 'donation';
      newEvent.sender = event.displayName || event.username;
      newEvent.amountKc = event.amount;
      newEvent.text = `💰 Donate ${event.amount} Kč od ${newEvent.sender} 💜`;
      break;

    case 'subscriber-gift':
      newEvent.kind = 'gift';
      newEvent.sender = event.displayName || event.username;
      newEvent.count = event.gifted || event.amount || 1;
      newEvent.tier = 1;
      newEvent.text = `🎁 ${newEvent.sender} daroval ${newEvent.count}× sub 💗`;
      break;

    case 'cheer':
      newEvent.kind = 'cheer';
      newEvent.sender = event.displayName || event.username;
      newEvent.amountKc = event.amount;
      newEvent.text = `👏 ${event.amount} bits od ${newEvent.sender} ✨`;
      break;

    case 'follower':
      newEvent.text = `🆕 ${event.displayName || event.username} začal/a sledovat!`;
      break;

    default:
      console.log('Další StreamElements událost:', listener);
      return;
  }

  // Přidáme událost do realtimeEvents (max 50)
  realtimeEvents.unshift(newEvent);
  if (realtimeEvents.length > 50) realtimeEvents.length = 50;

  // Okamžitě aktualizujeme feed kombinací API dat a realtime událostí
  updateCombinedFeed();
}

function updateCombinedFeed() {
  // Zkombinujeme poslední události z API a realtime události
  // Pro zobrazení použijeme hlavně realtimeEvents, ale zachováme strukturu
  renderFeed(realtimeEvents.slice(0, 10));
}

// --------------------
// Main render
// --------------------
function render(state) {
  const startedAt = Number(state?.startedAt) || null;
  const endsAt = Number(state?.endsAt) || null;

  const paused = !!state?.paused;
  const pausedAt = state?.pausedAt ? Number(state.pausedAt) : null;

  // do konce (server počítá)
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
  renderTop(state?.topDonors || []);

  // Přidáme události z API do realtimeEvents pro úplnost
  const apiEvents = state?.lastEvents || state?.events || [];
  if (apiEvents.length > 0 && realtimeEvents.length === 0) {
    realtimeEvents = apiEvents.map(normalizeEvent);
  }
  updateCombinedFeed();
}

// --------------------
// Fetch loop
// --------------------
async function loadState() {
  try {
    const r = await fetch(API_STATE, { cache: "no-store" });
    if (!r.ok) throw new Error(`API error ${r.status}`);
    const data = await r.json();
    render(data);
  } catch (err) {
    console.error('Chyba při načítání stavu:', err);
  }
}

// --------------------
// Start aplikace
// --------------------
function start() {
  initTheme();
  loadState().catch(console.error);
  setInterval(() => loadState().catch(console.error), 3000);
  
  // Spojení se StreamElements
  connectStreamElements();
}

document.addEventListener("DOMContentLoaded", start);

// --------------------
// Twitch Embed pomocné funkce
// --------------------
function checkTwitchStatus() {
    const streamIframe = document.querySelector('.twitch-stream iframe');
    const chatIframe = document.querySelector('.twitch-chat iframe');
    const streamContainer = document.querySelector('.twitch-stream');
    
    if (!streamIframe || !chatIframe) return;
    
    // Pravidelně kontrolujeme, zda iframy fungují
    const streamSrc = streamIframe.src;
    const chatSrc = chatIframe.src;
    
    // Pokud se iframy nenačetly správně, zkusíme je znovu načíst
    setTimeout(() => {
        try {
            const streamDoc = streamIframe.contentDocument || streamIframe.contentWindow.document;
            if (streamDoc && streamDoc.body && streamDoc.body.innerHTML.includes('offline')) {
                streamContainer.classList.add('offline');
            } else {
                streamContainer.classList.remove('offline');
            }
        } catch (e) {
            // Cross-origin error - ignorujeme
        }
    }, 3000);
}

// Přidáme kontrolu po načtení stránky
window.addEventListener('load', () => {
    setTimeout(checkTwitchStatus, 2000);
    setInterval(checkTwitchStatus, 15000);
});
