// ============================
// FUFATHON Dashboard - FINÁLNÍ OPRAVENÁ VERZE
// ============================

const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";
const GOAL_TOTAL = 200000;
const SUB_GOAL_TOTAL = 1000;
const SE_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaXRhZGVsIiwiZXhwIjoxNzg1MTg5ODgyLCJqdGkiOiI2MzMzNDRlMS03ODkxLTQ4NjAtOTIzNC0zNmY3Y2I0YWRhMTciLCJjaGFubmVsIjoiNWJhN2M4NTY2NzE2NmQ5MTUwYjQwNmZlIiwicm9sZSI6Im93bmVyIiwiYXV0aFRva2VuIjoiYU9PQ0E1UmR3V2M2OTZ0WVJzUU1pQjRjNzZ2ZUdBUFdxN0hsYXJLczhxSHZIb2xJIiwidXNlciI6IjViYTdjODU2NjcxNjZkM2U5OGI0MDZmZCIsInVzZXJfaWQiOiIyOGE3MTNkZS00ZDAzLTQxYzQtOTliMi1hMWQ0NDY0NmY0NDkiLCJ1c2VyX3JvbGUiOiJjcmVhdG9yIiwicHJvdmlkZXIiOiJ0d2l0Y2giLCJwcm92aWRlcl9pZCI6IjI1MzExNjI5MSIsImNoYW5uZWxfaWQiOiI1NGQwNzRjYi1hODQ0LTRmMDctOWZhNC02NWVlNDRmNjJiZGUiLCJjcmVhdG9yX2lkIjoiZDU5MGJmYzMtNDgwYS00MTc0LWEyOWUtZWRlOTI1MjI3N2YyIn0.fXn27iJsOAB7u02mFzBLEEvAY1bYBM47LhMWbhJv_yg';

// ===== SUBATHON TIMER SETTINGS =====
const SUBATHON_START = new Date("2026-02-09T14:00:00"); // 9. 2. 2026 14:00
const INITIAL_DURATION_HOURS = 24; // 24 hodin
const INITIAL_DURATION_MS = INITIAL_DURATION_HOURS * 60 * 60 * 1000;

let subathonEndTime = new Date(SUBATHON_START.getTime() + INITIAL_DURATION_MS);
let isStreamActive = true;

// ===== TIME ADDING RULES =====
const SUB_MINUTES = { 1: 10, 2: 20, 3: 30 };
const DONATE_RATE = 15; // minut za 100 Kč

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

// ===== TIME MANAGEMENT FUNCTIONS =====
function addMinutesToSubathon(minutes) {
  const msToAdd = minutes * 60 * 1000;
  subathonEndTime = new Date(subathonEndTime.getTime() + msToAdd);
  
  // ✅ ULOŽ ČAS DO localStorage
  localStorage.setItem('subathonEndTime', subathonEndTime.getTime());
  
  // Vizuální potvrzení
  showTimeAddedNotification(minutes);
  
  console.log(`➕ Přidáno ${minutes} minut. Nový konec: ${subathonEndTime.toLocaleString()}`);
  updateTimers();
}

function addTimeForDonate(amountCzk) {
  const minutes = Math.floor((amountCzk / 100) * DONATE_RATE);
  if (minutes > 0) {
    addMinutesToSubathon(minutes);
  }
}

function addTimeForSub(tier, count = 1) {
  const minutes = (SUB_MINUTES[tier] || 10) * count;
  addMinutesToSubathon(minutes);
}

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

function updateTimers() {
  const now = new Date();
  
  // Čas DO KONCE
  const remainingMs = Math.max(0, subathonEndTime - now);
  const remainingSec = Math.floor(remainingMs / 1000);
  $("#timeLeft").textContent = formatHMS(remainingSec);
  $("#endsAtText").textContent = `Konec: ${formatDateTime(subathonEndTime)}`;
  
  // Čas JAK DLOUHO STREAMUJI
  const streamedMs = Math.max(0, now - SUBATHON_START);
  const streamedSec = Math.floor(streamedMs / 1000);
  $("#timeRunning").textContent = formatHMS(streamedSec);
  $("#startedAtText").textContent = `Start: ${formatDateTime(SUBATHON_START)}`;
  
  // Progress bar času
  const totalDurationMs = subathonEndTime - SUBATHON_START;
  const elapsedMs = now - SUBATHON_START;
  const percent = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));
  $("#timeProgress").style.width = `${percent}%`;
  $("#timePct").textContent = `${Math.round(percent)}%`;
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
  $("#goalHeader").textContent = `${formatKc(m)} / ${formatKc(GOAL_TOTAL)} Kč`;
}

// ===== SUBGOAL RENDER =====
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
      amount = `+${Math.floor((event.amountKc / 100) * DONATE_RATE)} min`;
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
  
  socket.on('authenticated', (data) => {
    console.log('🔑 Autentizováno jako:', data.username);
  });
  
  socket.on('event', (data) => {
    console.log('🎬 StreamElements RAW event:', data);
    
    if (!data || !data.type) {
      console.log('⚠️ Neplatná událost:', data);
      return;
    }
    
    switch (data.type) {
      case 'subscriber':
        handleSubscriberEvent(data);
        break;
      case 'subscriber-gift':
        handleGiftEvent(data);
        break;
      case 'tip':
        handleTipEvent(data);
        break;
      default:
        console.log('ℹ️ Nezpracovaný typ:', data.type);
    }
  });
  
  socket.on('error', (err) => {
    console.error('❌ StreamElements error:', err);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 StreamElements odpojeno');
  });
}

// ===== STREAMELEMENTS EVENT HANDLERS =====
function handleSubscriberEvent(data) {
  const event = data.data || {};
  const username = event.username || event.displayName || event.name || 'Anonym';
  const tier = event.tier || 1;
  const months = event.months || 1;
  const message = event.message || '';
  const isGift = event.gifted || event.isGift || false;
  const gifter = event.gifter || event.sender || null;
  
  console.log('⭐ Sub event:', {
    username,
    tier,
    months,
    isGift,
    gifter,
    message: message.substring(0, 50)
  });
  
  if (isGift && gifter) {
    saveEventToHistory({
      type: 'gift',
      gifter: gifter,
      recipient: username,
      tier: tier,
      count: 1,
      timestamp: Date.now(),
      addedMinutes: SUB_MINUTES[tier] || 10
    });
    addTimeForSub(tier);
    updateSubCount(tier);
    
  } else if (months > 1) {
    saveEventToHistory({
      type: 'resub',
      username: username,
      tier: tier,
      months: months,
      message: message,
      timestamp: Date.now(),
      addedMinutes: SUB_MINUTES[tier] || 10
    });
    addTimeForSub(tier);
    updateSubCount(tier);
    
  } else {
    saveEventToHistory({
      type: 'sub',
      username: username,
      tier: tier,
      months: 1,
      message: message,
      timestamp: Date.now(),
      addedMinutes: SUB_MINUTES[tier] || 10
    });
    addTimeForSub(tier);
    updateSubCount(tier);
  }
}

function handleGiftEvent(data) {
  const event = data.data || {};
  const gifter = event.username || event.displayName || event.name || 'Anonym';
  const tier = event.tier || 1;
  const count = event.amount || event.count || 1;
  
  console.log('🎁 Gift event:', { gifter, tier, count });
  
  saveEventToHistory({
    type: 'gift',
    gifter: gifter,
    recipient: 'Komunita',
    tier: tier,
    count: count,
    timestamp: Date.now(),
    addedMinutes: (SUB_MINUTES[tier] || 10) * count
  });
  
  addTimeForSub(tier, count);
  updateSubCount(tier, count);
}

function handleTipEvent(data) {
  const event = data.data || {};
  const username = event.username || event.displayName || event.name || 'Anonym';
  const amount = event.amount || 0;
  const currency = event.currency || 'CZK';
  const message = event.message || '';
  
  console.log('💰 Tip event:', { username, amount, currency, message: message.substring(0, 50) });
  
  let amountCzk = amount;
  if (currency === 'USD') amountCzk = amount * 23;
  if (currency === 'EUR') amountCzk = amount * 25;
  if (currency === 'GBP') amountCzk = amount * 29;
  
  saveEventToHistory({
    type: 'donation',
    username: username,
    amount: amountCzk,
    amountOriginal: amount,
    currency: currency,
    message: message,
    timestamp: Date.now(),
    addedMinutes: Math.floor((amountCzk / 100) * 15)
  });
  
  addTimeForDonate(amountCzk);
  updateTopDonors(username, amountCzk);
  updateTotalMoney();
}

// ===== DATA STORAGE FUNCTIONS =====
function saveEventToHistory(event) {
  try {
    let events = JSON.parse(localStorage.getItem('fufathon_events') || '[]');
    events.unshift(event);
    if (events.length > 50) events = events.slice(0, 50);
    localStorage.setItem('fufathon_events', JSON.stringify(events));
    
    updateActivityFeed(events);
    console.log('💾 Událost uložena:', event.type);
  } catch (error) {
    console.error('❌ Chyba při ukládání události:', error);
  }
}

function updateTopDonors(username, amount) {
  try {
    let donors = JSON.parse(localStorage.getItem('fufathon_donors') || '[]');
    
    const existingIndex = donors.findIndex(d => d.username === username);
    if (existingIndex >= 0) {
      donors[existingIndex].total += amount;
      donors[existingIndex].addedMinutes += Math.floor((amount / 100) * 15);
    } else {
      donors.push({
        username: username,
        total: amount,
        addedMinutes: Math.floor((amount / 100) * 15)
      });
    }
    
    donors.sort((a, b) => b.total - a.total);
    if (donors.length > 20) donors = donors.slice(0, 20);
    
    localStorage.setItem('fufathon_donors', JSON.stringify(donors));
    updateTopDonorsTable(donors);
    console.log('🏆 Donátor aktualizován:', username, amount + ' Kč');
  } catch (error) {
    console.error('❌ Chyba při aktualizaci donátorů:', error);
  }
}

function updateSubCount(tier, count = 1) {
  try {
    let subs = JSON.parse(localStorage.getItem('fufathon_subs') || '{"t1":0,"t2":0,"t3":0,"total":0}');
    subs[`t${tier}`] += count;
    subs.total += count;
    localStorage.setItem('fufathon_subs', JSON.stringify(subs));
    
    // Ulož čas při každém subu
    localStorage.setItem('subathonEndTime', subathonEndTime.getTime());
    
    updateSubsDisplay(subs);
    console.log('⭐ Suby aktualizovány:', subs);
  } catch (error) {
    console.error('❌ Chyba při aktualizaci subů:', error);
  }
}

// ===== UI UPDATE FUNCTIONS =====
function updateActivityFeed(events) {
  const feed = $("#feed");
  if (!feed) return;
  
  const feedHTML = events.slice(0, 10).map(event => {
    const time = new Date(event.timestamp).toLocaleTimeString("cs-CZ", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
    
    let icon = "⚡";
    let text = "";
    let amount = `+${event.addedMinutes || 0} min`;
    
    switch (event.type) {
      case 'donation':
        icon = "💰";
        text = `Donate ${formatKc(event.amount)} Kč od ${event.username}`;
        if (event.message) text += `: "${event.message.substring(0, 30)}${event.message.length > 30 ? '...' : ''}"`;
        break;
      case 'sub':
        icon = "⭐";
        text = `${event.username} si pořídil sub (T${event.tier})`;
        if (event.message) text += `: "${event.message.substring(0, 30)}${event.message.length > 30 ? '...' : ''}"`;
        break;
      case 'resub':
        icon = "🔁";
        text = `${event.username} resub (${event.months} měs.)`;
        if (event.message) text += `: "${event.message.substring(0, 30)}${event.message.length > 30 ? '...' : ''}"`;
        break;
      case 'gift':
        icon = "🎁";
        text = `${event.gifter} daroval ${event.count}× sub${event.recipient ? ` pro ${event.recipient}` : ''}`;
        break;
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

function updateTopDonorsTable(donors) {
  const tbody = $("#topTableBody");
  if (!tbody) return;
  
  const top5 = donors.slice(0, 5);
  
  const rowsHTML = top5.map((donor, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><strong>${donor.username}</strong></td>
      <td>${formatKc(donor.total)} Kč</td>
      <td>+${donor.addedMinutes || 0} min</td>
    </tr>
  `).join('');
  
  tbody.innerHTML = rowsHTML || `
    <tr>
      <td colspan="4" class="mutedCell">
        Zatím žádní dárci... buď první! 💜
      </td>
    </tr>
  `;
}

function updateSubsDisplay(subs) {
  $("#subsTotal").textContent = subs.total || 0;
  $("#subsBreak").textContent = `${subs.t1 || 0} / ${subs.t2 || 0} / ${subs.t3 || 0}`;
  $("#subGoalHeader").textContent = `${subs.total || 0} / ${SUB_GOAL_TOTAL} subs`;
  
  renderSubGoals(subs.total);
}

function updateTotalMoney() {
  try {
    const donors = JSON.parse(localStorage.getItem('fufathon_donors') || '[]');
    const totalMoney = donors.reduce((sum, donor) => sum + (donor.total || 0), 0);
    
    $("#money").textContent = `${formatKc(totalMoney)} Kč`;
    $("#moneySmall").textContent = `${formatKc(totalMoney)} / ${formatKc(GOAL_TOTAL)} Kč`;
    $("#goalHeader").textContent = `${formatKc(totalMoney)} / ${formatKc(GOAL_TOTAL)} Kč`;
    
    renderGoals(totalMoney);
    
    console.log('💰 Celkové peníze:', totalMoney + ' Kč');
    return totalMoney;
  } catch (error) {
    console.error('❌ Chyba při výpočtu peněz:', error);
    return 0;
  }
}

// ===== LOAD FROM LOCALSTORAGE ONLY =====
function loadFromLocalStorageOnly() {
  try {
    console.log('📊 Načítám data POUZE z localStorage...');
    
    const donors = JSON.parse(localStorage.getItem('fufathon_donors') || '[]');
    const events = JSON.parse(localStorage.getItem('fufathon_events') || '[]');
    const subs = JSON.parse(localStorage.getItem('fufathon_subs') || '{"t1":0,"t2":0,"t3":0,"total":0}');
    
    // NAČTI ULOŽENÝ ČAS
    const savedEndTime = localStorage.getItem('subathonEndTime');
    if (savedEndTime) {
      subathonEndTime = new Date(Number(savedEndTime));
      console.log('🕒 Čas obnoven z localStorage:', subathonEndTime.toLocaleString());
    
    updateTopDonorsTable(donors);
    updateActivityFeed(events);
    updateSubsDisplay(subs);
    updateTotalMoney();
    
    console.log('✅ Data načtena z localStorage:', {
      t1: subs.t1,
      t2: subs.t2,
      t3: subs.t3,
      total: subs.total,
      donors: donors.length,
      events: events.length
    });
    
  } catch (error) {
    console.error('❌ Chyba při načítání z localStorage:', error);
  }
}

  document.body.appendChild(testPanel);
  console.log('✅ Testovací panel přidán');
}

function testDonate(amount, username = 'TEST_USER') {
  console.log(`🧪 TEST Donate: ${amount} Kč od ${username}`);
  
  const minutes = Math.floor((amount / 100) * 15);
  addMinutesToSubathon(minutes);
  
  saveEventToHistory({
    type: 'donation',
    username: username,
    amount: amount,
    currency: 'CZK',
    message: 'Testovací donate',
    timestamp: Date.now(),
    addedMinutes: minutes
  });
  
  updateTopDonors(username, amount);
  updateTotalMoney();
  showTimeAddedNotification(minutes);
  
  console.log(`✅ Přidáno ${minutes} minut`);
}

function testSub(tier, username = 'SUB_USER') {
  console.log(`🧪 TEST Sub: T${tier} od ${username}`);
  
  const minutes = SUB_MINUTES[tier] || 10;
  addMinutesToSubathon(minutes);
  
  saveEventToHistory({
    type: 'sub',
    username: username,
    tier: tier,
    months: 1,
    message: 'Testovací sub',
    timestamp: Date.now(),
    addedMinutes: minutes
  });
  
  updateSubCount(tier);
  showTimeAddedNotification(minutes);
  
  console.log(`✅ Přidáno ${minutes} minut`);
}

function testGiftSub(tier, count, gifter = 'GIFTER_USER') {
  console.log(`🧪 TEST Gift Sub: ${count}× T${tier} od ${gifter}`);
  
  const minutes = (SUB_MINUTES[tier] || 10) * count;
  addMinutesToSubathon(minutes);
  
  saveEventToHistory({
    type: 'gift',
    gifter: gifter,
    recipient: 'Komunita',
    tier: tier,
    count: count,
    timestamp: Date.now(),
    addedMinutes: minutes
  });
  
  updateSubCount(tier, count);
  showTimeAddedNotification(minutes);
  
  console.log(`✅ Přidáno ${minutes} minut`);
}

function resetTestData() {
  if (confirm('Opravdu chceš smazat všechna testovací data?')) {
    localStorage.removeItem('fufathon_events');
    localStorage.removeItem('fufathon_donors');
    localStorage.removeItem('fufathon_subs');
    localStorage.removeItem('subathonEndTime');
    
    updateActivityFeed([]);
    updateTopDonorsTable([]);
    updateSubsDisplay({t1: 0, t2: 0, t3: 0, total: 0});
    updateTotalMoney();
    
    alert('✅ Testovací data smazána!');
  }
}

// ===== INITIALIZATION =====
function initDashboard() {
  initTheme();
  
  const style = document.createElement('style');
  style.textContent = `
    .time-added-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #7b2ff7, #f107a3);
      color: white;
      padding: 15px 20px;
      border-radius: 12px;
      z-index: 9999;
      box-shadow: 0 5px 20px rgba(123, 47, 247, 0.5);
      animation: slideIn 0.5s ease-out;
      font-family: inherit;
      max-width: 300px;
    }
    
    .notification-content {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    .fade-out {
      animation: fadeOut 0.5s ease-out forwards;
    }
    
    @keyframes fadeOut {
      to { opacity: 0; transform: translateY(-20px); }
    }
  `;
  document.head.appendChild(style);
  
  updateTimers();
  
  // ✅ DŮLEŽITÉ: Načti data POUZE z localStorage
  loadFromLocalStorageOnly();
  
  connectStreamElements();
  addManualTestButtons();
  
  // ⚠️ VYPNUTO auto-refresh z API
  setInterval(updateTimers, 1000);
  
  console.log('🚀 Dashboard inicializován! (pouze localStorage)');
}

// ===== START =====
document.addEventListener("DOMContentLoaded", initDashboard);
