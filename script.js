(function () {

  const API_STATE = "https://fufathon-api.pajujka191.workers.dev/api/state";
  const POLL_MS = 10000;
  const START_AT = new Date("2026-02-09T14:00:00+01:00");

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

  const $ = id => document.getElementById(id);
  const kc = n => Number(n || 0).toLocaleString("cs-CZ");

  async function fetchState() {
    try {
      const r = await fetch(API_STATE, { cache: "no-store" });
      if (!r.ok) throw new Error("API fail");
      return await r.json();
    } catch {
      return { money: 0, subs: 0, topDonors: [], recentEvents: [] };
    }
  }

  function renderDonateGoals(money) {
    const body = $("goalTableBody");
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

  function renderTopDonors(list) {
    const body = $("topTableBody");
    body.innerHTML = "";
    if (!list.length) {
      body.innerHTML = `<tr><td colspan="4">Zatím nic ✨</td></tr>`;
      return;
    }
    list.slice(0, 5).forEach((d, i) => {
      body.innerHTML += `
        <tr>
          <td>${i + 1}</td>
          <td>${d.username || "Anon"}</td>
          <td>${kc(d.amount)} Kč</td>
          <td>${Math.round(d.amount * 0.15)} min</td>
        </tr>`;
    });
  }

  function renderFeed(list) {
    const feed = $("feed");
    feed.innerHTML = "";
    if (!list.length) {
      feed.innerHTML = `<div class="activity-item muted">Zatím nic…</div>`;
      return;
    }
    list.slice(0, 10).forEach(e => {
      feed.innerHTML += `
        <div class="activity-item">
          <span>${e.type === "sub" ? "🎮" : "💰"} ${e.data?.username || "Anon"}</span>
        </div>`;
    });
  }

  function updateTimer() {
    const diff = new Date() - START_AT;
    if (diff < 0) return;
    const s = Math.floor(diff / 1000);
    $("timeRunning").textContent =
      `${Math.floor(s / 3600)}:${Math.floor(s % 3600 / 60)}:${s % 60}`;
  }

  async function update() {
    const s = await fetchState();

    const money = Number(s.money || 0);
    const subs = Number(s.subs || 0);

    $("money").textContent = kc(money) + " Kč";
    $("moneySmall").textContent = `${kc(money)} / 200 000 Kč`;
    $("subsTotal").textContent = subs;
    $("goalHeader").textContent = `${kc(money)} / 200 000 Kč`;
    $("subGoalHeader").textContent = `${subs} / 1000 subs`;

    renderDonateGoals(money);
    renderSubGoals(subs);
    renderTopDonors(s.topDonors || []);
    renderFeed(s.recentEvents || []);
  }

  document.addEventListener("DOMContentLoaded", () => {
    update();
    updateTimer();
    setInterval(update, POLL_MS);
    setInterval(updateTimer, 1000);
  });

})();
