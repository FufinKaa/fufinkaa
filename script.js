/* FUFATHON Dashboard — KOMPLETNÍ S VŠEMI GOALS */

(function () {
  // ========= API KONFIGURACE =========
  const API_URL = "https://fufathon-api.pajujka191.workers.dev";
  const START_AT = new Date("2026-02-09T14:00:00+01:00");
  const THEME_KEY = "fufathon-theme";
  const POLL_MS = 10000; // Aktualizace každých 10 sekund

  // ========= VŠECHNY DONATEGOALS Z OBRÁZKU =========
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

  // ========= SUBGOALS Z OBRÁZKU =========
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

  // ========= PROMĚNNÉ =========
  let currentMoney = 0;
  let currentSubs = 0;

  // ========= HELPERS =========
  const $ = (id) => document.getElementById(id);

  function pad(n) { return String(n).padStart(2, "0"); }
  function formatKc(n) { return Number(n || 0).toLocaleString("cs-CZ"); }

  function msToClock(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${pad(h)}:${pad(m)}:${pad(sec)}`;
  }

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

  // ========= ČASOVAČ =========
  function initRunningTimer() {
    const el = $("timeRunning");
    const info = $("startedAtText");
    if (!el) return;

    const tick = () => {
      el.textContent = msToClock(Date.now() - START_AT.getTime());
      if (info) info.textContent = "Start: 09. 02. 2026 14:00";
    };

    tick();
    setInterval(tick, 1000);
  }

  // ========= NAČTENÍ DAT Z API =========
  async function fetchData() {
    try {
      console.log("🔄 Načítám data z API...");
      const response = await fetch(API_URL, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`❌ API error: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.success === false) {
        console.error("❌ API vrátilo chybu:", data.error);
        return null;
      }
      
      console.log("✅ Data načtena:", {
        money: data.money + " Kč",
        subs: data.subs,
        donors: data.topDonators?.length || 0,
        activities: data.recentActivity?.length || 0
      });
      return data;
      
    } catch (error) {
      console.error("❌ Chyba při načítání dat:", error.message);
      return null;
    }
  }

  // ========= RENDEROVÁNÍ GOALS =========
  function renderDonateGoals() {
    const body = $("goalTableBody");
    if (!body) return;
    
    body.innerHTML = "";
    
    DONATE_GOALS.forEach(goal => {
      const done = currentMoney >= goal.amount;
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

  function renderSubGoals() {
    const body = $("subGoalTableBody");
    if (!body) return;
    
    body.innerHTML = "";
    
    SUB_GOALS.forEach(goal => {
      const done = currentSubs >= goal.amount;
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

  // ========= TOP DONÁTOŘI =========
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

    list.forEach((donor, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td class="donor-name">${donor.name}</td>
        <td class="donor-amount">${formatKc(donor.amount)} Kč</td>
        <td class="donor-time">${Math.round(donor.amount * 0.15)} min</td>
      `;
      body.appendChild(tr);
    });
  }

  // ========= POSLEDNÍ AKCE =========
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

    activities.forEach(activity => {
      const div = document.createElement("div");
      div.className = "activity-item";
      div.innerHTML = `
        <span class="activity-time">${activity.time}</span>
        <span class="activity-text">${activity.text}</span>
      `;
      feed.appendChild(div);
    });
  }

  // ========= VÝPOČET PROGRESU =========
  function calculateProgress() {
    // Celkové maximum pro donategoal
    const totalGoal = 200000;
    const moneyProgress = Math.min(100, (currentMoney / totalGoal) * 100);
    
    // Celkové maximum pro subgoal
    const subGoal = 1000;
    const subProgress = Math.min(100, (currentSubs / subGoal) * 100);
    
    return { moneyProgress, subProgress };
  }

  // ========= AKTUALIZACE DASHBOARDU =========
  async function updateDashboard() {
    console.log("📊 Aktualizuji dashboard...");
    
    const data = await fetchData();
    
    if (data) {
      // Uložit aktuální hodnoty
      currentMoney = data.money || 0;
      currentSubs = data.subs || 0;
      
      // Výpočet progresu
      const progress = calculateProgress();
      
      console.log(`💰 Peníze: ${formatKc(currentMoney)} Kč | 📈 Suby: ${currentSubs}`);
      console.log(`📊 Progress: Donate ${progress.moneyProgress.toFixed(1)}% | Sub ${progress.subProgress.toFixed(1)}%`);
      
      // Aktualizovat statistiky
      if ($("money")) {
        $("money").textContent = `${formatKc(currentMoney)} Kč`;
      }
      
      if ($("moneySmall")) {
        $("moneySmall").textContent = `${formatKc(currentMoney)} / ${formatKc(200000)} Kč`;
      }
      
      if ($("subsTotal")) {
        $("subsTotal").textContent = currentSubs;
      }
      
      if ($("subGoalHeader")) {
        $("subGoalHeader").textContent = `${currentSubs} / 1000 subs`;
      }
      
      if ($("goalHeader")) {
        $("goalHeader").textContent = `${formatKc(currentMoney)} / ${formatKc(200000)} Kč`;
      }
      
      // Renderovat goals
      renderDonateGoals();
      renderSubGoals();
      
      // Renderovat top donátory a aktivitu
      renderTopDonators(data.topDonators || []);
      renderRecentActivity(data.recentActivity || []);
      
      // Přidat animaci pro změny
      animateUpdate();
      
      return true;
      
    } else {
      console.log("⚠️ Nepodařilo se načíst data");
      // Fallback hodnoty
      if ($("money")) $("money").textContent = "0 Kč";
      if ($("subsTotal")) $("subsTotal").textContent = "0";
      if ($("moneySmall")) $("moneySmall").textContent = "0 / 200 000 Kč";
      if ($("subGoalHeader")) $("subGoalHeader").textContent = "0 / 1000 subs";
      if ($("goalHeader")) $("goalHeader").textContent = "0 / 200 000 Kč";
      
      renderDonateGoals();
      renderSubGoals();
      renderTopDonators([]);
      renderRecentActivity([]);
      
      return false;
    }
  }

  // ========= ANIMACE =========
  function animateUpdate() {
    // Animace pro peníze
    const moneyEl = $("money");
    if (moneyEl) {
      moneyEl.style.transform = "scale(1.05)";
      moneyEl.style.transition = "transform 0.2s ease";
      setTimeout(() => {
        moneyEl.style.transform = "scale(1)";
      }, 200);
    }
    
    // Animace pro suby
    const subsEl = $("subsTotal");
    if (subsEl) {
      subsEl.style.transform = "scale(1.05)";
      subsEl.style.transition = "transform 0.2s ease";
      setTimeout(() => {
        subsEl.style.transform = "scale(1)";
      }, 200);
    }
  }

  // ========= TEST FUNKCE =========
  function testData() {
    console.log("🧪 Testovací data...");
    currentMoney = 12500;
    currentSubs = 450;
    
    // Aktualizovat statistiky
    if ($("money")) $("money").textContent = `${formatKc(currentMoney)} Kč`;
    if ($("subsTotal")) $("subsTotal").textContent = currentSubs;
    
    // Renderovat s testovacími daty
    renderDonateGoals();
    renderSubGoals();
    
    console.log("✅ Testovací data aplikována");
  }

  // ========= INICIALIZACE =========
  document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 FUFATHON Dashboard se spouští...");
    console.log("📅 Start: 09. 02. 2026 14:00");
    console.log("🌐 API URL:", API_URL);
    console.log("🔄 Interval aktualizace:", POLL_MS / 1000, "sekund");
    
    // Inicializace tématu
    initTheme();
    
    // Inicializace časovače
    initRunningTimer();
    
    // První načtení dat
    updateDashboard();
    
    // Automatická aktualizace každých 10 sekund
    setInterval(updateDashboard, POLL_MS);
    
    // Debugging funkce
    window.refreshDashboard = updateDashboard;
    window.testDashboard = testData;
    window.showGoals = () => {
      console.log("🎯 Donategoals:", DONATE_GOALS.length);
      console.log("🎯 Subgoals:", SUB_GOALS.length);
    };
    
    console.log("✅ Dashboard ready!");
    console.log("ℹ️ Použij refreshDashboard() pro manuální obnovení");
    console.log("ℹ️ Použij testDashboard() pro testovací data");
  });

})();
