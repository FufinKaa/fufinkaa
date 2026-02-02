(function () {

  // TVŮJ NOVÝ WORKER API (nahraď svou adresou!)
  const API_BASE_URL = "https://subathon-api.pajujka191.workers.dev";
  
  // Zachováváme tvůj původní timer
  const POLL_MS = 10000;
  const START_AT = new Date("2026-02-09T14:00:00+01:00");

  // TVÉ GOALS ZŮSTÁVAJÍ - neměň!
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

  // Helper funkce zůstávají
  const $ = id => document.getElementById(id);
  const kc = n => Number(n || 0).toLocaleString("cs-CZ");

  // -----------------------------------------------------------------
  // NOVÁ FUNKCE: Načítání dat z tvého Worker API
  // -----------------------------------------------------------------
  async function loadDashboardData() {
    try {
      const response = await fetch(`${API_BASE_URL}/data`);
      const data = await response.json();
      
      // Získání peněz a subs z nového API
      const money = data.total.donation || 0;
      const subs = data.total.subs || 0;
      
      // Aktualizace UI
      updateUI(money, subs);
      
      // Zobrazení posledních akcí (nový formát)
      renderLatestActions(data.latestActions || []);
      
      // Zobrazení TOP 5 donátorů (nový formát)
      renderTopDonors(data.topDonors || []);
      
    } catch (error) {
      console.error("Chyba při načítání dat:", error);
      // Fallback na prázdná data
      updateUI(0, 0);
      renderLatestActions([]);
      renderTopDonors([]);
    }
  }

  // -----------------------------------------------------------------
  // FUNKCE PRO AKTUALIZACI UI (částečně z tvého původního kódu)
  // -----------------------------------------------------------------
  function updateUI(money, subs) {
    // Tvé původní aktualizace
    $("money").textContent = kc(money) + " Kč";
    $("moneySmall").textContent = `${kc(money)} / 200 000 Kč`;
    $("subsTotal").textContent = subs;
    $("goalHeader").textContent = `${kc(money)} / 200 000 Kč`;
    $("subGoalHeader").textContent = `${subs} / 1000 subs`;
    
    // Tvé původní funkce pro goals - ZŮSTÁVAJÍ!
    renderDonateGoals(money);
    renderSubGoals(subs);
  }

  // -----------------------------------------------------------------
  // TVÉ PŮVODNÍ FUNKCE PRO GOALS - NEMĚNÍME!
  // -----------------------------------------------------------------
  function renderDonateGoals(money) {
    const body = $("goalTableBody");
    if (!body) return;
    body.innerHTML = "";
    DONATE_GOALS.forEach(g => {
      body.innerHTML += `
        <tr class="goal-tr ${money >= g.amount ? "done" : ""}">
          <td class="goal-check">${money >= g.amount ? "✅" : "⬜"}</td>
          <td class="goal-name">${g.title}</td>
          <td class="goal-threshold">${kc(g.amount)} Kč</td>
        </tr>`;
    });
  }

  function renderSubGoals(subs) {
    const body = $("subGoalTableBody");
    if (!body) return;
    body.innerHTML = "";
    SUB_GOALS.forEach(g => {
      body.innerHTML += `
        <tr class="goal-tr ${subs >= g.amount ? "done" : ""}">
          <td class="goal-check">${subs >= g.amount ? "✅" : "⬜"}</td>
          <td class="goal-name">${g.title}</td>
          <td class="goal-threshold">${g.amount} subs</td>
        </tr>`;
    });
  }

  // -----------------------------------------------------------------
  // UPRAVENÉ FUNKCE PRO TOP DONORY A POSLEDNÍ AKCE
  // -----------------------------------------------------------------
  function renderTopDonors(donors) {
    const body = $("topTableBody");
    if (!body) return;
    
    body.innerHTML = "";
    if (!donors.length) {
      body.innerHTML = `<tr><td colspan="4">Zatím nic ✨</td></tr>`;
      return;
    }
    
    donors.slice(0, 5).forEach((d, i) => {
      // Nový formát: {name: "Jméno", amount: 1000}
      const addedTime = Math.round(d.amount * 0.15); // 100 Kč = +15 min
      body.innerHTML += `
        <tr>
          <td>${i + 1}</td>
          <td>${d.name || "Anon"}</td>
          <td>${kc(d.amount)} Kč</td>
          <td>${addedTime} min</td>
        </tr>`;
    });
  }

  function renderLatestActions(actions) {
    const feed = $("feed");
    if (!feed) return;
    
    feed.innerHTML = "";
    if (!actions.length) {
      feed.innerHTML = `<div class="activity-item muted">Zatím nic…</div>`;
      return;
    }
    
    actions.slice(0, 10).forEach(e => {
      // Nový formát akcí
      const icon = e.type === "donation" ? "💰" : "🎮";
      const actionText = e.type === "donation" ? "Donoval" : "Nový předplatitel";
      const timeText = e.addedTime ? `+${e.addedTime} min` : "";
      
      feed.innerHTML += `
        <div class="activity-item">
          <span>${icon} ${e.name || "Anon"}</span>
          <span class="activity-action">${actionText} ${kc(e.amount)} Kč</span>
          <span class="activity-time">${timeText}</span>
        </div>`;
    });
  }

  // -----------------------------------------------------------------
  // TVŮJ PŮVODNÍ TIMER - NEMĚNÍME!
  // -----------------------------------------------------------------
  function updateTimer() {
    const diff = new Date() - START_AT;
    if (diff < 0) return;
    const s = Math.floor(diff / 1000);
    $("timeRunning").textContent =
      `${Math.floor(s / 3600)}:${Math.floor(s % 3600 / 60)}:${s % 60}`;
  }

  // -----------------------------------------------------------------
  // INICIALIZACE
  // -----------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    // Načtení dat z tvého nového Worker API
    loadDashboardData();
    updateTimer();
    
    // Pravidelná aktualizace
    setInterval(loadDashboardData, POLL_MS);
    setInterval(updateTimer, 1000);
  });

})();

