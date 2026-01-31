// ============================
// FUFATHON Dashboard - CENTRALIZOVANÁ VERZE
// ============================

// KONFIGURACE
const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";
const GOAL_TOTAL = 200000;
const SUB_GOAL_TOTAL = 1000;

// ===== TIMER =====
let subathonEndTime = new Date("2026-02-09T14:00:00");
let isStreamActive = true;

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

// ===== POMOCNÉ FUNKCE =====
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
  return `${pad2(d.getDate())}. ${pad2(d.getMonth() + 1)}. ${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// ===== TIMER FUNKCE =====
function updateTimers() {
  const now = new Date();
  
  // Aktualizuj jen čas DO KONCE z lokální proměnné
  const remainingMs = Math.max(0, subathonEndTime - now);
  const remainingSec = Math.floor(remainingMs / 1000);
  $("#timeLeft").textContent = formatHMS(remainingSec);
  $("#endsAtText").textContent = `Konec: ${formatDateTime(subathonEndTime)}`;
  
  // Progress bar času
  const totalDurationMs = subathonEndTime.getTime() - new Date("2026-02-09T14:00:00").getTime();
  const elapsedMs = now.getTime() - new Date("2026-02-09T14:00:00").getTime();
  const percent = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));
  $("#timeProgress").style.width = `${percent}%`;
  $("#timePct").textContent = `${Math.round(percent)}%`;
}

// ===== HLÁŠKY O PŘIDÁNÍ ČASU =====
function showTimeAddedNotification(minutes) {
  const notification = document.createElement('div');
  notification.className = 'time-added-notification';
  notification.innerHTML = `
    <div class="notification-content">
      🎉 <strong>+${minutes} minut</strong> přidáno do subathonu!
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// ===== NAČTENÍ DAT Z WORKERU =====
async function loadDataFromWorker() {
  console.log('📊 Načítám data z Worker API...');
  
  try {
    const response = await fetch(API_STATE);
    
    if (!response.ok) {
      throw new Error(`API chyba: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Data z Workeru:', data);
    
    // 1. AKTUALIZUJ ČAS SUBATHONU
    if (data.endsAt) {
      subathonEndTime = new Date(data.endsAt);
      localStorage.setItem('subathonEndTime', data.endsAt);
    }
    
    // 2. PENÍZE
    $("#money").textContent = `${formatKc(data.money)} Kč`;
    $("#moneySmall").textContent = `${formatKc(data.money)} / ${formatKc(GOAL_TOTAL)} Kč`;
    
    // 3. SUBY
    $("#subsTotal").textContent = data.subsTotal;
    $("#subsBreak").textContent = `${data.t1} / ${data.t2} / ${data.t3}`;
    
    // 4. GOALS
    renderGoals(data.money);
    renderSubGoals(data.subsTotal);
    
    // 5. TOP DONORS
    renderTopDonors(data.topDonors || []);
    
    // 6. AKTIVITY
    renderActivityFeed(data.lastEvents || []);
    
    // 7. PROGRESS HEADERS
    $("#goalHeader").textContent = `${formatKc(data.money)} / ${formatKc(GOAL_TOTAL)} Kč`;
    $("#subGoalHeader").textContent = `${data.subsTotal} / ${SUB_GOAL_TOTAL} subs`;
    
    // 8. ULOŽ DATA JAKO ZÁLOHU
    const backup = {
      money: data.money,
      t1: data.t1,
      t2: data.t2,
      t3: data.t3,
      subsTotal: data.subsTotal,
      topDonors: data.topDonors || [],
      lastEvents: data.lastEvents || []
    };
    localStorage.setItem('fufathon_api_backup', JSON.stringify(backup));
    
  } catch (error) {
    console.error('❌ Chyba při načítání z API:', error);
    // Zkus načíst záložní data
    try {
      const backup = JSON.parse(localStorage.getItem('fufathon_api_backup') || '{}');
      if (backup.money !== undefined) {
        console.log('⚡ Používám záložní data');
        $("#money").textContent = `${formatKc(backup.money)} Kč`;
        $("#moneySmall").textContent = `${formatKc(backup.money)} / ${formatKc(GOAL_TOTAL)} Kč`;
        $("#subsTotal").textContent = backup.subsTotal || 0;
        $("#subsBreak").textContent = `${backup.t1 || 0} / ${backup.t2 || 0} / ${backup.t3 || 0}`;
        renderGoals(backup.money);
        renderSubGoals(backup.subsTotal);
        renderTopDonors(backup.topDonors || []);
        renderActivityFeed(backup.lastEvents || []);
      }
    } catch (backupError) {
      console.error('❌ Ani záložní data nefungují:', backupError);
      // Zobraz aspoň něco
      $("#money").textContent = "0 Kč";
      $("#moneySmall").textContent = "0 / 200 000 Kč";
      $("#subsTotal").textContent = "0";
      $("#subsBreak").textContent = "0 / 0 / 0";
    }
  }
}

// ===== RENDER FUNKCE (ponech z původního kódu) =====
function renderGoals(money) {
  const m = Number(money) || 0;
  const list = $("#goalList");
  if (!list) return;
  
  const goalsHTML = GOALS.map(g => {
    const done = m >= g.amount;
    return `
      <div class="goal-row ${done ? 'done' : ''}">
        <div class="goal-name">
          <span class="goal-check">${done ? '✅' : '⬜'}</span>
          <span class="goal-name-text">${g.icon} ${g.title}</span>
        </div>
        <div class="goal-amount">${formatKc(g.amount)} Kč</div>
      </div>
    `;
  }).join('');
  
  list.innerHTML = goalsHTML;
}

function renderSubGoals(subsTotal) {
  const subs = Number(subsTotal) || 0;
  const list = $("#subGoalList");
  if (!list) return;
  
  const subGoalsHTML = SUB_GOALS.map(g => {
    const done = subs >= g.amount;
    return `
      <div class="goal-row ${done ? 'done' : ''}">
        <div class="goal-name">
          <span class="goal-check">${done ? '✅' : '⬜'}</span>
          <span class="goal-name-text">${g.icon} ${g.title}</span>
        </div>
        <div class="goal-amount">${g.amount} subs</div>
      </div>
    `;
  }).join('');
  
  list.innerHTML = subGoalsHTML;
}

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
    
    if (event.kind === "donation") {
      icon = "💰";
      text = `Donate ${formatKc(event.amountKc)} Kč`;
    } else if (event.kind === "sub") {
      icon = "⭐";
      text = `Nový sub (T${event.tier})`;
    } else if (event.kind === "resub") {
      icon = "🔁";
      text = `Resub ${event.months} měs.`;
    } else if (event.kind === "gift") {
      icon = "🎁";
      text = `Darováno ${event.count}× sub`;
    }
    
    return `
      <div class="activity-item">
        <span class="activity-time">[${time}]</span>
        <span class="activity-text">${icon} ${text}</span>
      </div>
    `;
  }).join('');
  
  feed.innerHTML = feedHTML || `
    <div class="activity-item">
      <span class="activity-text">Zatím žádné akce...</span>
    </div>
  `;
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

// ===== INICIALIZACE =====
function initDashboard() {
  console.log('🚀 Dashboard inicializován (centralizovaná verze)');
  
  // 1. Téma
  initTheme();
  
  // 2. Načti data z Workeru OKAMŽITĚ
  loadDataFromWorker();
  
  // 3. Nastav interval pro obnovování dat (každých 3 sekundy)
  setInterval(loadDataFromWorker, 3000);
  
  // 4. Nastav interval pro timer (každou sekundu)
  setInterval(updateTimers, 1000);
  
  // 5. OKAMŽITÉ zobrazení timeru
  updateTimers();
}

// ===== START =====
document.addEventListener("DOMContentLoaded", initDashboard);
