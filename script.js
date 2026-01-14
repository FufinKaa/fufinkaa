// ===============================
// FUFATHON Dashboard (demo verze)
// - pravidla: T1 +10, T2 +15, T3 +20, 100 Kč +15
// - confetti při subu
// - light/dark toggle s uložením
// - progress bary (money goal + time goal)
// ===============================

// === Nastavení (můžeš upravit) ===
const MONEY_GOAL_KC = 20000;          // cíl progress baru pro peníze
const TIME_GOAL_MINUTES = 12 * 60;    // cíl progress baru pro čas (např. 12 hodin)

// === Stav ===
let totalMinutes = 0;
let totalMoneyKc = 0;
let subs = { t1: 0, t2: 0, t3: 0 };

// === Helpers ===
function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatMoney(n) {
  // CZ format: 12 400 Kč
  return new Intl.NumberFormat("cs-CZ").format(n) + " Kč";
}

function addEvent(text) {
  const ul = document.getElementById("events");
  const li = document.createElement("li");
  li.textContent = text;

  // newest on top
  ul.prepend(li);

  // keep list short
  while (ul.children.length > 12) ul.removeChild(ul.lastChild);
}

function confettiBoom() {
  if (typeof confetti !== "function") return;
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.62 },
    colors: ["#ff9ad5", "#ffd6f6", "#a970ff"]
  });
}

function updateTimeUI() {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  document.getElementById("timer").innerText = `${pad2(h)} h ${pad2(m)} min`;

  const end = new Date(Date.now() + totalMinutes * 60000);
  document.getElementById("endTime").innerText =
    "Konec: " + end.toLocaleString("cs-CZ");

  // progress bar času
  const pct = Math.min((totalMinutes / TIME_GOAL_MINUTES) * 100, 100);
  document.getElementById("timeProgress").style.width = pct.toFixed(1) + "%";
  document.getElementById("timeProgressText").innerText = `${pct.toFixed(0)}%`;
}

function updateMoneyUI() {
  document.getElementById("money").innerText = formatMoney(totalMoneyKc);

  const pct = Math.min((totalMoneyKc / MONEY_GOAL_KC) * 100, 100);
  document.getElementById("moneyProgress").style.width = pct.toFixed(1) + "%";
  document.getElementById("moneyProgressText").innerText =
    `${new Intl.NumberFormat("cs-CZ").format(totalMoneyKc)} / ${new Intl.NumberFormat("cs-CZ").format(MONEY_GOAL_KC)} Kč`;
}

function updateSubsUI() {
  document.getElementById("t1").innerText = subs.t1;
  document.getElementById("t2").innerText = subs.t2;
  document.getElementById("t3").innerText = subs.t3;
}

function renderAll() {
  updateTimeUI();
  updateMoneyUI();
  updateSubsUI();
}

// === Akce podle pravidel ===
function addSub(type, who = "Někdo") {
  let addMin = 0;

  if (type === 1) { addMin = 10; subs.t1 += 1; }
  if (type === 2) { addMin = 15; subs.t2 += 1; }
  if (type === 3) { addMin = 20; subs.t3 += 1; }

  totalMinutes += addMin;

  addEvent(`${who} – T${type} sub (+${addMin} min)`);
  confettiBoom();
  renderAll();
}

function addDonateKc(amountKc, who = "Někdo") {
  // 100 Kč = 15 min
  const addMin = Math.floor(amountKc / 100) * 15;
  totalMoneyKc += amountKc;
  totalMinutes += addMin;

  addEvent(`${who} – donate ${amountKc} Kč (+${addMin} min)`);
  renderAll();
}

// === Theme toggle ===
function loadTheme() {
  const saved = localStorage.getItem("fufathon_theme");
  if (saved === "light") document.body.classList.add("light");
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById("themeToggle");
  const isLight = document.body.classList.contains("light");
  btn.textContent = isLight ? "☀️" : "🌙";
}

function toggleTheme() {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  localStorage.setItem("fufathon_theme", isLight ? "light" : "dark");
  updateThemeIcon();
}

// === Demo wiring ===
function wireDemoButtons() {
  const t1 = document.getElementById("btnT1");
  const t2 = document.getElementById("btnT2");
  const t3 = document.getElementById("btnT3");
  const d100 = document.getElementById("btn100");
  const reset = document.getElementById("btnReset");

  if (t1) t1.addEventListener("click", () => addSub(1, "Chatík"));
  if (t2) t2.addEventListener("click", () => addSub(2, "Chatík"));
  if (t3) t3.addEventListener("click", () => addSub(3, "Chatík"));
  if (d100) d100.addEventListener("click", () => addDonateKc(100, "Donatíček"));

  if (reset) {
    reset.addEventListener("click", () => {
      totalMinutes = 0;
      totalMoneyKc = 0;
      subs = { t1: 0, t2: 0, t3: 0 };
      document.getElementById("events").innerHTML = "";
      addEvent("Reset proběhl (demo).");
      renderAll();
    });
  }
}

// === Init ===
document.addEventListener("DOMContentLoaded", () => {
  // Theme
  loadTheme();
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);

  // Default feed
  addEvent("Dashboard je online ✨ (zatím demo verze)");
  addEvent("Příště: napojíme StreamElements, aby to chodilo samo 💜");

  // UI
  renderAll();
  wireDemoButtons();
});
