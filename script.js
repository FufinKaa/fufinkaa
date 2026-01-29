// ============================
// FUFATHON Dashboard - FINÁLNÍ VERZE
// ============================

const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";
const GOAL_TOTAL = 200000;
const SUB_GOAL_TOTAL = 1000;
const SE_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaXRhZGVsIiwiZXhwIjoxNzg1MTg5ODgyLCJqdGkiOiI2MzMzNDRlMS03ODkxLTQ4NjAtOTIzNC0zNmY3Y2I0YWRhMTciLCJjaGFubmVsIjoiNWJhN2M4NTY2NzE2NmQ5MTUwYjQwNmZlIiwicm9sZSI6Im93bmVyIiwiYXV0aFRva2VuIjoiYU9PQ0E1UmR3V2M2OTZ0WVJzUU1pQjRjNzZ2ZUdBUFdxN0hsYXJLczhxSHZIb2xJIiwidXNlciI6IjViYTdjODU2NjcxNjZkM2U5OGI0MDZmZCIsInVzZXJfaWQiOiIyOGE3MTNkZS00ZDAzLTQxYzQtOTliMi1hMWQ0NDY0NmY0NDkiLCJ1c2VyX3JvbGUiOiJjcmVhdG9yIiwicHJvdmlkZXIiOiJ0d2l0Y2giLCJwcm92aWRlcl9pZCI6IjI1MzExNjI5MSIsImNoYW5uZWxfaWQiOiI1NGQwNzRjYi1hODQ0LTRmMDctOWZhNC02NWVlNDRmNjJiZGUiLCJjcmVhdG9yX2lkIjoiZDU5MGJmYzMtNDgwYS00MTc0LWEyOWUtZWRlOTI1MjI3N2YyIn0.fXn27iJsOAB7u02mFzBLEEvAY1bYBM47LhMWbhJv_yg';

const SUB_MINUTES = { 1: 10, 2: 20, 3: 30 };

// DONATEGOAL - VŠECHNY GOALS Z SCREENSHOTU
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
  { amount: 200000, icon: "🏙️", title: "Víkend v Praze" }
];

// SUBGOAL - VŠECHNY GOALS Z SCREENSHOTU
const SUB_GOALS = [
  { amount: 100, icon: "🍳", title: "Snídaně podle chatu" },
  { amount: 200, icon: "💄", title: "Make-up challenge" },
  { amount: 300, icon: "👗", title: "Outfit vybíráte vy" },
  { amount: 400, icon: "⚖️", title: "Kontrola váhy od teď" },
  { amount: 500, icon: "⚔️", title: "1v1 s chatem" },
  { amount: 600, icon: "🎮", title: "Vybíráte hru na hlavní blok dne" },
  { amount: 700, icon: "👑", title: "Rozhoduje o dni" },
  { amount: 800, icon: "🍽️", title: "Luxusní restaurace v Ostravě" },
  { amount: 900, icon: "👾", title: "Turnaj ve Fortnite" },
  { amount: 1000, icon: "🏎️", title: "Jízda ve sporťáku" }
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
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}. ${month}. ${year} ${hours}:${minutes}`;
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
      <div class="goal-row">
        <div class="goal-name">
          <span>${g.icon}</span>
          <span>${g.title}</span>
        </div>
        <div class="goal-amount">${formatKc(g.amount)} Kč</div>
      </div>
    `;
  }).join('');
  
  list.innerHTML = goalsHTML;
  $("#goalHeader").textContent = `${formatKc(m)} / ${formatKc(GOAL_TOTAL)} Kč`;
}

// ===== SUBGOAL RENDER =====
function renderSubGoals(subsTotal) {
  const subs = Number(subsTotal) || 0;
  const list = $("#subGoalList");
  if (!list) return;
  
  const subGoalsHTML = SUB_GOALS.map(g => {
    return `
      <div class="goal-row">
        <div class="goal-name">
          <span>${g.icon}</span>
          <span>${g.title}</span>
        </div>
        <div class="goal-amount">${g.amount} subs</div>
      </div>
    `;
  }).join('');
  
  list.innerHTML = subGoalsHTML;
  $("#subGoalHeader").textContent = `${subs} / ${SUB_GOAL_TOTAL} subs`;
}

// ===== TOP DONORS =====
function renderTopDonors(donors) {
  const tbody = $("#topTableBody");
  if (!tbody) return;
  
  const donorsArray = donors || [];
  const rows = donorsArray.slice(0, 5).map((donor, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${donor.user || "Anonym"}</strong></td>
      <td>${formatKc(donor.totalKc || 0)} Kč</td>
      <td>+${Math.round((donor.addedSec || 0) / 60)} min</td>
    </tr>
  `).join('');
  
  tbody.innerHTML = rows || `
    <tr>
      <td colspan="4" class="mutedCell">
        Zatím žádní dárci... buď první! 💜
      </td>
    </tr>
  `;
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
  
  // Čas DO KONCE
  const remaining = Number(data.timeRemainingSec) || 0;
  $("#timeLeft").textContent = formatHMS(remaining);
  
  // Čas JAK DLOUHO STREAMUJI
  if (data.startedAt) {
    const streamedSec = Math.floor((Date.now() - data.startedAt) / 1000);
    $("#timeRunning").textContent = formatHMS(streamedSec);
    $("#startedAtText").textContent = `Start: ${formatDateTime(data.startedAt)}`;
  }
  
  // Formátování data konce
  if (data.endsAt) {
    $("#endsAtText").textContent = `Konec: ${formatDateTime(data.endsAt)}`;
  }
  
  // Progress času POUZE
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
  renderTopDonors(data.topDonors);
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
