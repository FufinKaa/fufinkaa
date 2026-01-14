// ===============================
// FUFATHON – LIVE přes Worker /state
// ===============================

const WORKER_BASE = "https://fufathon-se-proxy.pajujka191.workers.dev";

// cíle (můžeš si změnit)
const MONEY_GOAL_KC = 200 000;
const TIME_GOAL_MINUTES = 12 * 60;

let lastConfettiCounter = 0;

function formatMoney(n) {
  return new Intl.NumberFormat("cs-CZ").format(n) + " Kč";
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function setWidth(id, percent) {
  const el = document.getElementById(id);
  if (el) el.style.width = `${Math.min(Math.max(percent, 0), 100)}%`;
}

function confettiBoom() {
  if (typeof confetti !== "function") return;
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#ff9ad5", "#ffd6f6", "#a970ff"],
  });
}

function renderState(state) {
  const totalMinutes = state.totalMinutes || 0;
  const totalMoneyKc = state.totalMoneyKc || 0;

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  setText("timer", `${String(h).padStart(2, "0")} h ${String(m).padStart(2, "0")} min`);

  const end = new Date(Date.now() + totalMinutes * 60000);
  setText("endTime", "Konec: " + end.toLocaleString("cs-CZ"));

  setText("money", formatMoney(totalMoneyKc));

  setText("t1", state.subs?.t1 ?? 0);
  setText("t2", state.subs?.t2 ?? 0);
  setText("t3", state.subs?.t3 ?? 0);

  // progress
  const moneyPct = (totalMoneyKc / MONEY_GOAL_KC) * 100;
  setWidth("moneyProgress", moneyPct);

  const timePct = (totalMinutes / TIME_GOAL_MINUTES) * 100;
  setWidth("timeProgress", timePct);

  // texty (pokud existují v HTML)
  const moneyText = document.getElementById("moneyProgressText");
  if (moneyText) {
    moneyText.innerText =
      `${new Intl.NumberFormat("cs-CZ").format(totalMoneyKc)} / ${new Intl.NumberFormat("cs-CZ").format(MONEY_GOAL_KC)} Kč`;
  }
  const timeText = document.getElementById("timeProgressText");
  if (timeText) timeText.innerText = `${Math.min(timePct, 100).toFixed(0)}%`;

  // events
  const ul = document.getElementById("events");
  if (ul && Array.isArray(state.events)) {
    ul.innerHTML = "";
    for (const text of state.events) {
      const li = document.createElement("li");
      li.textContent = text;
      ul.appendChild(li);
    }
  }

  // confetti trigger
  const bump = state.bumpConfetti || 0;
  if (bump > lastConfettiCounter) {
    confettiBoom();
    lastConfettiCounter = bump;
  }
}

async function fetchState() {
  try {
    const res = await fetch(`${WORKER_BASE}/state`, { cache: "no-store" });
    if (!res.ok) return;
    const state = await res.json();
    renderState(state);
  } catch (e) {
    console.error("STATE ERROR:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchState();
  setInterval(fetchState, 5000); // každých 5s
});
