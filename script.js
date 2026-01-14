let totalMinutes = 0;

function updateTimer() {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  document.getElementById("timer").innerText =
    `${h} h ${m} min`;

  const end = new Date(Date.now() + totalMinutes * 60000);
  document.getElementById("endTime").innerText =
    "Konec: " + end.toLocaleString("cs-CZ");
}

// DEMO – simulace subu
function addSub(type) {
  if (type === 1) totalMinutes += 10;
  if (type === 2) totalMinutes += 15;
  if (type === 3) totalMinutes += 20;

  document.getElementById(`t${type}`).innerText++;
  updateTimer();
}

updateTimer();
