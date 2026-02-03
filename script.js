(function () {
  // 🔗 TVŮJ WORKER API
  const API_BASE_URL = "https://subathon-api.pajujka191.workers.dev";

  // ⏰ ČASOVAČ
  const POLL_MS = 10000; // Aktualizace každých 10 sekund
  const START_AT = new Date("2026-02-09T14:00:00+01:00");

  // 🎯 GOALS (Tvůj původní seznam - zachováno!)
  const DONATE_GOALS = [
    { amount: 5000, title: "🎬 Movie night" },
    { amount: 10000, title: "😏 Q&A bez cenzury" },
    { amount: 15000, title: "👻 Horror Night" },
    { amount: 20000, title: "🍔 Jídlo podle chatu" },
    { amount: 25000, title: "🤡 Kostým stream" },
    { amount: 30000, title: "💃 Just Dance" },
    { amount: 35000, title: "🧱 Lego" },
    { amount: 40000, title: "🍣 Asijská ochutnávka" },
    { amount: 45000, title: "⛏️ Minecraft SpeedRun DUO" },
    { amount: 50000, title: "🎤 Karaoke stream" },
    { amount: 55000, title: "🔫 Battle Royale Challenge" },
    { amount: 60000, title: "🎳 Bowling" },
    { amount: 65000, title: "😂 Try Not To Laugh" },
    { amount: 70000, title: "👣 Běžecký pás" },
    { amount: 75000, title: "🍹 Drunk Stream" },
    { amount: 80000, title: "🧍‍♀️ 12h Stream ve stoje" },
    { amount: 85000, title: "🕹️ Split Fiction w/ Juraj" },
    { amount: 90000, title: "🎁 Mystery box opening" },
    { amount: 95000, title: "🏆 Turnaj v LoLku" },
    { amount: 100000, title: "🎉 Stodolní ve stylu" },
    { amount: 110000, title: "🏎️ Motokáry" },
    { amount: 120000, title: "🎧 ASMR stream" },
    { amount: 125000, title: "⚡ Bolt Tower" },
    { amount: 130000, title: "🥶 Otužování" },
    { amount: 140000, title: "⛳ MiniGolf" },
    { amount: 150000, title: "🫧 Vířivka" },
    { amount: 160000, title: "🎨 Zažitkové ART studio" },
    { amount: 170000, title: "🐴 Jízda na koni" },
    { amount: 180000, title: "⛰️ Výšlap na Lysou horu" },
    { amount: 190000, title: "✏️ Tetování" },
    { amount: 200000, title: "🏙️ Víkend v Praze" }
  ];

  const SUB_GOALS = [
    { amount: 100, title: "🍳 Snídaně podle chatu" },
    { amount: 200, title: "💄 Make-up challenge" },
    { amount: 300, title: "👗 Outfit vybíráte vy" },
    { amount: 400, title: "⚖️ Kontrola váhy od teď" },
    { amount: 500, title: "⚔️ 1v1 s chatem" },
    { amount: 600, title: "🎮 Vybíráte hru na hlavní blok dne" },
    { amount: 700, title: "👑 Rozhoduje o dni" },
    { amount: 800, title: "🍽️ Luxusní restaurace v Ostravě" },
    { amount: 900, title: "🏆 Turnaj ve Fortnite" },
    { amount: 1000, title: "🏎️ Jízda ve sporťáku" }
  ];

  // 🛠️ POMOCNÉ FUNKCE
  const $ = id => document.getElementById(id);
  const kc = n => Number(n || 0).toLocaleString("cs-CZ");
  const pad = n => String(n).padStart(2, "0");

// 🌙 PŘEPÍNÁNÍ DEN/NOC - OPRAVENO s debugem
function setupThemeToggle() {
  const themeBtn = document.getElementById('themeBtn');
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');
  
  if (!themeBtn) return;
  
  themeBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    console.log('🔁 Přepínám z', currentTheme, 'na', newTheme);
    
    // Nastav data-theme na <html>
    html.setAttribute('data-theme', newTheme);
    
    // Aktualizuj tlačítko
    const isLight = newTheme === 'light';
    themeIcon.textContent = isLight ? '🌙' : '☀️';
    themeText.textContent = isLight ? 'Noc' : 'Den';
    
    // TEST: Ručně změň barvu pozadí
    if (newTheme === 'light') {
      document.body.style.backgroundColor = '#f8f7ff';
      document.body.style.color = 'rgba(25, 15, 38, 0.95)';
    } else {
      document.body.style.backgroundColor = '#0a0714';
      document.body.style.color = 'rgba(255, 255, 255, 0.95)';
    }
    
    // Ulož do localStorage
    localStorage.setItem('theme', newTheme);
  });

  // Načtení uloženého tématu
  const savedTheme = localStorage.getItem('theme') || 'dark';
  console.log('📂 Načítám téma:', savedTheme);
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Ruční nastavení při načtení
  if (savedTheme === 'light') {
    document.body.style.backgroundColor = '#f8f7ff';
    document.body.style.color = 'rgba(25, 15, 38, 0.95)';
  }
  
  // Aktualizace tlačítka
  const isLight = savedTheme === 'light';
  if (themeIcon) themeIcon.textContent = isLight ? '🌙' : '☀️';
  if (themeText) themeText.textContent = isLight ? 'Noc' : 'Den';
}

  // ⏰ TIMER FUNKCE (Upraveno!)
  function updateTimer() {
    const now = new Date();
    const diff = now - START_AT;
    
    if (diff < 0) {
      // Pokud ještě nezačalo, ukážeme odpočet DO začátku
      const secondsToStart = Math.floor(-diff / 1000);
      const hours = pad(Math.floor(secondsToStart / 3600));
      const minutes = pad(Math.floor((secondsToStart % 3600) / 60));
      const seconds = pad(secondsToStart % 60);
      $("timeRunning").textContent = `-${hours}:${minutes}:${seconds}`;
      $("timeRunning").style.color = "#ff6b6b"; // Červená pro odpočet
    } else {
      // Normální běžící čas
      const seconds = Math.floor(diff / 1000);
      const hours = pad(Math.floor(seconds / 3600));
      const minutes = pad(Math.floor((seconds % 3600) / 60));
      const secs = pad(seconds % 60);
      $("timeRunning").textContent = `${hours}:${minutes}:${secs}`;
      $("timeRunning").style.color = ""; // Výchozí barva
    }
  }

  // 📊 NAČTENÍ DAT Z WORKER API
  async function loadDashboardData() {
    try {
      const response = await fetch(`${API_BASE_URL}/data`);
      if (!response.ok) throw new Error(`API odpovědělo s ${response.status}`);
      
      const data = await response.json();
      
      // Získání hodnot
      const money = data.total?.donation || 0;
      const subs = data.total?.subs || 0;
      
      // Aktualizace UI
      updateUI(money, subs);
      renderTopDonors(data.topDonors || []);
      renderLatestActions(data.latestActions || []);
      
    } catch (error) {
      console.error("❌ Chyba při načítání dat:", error);
      // Fallback na prázdná data
      updateUI(0, 0);
      renderTopDonors([]);
      renderLatestActions([]);
    }
  }

  // 🖥️ AKTUALIZACE UI
  function updateUI(money, subs) {
    // Aktualizace číselných hodnot
    if ($("money")) $("money").textContent = kc(money) + " Kč";
    if ($("moneySmall")) $("moneySmall").textContent = `${kc(money)} / 200 000 Kč`;
    if ($("subsTotal")) $("subsTotal").textContent = subs;
    if ($("goalHeader")) $("goalHeader").textContent = `${kc(money)} / 200 000 Kč`;
    if ($("subGoalHeader")) $("subGoalHeader").textContent = `${subs} / 1000 subs`;
    
    // Vykreslení goals
    renderDonateGoals(money);
    renderSubGoals(subs);
  }

  // 🎯 RENDER GOALS (Tvůj původní kód)
  function renderDonateGoals(money) {
    const body = $("goalTableBody");
    if (!body) {
      console.warn("⚠️ Element #goalTableBody nebyl nalezen!");
      return;
    }
    
    body.innerHTML = "";
    DONATE_GOALS.forEach(g => {
      const isDone = money >= g.amount;
      body.innerHTML += `
        <tr class="goal-tr ${isDone ? "done" : ""}">
          <td class="goal-check">${isDone ? "✅" : "⬜"}</td>
          <td class="goal-name">${g.title}</td>
          <td class="goal-threshold">${kc(g.amount)} Kč</td>
        </tr>`;
    });
  }

  function renderSubGoals(subs) {
    const body = $("subGoalTableBody");
    if (!body) {
      console.warn("⚠️ Element #subGoalTableBody nebyl nalezen!");
      return;
    }
    
    body.innerHTML = "";
    SUB_GOALS.forEach(g => {
      const isDone = subs >= g.amount;
      body.innerHTML += `
        <tr class="goal-tr ${isDone ? "done" : ""}">
          <td class="goal-check">${isDone ? "✅" : "⬜"}</td>
          <td class="goal-name">${g.title}</td>
          <td class="goal-threshold">${g.amount} subs</td>
        </tr>`;
    });
  }

  // 🏆 TOP DONOŘI
  function renderTopDonors(donors) {
    const body = $("topTableBody");
    if (!body) {
      console.warn("⚠️ Element #topTableBody nebyl nalezen!");
      return;
    }
    
    body.innerHTML = "";
    
    if (!donors.length) {
      body.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;color:#888;">Zatím žádní dárci ✨</td></tr>`;
      return;
    }
    
    donors.slice(0, 5).forEach((d, i) => {
      const addedTime = Math.round(d.amount * 0.15); // 100 Kč = +15 min
      body.innerHTML += `
        <tr>
          <td><strong>#${i + 1}</strong></td>
          <td>${d.name || "Anonym"}</td>
          <td>${kc(d.amount)} Kč</td>
          <td>+${addedTime} min</td>
        </tr>`;
    });
  }

  // 📝 POSLEDNÍ AKCE
  function renderLatestActions(actions) {
    const feed = $("feed");
    if (!feed) {
      console.warn("⚠️ Element #feed nebyl nalezen!");
      return;
    }
    
    feed.innerHTML = "";
    
    if (!actions.length) {
      feed.innerHTML = `<div style="text-align:center;padding:20px;color:#888;">Zatím žádné akce…</div>`;
      return;
    }
    
    actions.slice(0, 10).forEach(e => {
      const icon = e.type === "donation" ? "💰" : "🎮";
      const actionText = e.type === "donation" ? "Donoval" : "Nový předplatitel";
      const timeText = e.addedTime ? `+${e.addedTime} min` : "";
      const time = e.timestamp ? new Date(e.timestamp).toLocaleTimeString("cs-CZ", { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : "právě teď";
      
      feed.innerHTML += `
        <div class="activity-item">
          <span class="activity-time">${time}</span>
          <span class="activity-icon">${icon}</span>
          <span class="activity-name">${e.name || "Anonym"}</span>
          <span class="activity-action">${actionText} ${kc(e.amount)} Kč</span>
          <span class="activity-added">${timeText}</span>
        </div>`;
    });
  }

  // 🚀 INICIALIZACE
  document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 FUFATHON Dashboard se spouští...");
    
    // 1. Nastavení přepínání tématu (OPRAVENO)
    setupThemeToggle();
    
    // 2. Spuštění timeru
    updateTimer();
    
    // 3. Načtení dat
    loadDashboardData();
    
    // 4. Pravidelné aktualizace
    setInterval(updateTimer, 1000);
    setInterval(loadDashboardData, POLL_MS);
    
    // 5. Test připojení k Workeru
    fetch(`${API_BASE_URL}/data`)
      .then(r => r.json())
      .then(data => console.log("✅ Worker API připojeno, data:", data))
      .catch(err => console.error("❌ Nelze připojit k Worker API:", err));
  });

})();
