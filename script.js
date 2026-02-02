// StreamElements Socket.io connection
const initStreamElements = () => {
  const channelId = "5ba7c85667166d9150b406fe";
  
  // Připojení k SE socketu
  const socket = io('https://realtime.streamelements.com', {
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log('✅ Connected to StreamElements');
    socket.emit('authenticate', {
      method: 'token',
      token: localStorage.getItem('overlayToken') // Token z localStorage
    });
  });

  socket.on('authenticated', () => {
    console.log('✅ Authenticated with StreamElements');
    socket.emit('join', `channel:${channelId}`);
  });

  // Posloucháme tips
  socket.on('event', (data) => {
    if (data.type === 'tip') {
      console.log('💰 New tip:', data);
      updateDashboardWithLiveData(data);
    }
    if (data.type === 'subscriber') {
      console.log('🎮 New sub:', data);
      updateDashboardWithLiveData(data);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from StreamElements');
  });
};

// Přidat na konec DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // ... tvůj existující kód ...
  
  // Přidat StreamElements připojení
  initStreamElements();
});


/* FUFATHON Dashboard — FINÁLNÍ VERZE */

(function () {
  // ========= KONFIGURACE =========
  const API_URL = "https://fufathon-api.pajujka191.workers.dev";
  const START_AT = new Date("2026-02-09T14:00:00+01:00");
  const THEME_KEY = "fufathon-theme";
  const POLL_MS = 10000; // 10 sekund

  // ========= GOALS =========
  const DONATE_GOALS = [
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
    { amount: 65000, icon: "😂", title: "Try Not To Laugh" },
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
    { amount: 160000, icon: "🎨", title: "Zažitkové ART studio" },
    { amount: 170000, icon: "🐴", title: "Jízda na koni" },
    { amount: 180000, icon: "⛰️", title: "Výšlap na Lysou horu" },
    { amount: 190000, icon: "✏️", title: "Tetování" },
    { amount: 200000, icon: "🏙️", title: "Víkend v Praze" }
  ];

  const SUB_GOALS = [
    { amount: 100, icon: "🍳", title: "Snídaně podle chatu" },
    { amount: 200, icon: "💄", title: "Make-up challenge" },
    { amount: 300, icon: "👗", title: "Outfit vybíráte vy" },
    { amount: 400, icon: "⚖️", title: "Kontrola váhy od teď" },
    { amount: 500, icon: "⚔️", title: "1v1 s chatem" },
    { amount: 600, icon: "🎮", title: "Vybíráte hru na hlavní blok dne" },
    { amount: 700, icon: "👑", title: "Rozhoduje chat o dni" },
    { amount: 800, icon: "✨", title: "Něco extra (800 subs)" },
    { amount: 1000, icon: "🏎️", title: "Jízda ve sporťáku" }
  ];

  // ========= HELPERS =========
  const $ = (id) => document.getElementById(id);
  function pad(n) { return String(n).padStart(2, "0"); }
  function formatKc(n) { return Number(n || 0).toLocaleString("cs-CZ"); }

  // ========= TÉMA =========
  function initTheme() {
    const btn = $("themeBtn");
    const icon = $("themeIcon");
    const text = $("themeText");
    if (!btn) return;

    const root = document.documentElement;

    function apply(theme) {
      root.setAttribute("data-theme", theme);
      if (icon) icon.textContent = theme === "light" ? "☀️" : "🌙";
      if (text) text.textContent = theme === "light" ? "Den" : "Noc";
    }

    const saved = localStorage.getItem(THEME_KEY);
    apply(saved === "light" ? "light" : "dark");

    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, next);
      apply(next);
    });
  }

  // ========= TIMER =========
  function initTimer() {
    const el = $("timeRunning");
    if (!el) return;

    function updateTimer() {
      const now = new Date();
      const diff = now - START_AT;
      if (diff < 0) {
        el.textContent = "00:00:00";
        return;
      }
      
      const seconds = Math.floor(diff / 1000);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      el.textContent = `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  // ========= API =========
  async function fetchData() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) return null;
      const data = await response.json();
      return data.success === false ? null : data;
    } catch (error) {
      console.error("API error:", error);
      return null;
    }
  }

  // ========= RENDER GOALS =========
  function renderDonateGoals(money) {
    const body = $("goalTableBody");
    if (!body) return;
    
    body.innerHTML = "";
    
    DONATE_GOALS.forEach(goal => {
      const done = money >= goal.amount;
      const tr = document.createElement("tr");
      tr.className = "goal-tr" + (done ? " done" : "");
      tr.innerHTML = `
        <td class="goal-check">${done ? "✅" : "⬜"}</td>
        <td class="goal-name">${goal.icon} ${goal.title}</td>
        <td class="goal-threshold">${formatKc(goal.amount)} Kč</td>
      `;
      body.appendChild(tr);
    });
  }

  function renderSubGoals(subs) {
    const body = $("subGoalTableBody");
    if (!body) return;
    
    body.innerHTML = "";
    
    SUB_GOALS.forEach(goal => {
      const done = subs >= goal.amount;
      const tr = document.createElement("tr");
      tr.className = "goal-tr" + (done ? " done" : "");
      tr.innerHTML = `
        <td class="goal-check">${done ? "✅" : "⬜"}</td>
        <td class="goal-name">${goal.icon} ${goal.title}</td>
        <td class="goal-threshold">${goal.amount} subs</td>
      `;
      body.appendChild(tr);
    });
  }

  // ========= TOP 5 DONÁTORŮ =========
  function renderTopDonators(list) {
    const body = $("topTableBody");
    if (!body) return;

    body.innerHTML = "";
    
    if (!list || list.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4" class="muted">Zatím žádné donaty ✨</td>`;
      body.appendChild(tr);
      return;
    }

    list.slice(0, 5).forEach((donor, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${donor.name}</td>
        <td>${formatKc(donor.amount)} Kč</td>
        <td>${Math.round(donor.amount * 0.15)} min</td>
      `;
      body.appendChild(tr);
    });
  }

  // ========= 10 POSLEDNÍCH AKCÍ =========
  function renderRecentActivity(activities) {
    const feed = $("feed");
    if (!feed) return;

    feed.innerHTML = "";
    
    if (!activities || activities.length === 0) {
      const div = document.createElement("div");
      div.className = "activity-item muted";
      div.textContent = "Zatím nic nového…";
      feed.appendChild(div);
      return;
    }

    activities.slice(0, 10).forEach(activity => {
      const div = document.createElement("div");
      div.className = "activity-item";
      div.innerHTML = `
        <span class="activity-time">${activity.time}</span>
        <span class="activity-text">${activity.text}</span>
      `;
      feed.appendChild(div);
    });
  }

  // ========= HLAVNÍ UPDATE =========
  async function updateDashboard() {
    const data = await fetchData();
    
    if (data) {
      const money = data.money || 0;
      const subs = data.subs || 0;
      
      // Aktualizovat čísla
      if ($("money")) $("money").textContent = `${formatKc(money)} Kč`;
      if ($("moneySmall")) $("moneySmall").textContent = `${formatKc(money)} / 200 000 Kč`;
      if ($("subsTotal")) $("subsTotal").textContent = subs;
      if ($("subGoalHeader")) $("subGoalHeader").textContent = `${subs} / 1000 subs`;
      if ($("goalHeader")) $("goalHeader").textContent = `${formatKc(money)} / 200 000 Kč`;
      
      // Renderovat
      renderDonateGoals(money);
      renderSubGoals(subs);
      renderTopDonators(data.topDonators);
      renderRecentActivity(data.recentActivity);
      
      console.log("✅ Aktualizováno:", { money, subs });
    }
  }

  // ========= START =========
  document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 FUFATHON Dashboard startuje...");
    
    // Inicializace
    initTheme();
    initTimer();
    
    // První načtení
    updateDashboard();
    
    // Auto-update každých 10s
    setInterval(updateDashboard, POLL_MS);
    
    // Pro ruční update
    window.refreshDashboard = updateDashboard;
  });

})();
