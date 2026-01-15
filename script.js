/* =========================================================
   FUFATHON Dashboard – script.js
   - Time left / Time live
   - Money + Goals auto-check
   - Top supporters (by Kč total)
   - Last actions (subs + donations)
   - Cute theme toggle
   - Demo controls (zatím)
   ========================================================= */

const STORAGE_KEY = "fufathon_state_v2";
const MONEY_GOAL = 200000;

// ✅ Nastavení: 1 Kč = 1 minuta
const DONATION_MINUTES_PER_KC = 1;

// Subs time rules
const SUB_MINUTES = { t1: 10, t2: 15, t3: 20 };

// Goals (tvůj seznam)
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
  const initialMinutes = 6 * 60; // ✅ default start: 6 hodin (můžeš změnit)
  return {
    startedAt: start,
    endsAt: start + initialMinutes * 60 * 1000,

    money: 0,
    t1: 0,
    t2: 0,
    t3: 0,

    // events: newest first
    events: [
      { ts: start, text: "💗✨ FUFATHON je LIVE – čekám na první sub/donate 💜" }
    ],

    // supporters by donations: [{ user, totalKc, addedMin }]
    supporters: [],

    theme: "dark"
  };
}

let state = loadState();

function loadState(){
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------- Theme ----------
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  const btn = $("themeToggle");
  if(btn) btn.textContent = theme === "light" ? "☀️" : "🌙";
  state.theme = theme;
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
function pushEvent(text){
  state.events.unshift({ ts: now(), text });
  state.events = state.events.slice(0, 30);
  saveState();
  renderEvents();
}

function renderEvents(){
  const el = $("events");
  if(!el) return;
  el.innerHTML = state.events.map(ev => {
    const t = new Date(ev.ts).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
    return `<li><span class="muted">[${t}]</span> ${escapeHtml(ev.text)}</li>`;
  }).join("");
}

// ---------- Top supporters ----------
function upsertSupporter(user, amountKc, addedMinutes){
  const name = (user || "Anonym").trim();
  const amt = Number(amountKc) || 0;
  const addMin = Number(addedMinutes) || 0;

  if(amt <= 0) return;

  const found = state.supporters.find(s => s.user.toLowerCase() === name.toLowerCase());
  if(found){
    found.totalKc += amt;
    found.addedMin += addMin;
  }else{
    state.supporters.push({ user: name, totalKc: amt, addedMin: addMin });
  }

  state.supporters.sort((a,b) => b.totalKc - a.totalKc);
  state.supporters = state.supporters.slice(0, 10);

  saveState();
  renderSupporters();
}

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

  body.innerHTML = state.supporters.map((s, i) => `
    <tr>
      <td>${i+1}</td>
      <td>${escapeHtml(s.user)}</td>
      <td>${Number(s.totalKc).toLocaleString("cs-CZ")} Kč</td>
      <td>+${Number(s.addedMin).toLocaleString("cs-CZ")} min</td>
    </tr>
  `).join("");
}

// ---------- Money + Goals ----------
function setMoney(kc){
  state.money = Math.max(0, Number(kc) || 0);
  saveState();
  renderMoney();
  renderGoals();
}

function addMoney(kc){
  const amt = Number(kc) || 0;
  if(amt <= 0) return;
  setMoney(state.money + amt);
}

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

  // find next goal
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

function addMinutesToTimer(minutes){
  const addMin = Number(minutes) || 0;
  if(addMin <= 0) return;

  // když už doběhlo, nejdřív dorovnáme na teď
  if(state.endsAt < now()) state.endsAt = now();

  state.endsAt += addMin * 60 * 1000;
  saveState();
}

function handleSub(tier){
  if(tier === 1){ state.t1 += 1; addMinutesToTimer(SUB_MINUTES.t1); pushEvent(`🎁 T1 sub (+${SUB_MINUTES.t1} min) 💗`); }
  if(tier === 2){ state.t2 += 1; addMinutesToTimer(SUB_MINUTES.t2); pushEvent(`🎁 T2 sub (+${SUB_MINUTES.t2} min) 💗`); }
  if(tier === 3){ state.t3 += 1; addMinutesToTimer(SUB_MINUTES.t3); pushEvent(`🎁 T3 sub (+${SUB_MINUTES.t3} min) 💗`); }

  saveState();
  renderSubs();
  party();
}

function handleDonation(user, amountKc){
  const amt = Number(amountKc) || 0;
  if(amt <= 0) return;

  // money
  addMoney(amt);

  // time: 1 Kč = 1 minuta
  const addedMin = amt * DONATION_MINUTES_PER_KC;
  addMinutesToTimer(addedMin);

  // leaderboard
  upsertSupporter(user || "Anonym", amt, addedMin);

  // feed
  pushEvent(`💰 Donate ${amt.toLocaleString("cs-CZ")} Kč (+${addedMin} min) – děkuju! 💜`);

  party();
}

// ---------- Time render ----------
function renderTime(){
  const leftMs = state.endsAt - now();
  const liveMs = now() - state.startedAt;

  const leftEl = $("timeLeftHMS");
  const liveEl = $("timeLiveHMS");
  if(leftEl) leftEl.textContent = formatHMS(leftMs);
  if(liveEl) liveEl.textContent = formatHMS(liveMs);

  const endEl = $("endTime");
  const startEl = $("startTime");
  if(endEl) endEl.textContent = `Konec: ${new Date(state.endsAt).toLocaleString("cs-CZ")}`;
  if(startEl) startEl.textContent = `Start: ${new Date(state.startedAt).toLocaleString("cs-CZ")}`;

  // time progress = elapsed / (elapsed + remaining)
  const elapsed = Math.max(0, now() - state.startedAt);
  const remaining = Math.max(0, state.endsAt - now());
  const total = Math.max(1, elapsed + remaining);
  const pct = Math.round((elapsed / total) * 100);

  const barEl = $("timeProgress");
  const textEl = $("timeProgressText");
  if(barEl) barEl.style.width = `${pct}%`;
  if(textEl) textEl.textContent = `${pct}%`;
}

// ---------- Demo controls ----------
function bindDemo(){
  const wrap = document.querySelector(".demo-buttons");
  if(!wrap) return;

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if(!btn) return;

    const action = btn.getAttribute("data-action");
    if(!action) return;

    if(action === "t1") return handleSub(1);
    if(action === "t2") return handleSub(2);
    if(action === "t3") return handleSub(3);

    if(action === "donate"){
      const input = prompt("Kolik Kč? (nastavení: 1 Kč = 1 minuta)");
      if(input === null) return;
      const amt = Number(String(input).replace(",", "."));
      if(!amt || amt <= 0) return alert("Zadej číslo > 0 🙂");
      const name = prompt("Jméno podporovatele? (nebo nech prázdné)") || "Anonym";
      return handleDonation(name, amt);
    }

    if(action === "reset"){
      const ok = confirm("Resetnout demo data? (timer, money, akce, supporters)");
      if(!ok) return;
      state = defaultState();
      saveState();
      applyTheme(state.theme);
      renderAll();
      pushEvent("🧪 Reset (demo) – vše vynulováno.");
    }
  });
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

  bindDemo();
  renderAll();

  // smooth timers
  setInterval(renderTime, 250);
})();
