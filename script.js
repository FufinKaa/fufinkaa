// ============================
// FUFATHON Dashboard
// ============================

const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";
const GOAL_TOTAL = 200000;
const SUB_GOAL_TOTAL = 1000;
const SE_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaXRhZGVsIiwiZXhwIjoxNzg1MTg5ODgyLCJqdGkiOiI2MzMzNDRlMS03ODkxLTQ4NjAtOTIzNC0zNmY3Y2I0YWRhMTciLCJjaGFubmVsIjoiNWJhN2M4NTY2NzE2NmQ5MTUwYjQwNmZlIiwicm9sZSI6Im93bmVyIiwiYXV0aFRva2VuIjoiYU9PQ0E1UmR3V2M2OTZ0WVJzUU1pQjRjNzZ2ZUdBUFdxN0hsYXJLczhxSHZIb2xJIiwidXNlciI6IjViYTdjODU2NjcxNjZkM2U5OGI0MDZmZCIsInVzZXJfaWQiOiIyOGE3MTNkZS00ZDAzLTQxYzQtOTliMi1hMWQ0NDY0NmY0NDkiLCJ1c2VyX3JvbGUiOiJjcmVhdG9yIiwicHJvdmlkZXIiOiJ0d2l0Y2giLCJwcm92aWRlcl9pZCI6IjI1MzExNjI5MSIsImNoYW5uZWxfaWQiOiI1NGQwNzRjYi1hODQ0LTRmMDctOWZhNC02NWVlNDRmNjJiZGUiLCJjcmVhdG9yX2lkIjoiZDU5MGJmYzMtNDgwYS00MTc0LWEyOWUtZWRlOTI1MjI3N2YyIn0.fXn27iJsOAB7u02mFzBLEEvAY1bYBM47LhMWbhJv_yg';

const SUB_MINUTES = { 1: 10, 2: 20, 3: 30 };

// DONATEGOAL (původní)
const GOALS = [
  { amount: 5000, icon: "🎬", title: "Movie night" },
  { amount: 10000, icon: "😏", title: "Q&A bez cenzury" },
  { amount: 15000, icon: "👻", title: "Horror Night" },
  { amount: 20000, icon: "🍔", title: "Jídlo podle chatu" },
  { amount: 25000, icon: "🤡", title: "Kostým stream" },
  { amount: 30000, icon: "💃", title: "Just Dance" },
  { amount: 35000, icon: "🧱", title: "Lego" },
  { amount: 40000, icon: "🍣", title: "Asijská ochutnávka" },
  { amount: 45000, icon: "⛏️", title: "Minecraft SpeedRun DUO" },
  { amount: 50000, icon: "🎤", title: "Karaoke stream" },
  { amount: 55000, icon: "🔫", title: "Battle Royale Challenge" },
  { amount: 60000, icon: "🎳", title: "Bowling" },
  { amount: 65000, icon: "💦", title: "Try Not To Laugh" },
  { amount: 70000, icon: "👣", title: "Běžecký pás" },
  { amount: 75000, icon: "🍹", title: "Drunk Stream" },
  { amount: 80000, icon: "🧍‍♀️", title: "12h Stream ve stoje" },
  { amount: 85000, icon: "🕹️", title: "Split Fiction w/ Juraj" },
  { amount: 90000, icon: "🎁", title: "Mystery box opening" },
  { amount: 95000, icon: "🏆", title: "Turnaj v LoLku" },
  { amount: 100000, icon: "🎉", title: "Stodolní ve stylu" },
  { amount: 110000, icon: "🏎️", title: "Motokáry" },
  { amount: 120000, icon: "🎧", title: "ASMR stream" },
  { amount: 125000, icon: "⚡", title: "Bolt Tower" },
  { amount: 130000, icon: "🥶", title: "Otužování" },
  { amount: 140000, icon: "⛳", title: "MiniGolf" },
  { amount: 150000, icon: "🫧", title: "Vířivka" },
  { amount: 160000, icon: "🎨", title: "Zážitkové ART studio" },
  { amount: 170000, icon: "🐎", title: "Jízda na koni" },
  { amount: 180000, icon: "🏔️", title: "Výšlap na Lysou horu" },
  { amount: 190000, icon: "🖊️", title: "Tetování" },
  { amount: 200000, icon: "🏙️", title: "Víkend v Praze" },
];

// SUBGOAL (nový)
const SUB_GOALS = [
  { amount: 100, title: "Snídaně podle chatu" },
  { amount: 200, title: "Make-up challenge" },
  { amount: 300, title: "Outfit vybíráte vy" },
  { amount: 400, title: "Kontrola váhy od teď" },
  { amount: 500, title: "1v1 s chatem" },
  { amount: 600, title: "Vybíráte hru na hlavní blok dne" },
  { amount: 700, title: "Rozhoduje o dni" },
  { amount: 800, title: "Luxusní restaurace v Ostravě" },
  { amount: 900, title: "Turnaj ve Fortnite" },
  { amount: 1000, title: "Jízda ve sporťáku" }
];

// ===== UTILITIES =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function formatKc(n) {
  return Number(n || 0).toLocaleString("cs-CZ");
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
    minute: "2-digit"
  });
}

// ===== THEME TOGGLE =====
function initTheme() {
  const saved = localStorage.getItem("fuf_theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
  
  const icon = saved === "light" ? "☀️" : "🌙";
  const text = saved === "light" ? "Den" : "Noc";
  
  $("#themeIcon").textContent = icon;
  $("#themeText").textContent = text;
  
  $("#themeBtn").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("fuf_theme", next);
    
    $("#themeIcon").textContent = next === "light" ? "☀️" : "🌙";
    $("#themeText").textContent = next === "light" ? "Den" : "Noc";
  });
}

// ===== DONATEGOAL RENDER =====
function renderGoals(money) {
  const m = Number(money) || 0;
  const list = $("#goalList");
  if (!list) return;
  
  const goalsHTML = GOALS.map(g => {
    const done = m >= g.amount;
    
    return `
      <div class="goalRow ${done ? 'done' : ''}">
        <div class="goalLeft">
          <span class="goalCheck">${done ? '✅' : '⬜'}</span>
          <span class="goalIcon">${g.icon}</span>
          <span class="goalTitle">${g.title}</span>
        </div>
        <div class="goalAmt">${formatKc(g.amount)} Kč</div>
      </div>
    `;
  }).join('');
  
  list.innerHTML = goalsHTML;
  $("#goalHeader").textContent = `${formatKc(m)} / ${formatKc(GOAL_TOTAL)} Kč`;
  
  const goalPercent = Math.min(100, (m / GOAL_TOTAL) * 100);
  $("#goalBar").style.width = `${goalPercent}%`;
}

// ===== SUBGOAL RENDER =====
function renderSubGoals(subsTotal) {
  const subs = Number(subsTotal) || 0;
  const list = $("#subGoalList");
  if (!list) return;
  
  const subGoalsHTML = SUB_GOALS.map(g => {
    const done = subs >= g.amount;
    
    return `
      <div class="subGoalRow ${done ? 'done' : ''}">
        <span class="goalTitle">${g.title}</
