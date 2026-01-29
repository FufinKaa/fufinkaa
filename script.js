// ============================
// FUFATHON Dashboard - Čistý design
// ============================

const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";
const GOAL_TOTAL = 200000;
const SUB_GOAL_TOTAL = 1000;
const SE_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaXRhZGVsIiwiZXhwIjoxNzg1MTg5ODgyLCJqdGkiOiI2MzMzNDRlMS03ODkxLTQ4NjAtOTIzNC0zNmY3Y2I0YWRhMTciLCJjaGFubmVsIjoiNWJhN2M4NTY2NzE2NmQ5MTUwYjQwNmZlIiwicm9sZSI6Im93bmVyIiwiYXV0aFRva2VuIjoiYU9PQ0E1UmR3V2M2OTZ0WVJzUU1pQjRjNzZ2ZUdBUFdxN0hsYXJLczhxSHZIb2xJIiwidXNlciI6IjViYTdjODU2NjcxNjZkM2U5OGI0MDZmZCIsInVzZXJfaWQiOiIyOGE3MTNkZS00ZDAzLTQxYzQtOTliMi1hMWQ0NDY0NmY0NDkiLCJ1c2VyX3JvbGUiOiJjcmVhdG9yIiwicHJvdmlkZXIiOiJ0d2l0Y2giLCJwcm92aWRlcl9pZCI6IjI1MzExNjI5MSIsImNoYW5uZWxfaWQiOiI1NGQwNzRjYi1hODQ0LTRmMDctOWZhNC02NWVlNDRmNjJiZGUiLCJjcmVhdG9yX2lkIjoiZDU5MGJmYzMtNDgwYS00MTc0LWEyOWUtZWRlOTI1MjI3N2YyIn0.fXn27iJsOAB7u02mFzBLEEvAY1bYBM47LhMWbhJv_yg';

const SUB_MINUTES = { 1: 10, 2: 20, 3: 30 };

// DONATEGOAL (jen z obrázku)
const GOALS = [
  { amount: 120000, title: "ASMR stream" },
  { amount: 125000, title: "Bolt Tower" },
  { amount: 130000, title: "Otužování" },
  { amount: 140000, title: "MiniGolf" },
  { amount: 150000, title: "Vířivka" },
  { amount: 160000, title: "Zážitkové ART studio" }
];

// SUBGOAL (přesně z obrázku)
const SUB_GOALS = [
  { amount: 100, title: "Snídaně podle chatu" },
  { amount: 200, title: "Make-up challenge" },
  { amount: 300, title: "Outfit vybíráte vy" },
  { amount: 400, title: "Kontrola váhy od teď" },
  { amount: 500, title: "1v1 s chatem" },
  { amount: 1000, title: "Subgoal hlavní" }
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
    return `
      <div class="goal-item">
        <div class="goal-name">${g.title}</div>
        <div class="goal-amount">${formatKc(g.amount)} Kč</div>
      </div>
    `;
  }).join('');
  
  list.innerHTML = goalsHTML;
  $("#goalHeader").textContent = `${formatKc(m)} / ${formatKc(GOAL_TOTAL)} Kč`;
  
  const goalPercent = Math.min(100, (m / GOAL_TOTAL) * 100);
  $("#moneyProgress").style.width = `${goalPercent}%`;
  $("#moneyPct").textContent = `${goalPercent.toFixed(1)}%`;
}

// ===== SUBGOAL RENDER =====
function renderSubGoals(subsTotal) {
  const subs = Number(subsTotal) || 0;
  const list = $("#subGoalList");
  if (!list) return;
  
  const subGoalsHTML = SUB_GOALS.map(g => {
    return `
      <div class="goal-item">
        <div class="goal-name">${g.title}</div>
        <div class="goal-amount">${g.amount} subs</div>
      </div>
    `;
  }).join('');
  
  list.innerHTML = subGoalsHTML;
  $("#subGoalHeader").textContent = `${subs} / ${SUB_GOAL_TOTAL} subs`;
  
  const subGoalPercent = Math.min(100, (subs / SUB_GOAL_TOTAL) * 100);
  $("#subGoalBar").style.width = `${subGoalPercent}%`;
  $("#subPct").textContent = `${subGoalPercent.toFixed(1)}%`;
}

// ===== ACTIVITY FEED =====
function renderActivityFeed(events) {
  const feed = $("#feed");
  if (!feed) return;
  
  const eventsArray = events || [];
  const feedHTML = eventsArray.slice(0, 10).map(event => {
    const time = event.ts ? 
      new Date(event.ts).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" }) : 
      "--:--";
    
    let icon = "⚡";
    let text = event.text || "";
    let amount = "";
    
    if (event.kind === "donation") {
      icon = "💰";
      text = `Donate ${formatKc(event.amountKc)} Kč od ${event.sender || 'Anonym'}`;
      amount = `+${Math.round((event.amountKc / 100) * 15)} min`;
    } else if (event.kind === "sub") {
      icon = "⭐";
      text = `${event.sender || 'Anonym'} si pořídil sub (T${event.tier})`;
      amount = `+${SUB_MINUTES[event.tier] || 10} min`;
    } else if (event.kind === "resub") {
      icon = "🔁";
      text = `${event.sender || 'Anonym'} resub (${event.months} měs.)`;
      amount = `+${SUB_MINUTES[event.tier] || 10} min`;
    } else if (event.kind === "gift") {
      icon = "🎁";
      text = `${event.sender || 'Anonym'} daroval ${event.count}× sub`;
      amount = `+${(SUB_MINUTES[event.tier] || 10) * event.count} min`;
    }
    
    return `
      <div class="activity-item">
        <span class="activity-time">[${time}]</span>
        <span class="activity-text">${icon} ${text}</span>
        <span class="activity-amount">${amount}</span>
      </div>
    `;
  }).join('');
  
  feed.innerHTML = feedHTML || `
    <div class="activity-item">
      <span class="activity-text">Zatím žádné akce...</span>
    </div>
  `;
}

// ===== STREAMELEMENTS SOCKET =====
function connectStreamElements() {
  if (!SE_JWT_TOKEN) {
    console.log('⚠️ StreamElements: JWT token není nastaven');
    return;
  }
  
  if (!window.io) {
    console.error('❌ Socket.io není načteno');
    return;
  }
  
  const socket = io('https://realtime.streamelements.com', {
    transports: ['websocket']
  });
  
  socket.on('connect', () => {
    console.log('✅ StreamElements: Připojeno');
    socket.emit('authenticate', {
      method: 'jwt',
      token: SE_JWT_TOKEN
    });
  });
  
  socket.on('event', (data) => {
    console.log('🎬 StreamElements event:', data.listener);
    fetchDashboardData();
  });
  
  socket.on('error', (err) => {
    console.error('❌ StreamElements error:', err);
  });
}

// ===== MAIN RENDER =====
function renderDashboard(data) {
  if (!data) return;
  
  // Čas
  const remaining = Number(data.timeRemainingSec) || 0;
  $("#timeLeft").textContent = formatHMS(remaining);
  
  if (data.endsAt) {
    const date = new Date(data.endsAt);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    $("#endsAtText").textContent = `Konec: ${day}. ${month}. ${year} ${hours}:${minutes}`;
  }
  
  // Progress času
  if (data.startedAt && data.endsAt && data.endsAt > data.startedAt) {
    const total = data.endsAt - data.startedAt;
    const elapsed = Date.now() - data.startedAt;
    const percent = Math.min(100, (elapsed / total) * 100);
    $("#timeProgress").style.width = `${percent}%`;
    $("#timePct").textContent = `${Math.round(percent)}%`;
  }
  
  // Peníze
  const money = Number(data.money) || 0;
  $("#money").textContent = `${formatKc(money)} Kč`;
  $("#moneySmall").textContent = `${formatKc(money)} / ${formatKc(GOAL_TOTAL)} Kč`;
  
  // Suby
  const t1 = Number(data.t1) || 0;
  const t2 = Number(data.t2) || 0;
  const t3 = Number(data.t3) || 0;
  const subsTotal = Number(data.subsTotal) || (t1 + t2 + t3);
  
  $("#subsTotal").textContent = subsTotal;
  $("#subsBreak").textContent = `${t1} / ${t2} / ${t3}`;
  
  // Zbytek
  renderGoals(money);
  renderSubGoals(subsTotal);
  renderActivityFeed(data.lastEvents || data.events || []);
}

// ===== API FETCH =====
async function fetchDashboardData() {
  try {
    const response = await fetch(API_STATE, { cache: "no-store" });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    renderDashboard(data);
  } catch (error) {
    console.error('Chyba při načítání dat:', error);
  }
}

// ===== INITIALIZATION =====
function initDashboard() {
  initTheme();
  fetchDashboardData();
  connectStreamElements();
  
  // Auto-refresh každé 2 sekundy
  setInterval(fetchDashboardData, 2000);
}

// ===== START =====
document.addEventListener("DOMContentLoaded", initDashboard);
