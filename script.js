const STATE_URL = "https://fufathon-api.pajujka191.workers.dev/api/state";

const GOAL_TOTAL = 200000;

const GOALS = [
  { amount: 5000,  title: "Movie night 🎬", sub: "další na řadě ✨" },
  { amount: 10000, title: "Q&A bez cenzury 😈", sub: "čeká…" },
  { amount: 15000, title: "Horror Night 😱", sub: "čeká…" },
  { amount: 20000, title: "Jídlo podle chatu 🍽️", sub: "čeká…" },
  { amount: 25000, title: "Kostým stream 👗", sub: "čeká…" },
  { amount: 30000, title: "Just Dance 💃", sub: "čeká…" },
  { amount: 35000, title: "Lego 🧱", sub: "čeká…" },
  { amount: 40000, title: "Asijská ochutnávka 🍜", sub: "čeká…" },
];

function fmtMoney(n){
  return `${Math.round(n).toLocaleString("cs-CZ")} Kč`;
}
function pad(n){ return String(n).padStart(2,"0"); }
function fmtHMS(sec){
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec/3600);
  const m = Math.floor((sec%3600)/60);
  const s = sec%60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
function fmtTime(ts){
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fmtDateTime(ts){
  const d = new Date(ts);
  return `${d.toLocaleDateString("cs-CZ")} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/* ====== THEME TOGGLE ====== */
function applyTheme(theme){
  const isLight = theme === "light";
  document.body.classList.toggle("theme-light", isLight);

  const icon = document.getElementById("themeIcon");
  const text = document.getElementById("themeText");

  if (icon) icon.textContent = isLight ? "🌞" : "🌙";
  if (text) text.textContent = isLight ? "Den" : "Noc";
}

function initTheme(){
  const saved = localStorage.getItem("fufathon_theme");
  const theme = saved || "dark";
  applyTheme(theme);

  const btn = document.getElementById("themeBtn");
  if (btn){
    btn.addEventListener("click", ()=>{
      const nowLight = document.body.classList.contains("theme-light");
      const next = nowLight ? "dark" : "light";
      localStorage.setItem("fufathon_theme", next);
      applyTheme(next);
    });
  }
}

function buildPrettyFeed(lastEvents, limit = 10){
  const events = (lastEvents || []).slice().sort((a,b)=>b.ts-a.ts);
  const out = [];
  const giftWindowMs = 8000;

  for (let i=0; i<events.length; i++){
    const e = events[i];
    if (!e) continue;

    if (e.kind === "gift") {
      const sender = (e.sender || "Anonym").toString();
      const tier = Number(e.tier) || 1;

      let count = 1;
      let j = i+1;

      while (j < events.length) {
        const n = events[j];
        if (!n || n.kind !== "gift") break;

        const sameSender = (n.sender || "Anonym").toString().toLowerCase() === sender.toLowerCase();
        const sameTier = (Number(n.tier)||1) === tier;
        const close = Math.abs(e.ts - n.ts) <= giftWindowMs;

        if (sameSender && sameTier && close) {
          count += 1;
          j += 1;
        } else break;
      }

      i = j - 1;

      const mins = tier === 2 ? 15 : tier === 3 ? 20 : 10;
      const addedMin = count * mins;

      out.push({
        ts: e.ts,
        text: `🎁 ${sender} daroval(a) ${count}× Gifted (T${tier}) (+${addedMin} min) 💗`,
      });

      if (out.length >= limit) break;
      continue;
    }

    if (e.kind === "donation" && e.text) {
      out.push({ ts: e.ts, text: e.text });
      if (out.length >= limit) break;
      continue;
    }

    if (e.kind === "sub" || e.kind === "resub") {
      const tier = Number(e.tier) || 1;
      const name = (e.sender || "Anonym").toString();
      const mins = tier === 2 ? 15 : tier === 3 ? 20 : 10;

      const label = e.kind === "resub" ? "🔁 Resub" : "⭐ Sub";
      out.push({
        ts: e.ts,
        text: `${label} (T${tier}) (+${mins} min) – ${name} 💗`,
      });

      if (out.length >= limit) break;
      continue;
    }

    if (e.text) {
      out.push({ ts: e.ts, text: e.text });
      if (out.length >= limit) break;
    }
  }

  return out;
}

function renderGoals(money){
  const list = document.getElementById("goalList");
  const header = document.getElementById("goalHeader");
  const bar = document.getElementById("goalBar");

  header.textContent = `${fmtMoney(money)} / ${fmtMoney(GOAL_TOTAL)}`;

  const pct = Math.max(0, Math.min(100, (money/GOAL_TOTAL)*100));
  bar.style.width = `${pct}%`;

  list.innerHTML = "";
  for (const g of GOALS){
    const done = money >= g.amount;
    const el = document.createElement("div");
    el.className = `goal ${done ? "done" : ""}`;

    el.innerHTML = `
      <div class="goalLeft">
        <div class="chk">${done ? "✓" : ""}</div>
        <div style="min-width:0">
          <div class="goalName">${g.title}</div>
          <div class="goalSub">${done ? "splněno 💜" : (g.sub || "čeká…")}</div>
        </div>
      </div>
      <div class="goalRight">${fmtMoney(g.amount)}</div>
    `;
    list.appendChild(el);
  }
}

function renderTop(topDonors){
  const root = document.getElementById("topTable");
  root.innerHTML = "";

  const head = document.createElement("div");
  head.className = "row rowHead";
  head.innerHTML = `<div>#</div><div>JMÉNO</div><div>KČ CELKEM</div><div>PŘIDANÝ ČAS</div>`;
  root.appendChild(head);

  (topDonors || []).forEach((d, idx)=>{
    const el = document.createElement("div");
    el.className = "row";
    const addedMin = Math.round((Number(d.addedSec)||0)/60);
    el.innerHTML = `
      <div class="bold">${idx+1}</div>
      <div class="bold">${d.user}</div>
      <div class="bold">${fmtMoney(d.totalKc)}</div>
      <div class="bold">+${addedMin} min</div>
    `;
    root.appendChild(el);
  });

  if (!topDonors || topDonors.length === 0){
    const el = document.createElement("div");
    el.className = "row";
    el.innerHTML = `<div>—</div><div class="bold">Zatím nikdo</div><div>0 Kč</div><div>+0 min</div>`;
    root.appendChild(el);
  }
}

function renderFeed(pretty){
  const root = document.getElementById("feed");
  root.innerHTML = "";

  pretty.forEach(item=>{
    const el = document.createElement("div");
    el.className = "feedItem";
    el.innerHTML = `
      <div class="feedLeft">
        <div class="timeTag">[${fmtTime(item.ts)}]</div>
        <div class="feedText">${item.text}</div>
      </div>
    `;
    root.appendChild(el);
  });

  if (pretty.length === 0){
    const el = document.createElement("div");
    el.className = "feedItem";
    el.innerHTML = `<div class="feedLeft"><div class="timeTag">[--:--]</div><div class="feedText">Zatím nic… 💗</div></div>`;
    root.appendChild(el);
  }
}

async function tick(){
  const res = await fetch(API_STATE, { cache: "no-store" });
  const s = await res.json();

  const now = Date.now();
  const effectiveNow = (s.paused && s.pausedAt) ? s.pausedAt : now;

  const remaining = s.timeRemainingSec ?? 0;
  document.getElementById("timeLeft").textContent = fmtHMS(remaining);

  const runningSec = Math.max(0, Math.floor((effectiveNow - s.startedAt)/1000));
  document.getElementById("timeRunning").textContent = fmtHMS(runningSec);

  document.getElementById("startedAtText").textContent = `Start: ${fmtDateTime(s.startedAt)}`;
  document.getElementById("endsAtText").textContent = `Konec: ${fmtDateTime(s.endsAt)}`;

  // Time progress
  const totalSec = Math.max(1, Math.floor((s.endsAt - s.startedAt)/1000));
  const doneSec = Math.max(0, Math.min(totalSec, Math.floor((effectiveNow - s.startedAt)/1000)));
  const pct = Math.round((doneSec/totalSec)*100);

  document.getElementById("timeProgress").style.width = `${pct}%`;
  document.getElementById("timePct").textContent = `${pct}%`;

  // Money
  const money = Number(s.money) || 0;
  document.getElementById("money").textContent = fmtMoney(money);
  document.getElementById("moneySmall").textContent = `${fmtMoney(money)} / ${fmtMoney(GOAL_TOTAL)}`;

  const mp = Math.max(0, Math.min(100, (money/GOAL_TOTAL)*100));
  document.getElementById("moneyProgress").style.width = `${mp}%`;

  // Subs
  document.getElementById("subsTotal").textContent = String(s.subsTotal || 0);
  document.getElementById("subsBreak").textContent = `${s.t1||0} / ${s.t2||0} / ${s.t3||0}`;

  renderGoals(money);
  renderTop(s.topDonors || []);

  const pretty = buildPrettyFeed(s.lastEvents || [], 10);
  renderFeed(pretty);
}

async function loop(){
  try { await tick(); } catch(e){ console.log("tick error", e); }
  setTimeout(loop, 2000);
}

initTheme();
loop();
