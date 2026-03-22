document.addEventListener("DOMContentLoaded", () => {

let round = 1;
let totalCorrect = 0;
let questionIndex = 0;
let questions = [];

let playerHP = 100;
let enemyHP = 100;

let timer;
let timeLeft = 40;

/* DOM */
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const timerText = document.getElementById("timer");
const roundText = document.getElementById("round");

const playerImg = document.getElementById("player-img");
const enemyImg = document.getElementById("enemy-img");

const playerHPBar = document.getElementById("player-hp-bar");
const enemyHPBar = document.getElementById("enemy-hp-bar");

const playerHPText = document.getElementById("player-hp");
const enemyHPText = document.getElementById("enemy-hp");

/* ================= TRANSITIONS ================= */

function showRoundTransition() {
  const overlay = document.createElement("div");
  overlay.className = "round-overlay";
  overlay.textContent = "⚔️ ROUND " + round;

  document.body.appendChild(overlay);

  setTimeout(() => overlay.remove(), 1200);
}

function playEvolutionAnimation() {
  playerImg.classList.add("evolve");
  setTimeout(() => playerImg.classList.remove("evolve"), 800);
}

/* ================= TYPEWRITER ================= */

function typeWriter(text, speed = 40) {
  const el = document.getElementById("explanation");
  el.textContent = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

function showEvolutionText() {
  const name = getPlayerName().split(" ")[0];
  typeWriter("✨ " + name + " évolue !");
}

/* ================= SPRITES ================= */

function getPlayerSprite() {
  if (round === 1) return "assets/rssilet_back.png";
  if (round === 2) return "assets/rssirex_back.png";
  return "assets/rssilex_back.png";
}

function getPlayerHitSprite() {
  if (round === 1) return "assets/rssilet_hit.png";
  if (round === 2) return "assets/rssirex_hit.png";
  return "assets/rssilex_hit.png";
}

/* ================= NOM ================= */

function getPlayerName() {
  if (round === 1) return "RSSIlet ♂ Lv1";
  if (round === 2) return "RSSIrex ♂ Lv2";
  return "RSSIlex ♂ Lv3";
}

function updatePlayerName() {
  const el = document.getElementById("player-name");
  if (el) el.textContent = getPlayerName();
}

/* ================= QUESTIONS ================= */

async function loadQuestions() {
  const res = await fetch("questions.json");
  const data = await res.json();

  questions = data
    .filter(q => q.difficulty === round)
    .sort(() => Math.random() - 0.5);
}

/* ================= HP ================= */

function resetHP() {
  playerHP = 100;
  enemyHP = 100;
  updateHP();
}

function updateHP() {
  playerHP = Math.max(0, playerHP);
  enemyHP = Math.max(0, enemyHP);

  playerHPBar.value = playerHP;
  enemyHPBar.value = enemyHP;

  playerHPText.textContent = playerHP;
  enemyHPText.textContent = enemyHP;
}

/* ================= GAME START ================= */

async function startGame() {
  round = 1;
  totalCorrect = 0;
  questionIndex = 0;

  startBtn.classList.add("hidden");
  restartBtn.classList.add("hidden");

  document.getElementById("result-screen").classList.add("hidden");

  playerImg.src = getPlayerSprite();
  updatePlayerName();

  resetHP();

  await loadQuestions();
  updateRoundUI();
  nextQuestion();
}

function updateRoundUI() {
  roundText.textContent = "Round " + round;
}

/* ================= TIMER ================= */

function startTimer() {
  clearInterval(timer);
  timeLeft = 40;

  timerText.textContent = "⏱️ " + timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    timerText.textContent = "⏱️ " + timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      handleWrong();
    }
  }, 1000);
}

/* ================= FX ================= */

function launchAttack(fromPlayer = true) {

  const container = document.getElementById("projectile-container");

  const projectile = document.createElement("img");
  projectile.src = "assets/attack_projectile_1.png";
  projectile.className = "projectile";

  const startX = fromPlayer ? 260 : 80;
  const endX = fromPlayer ? 80 : 260;
  const y = fromPlayer ? 160 : 60;

  projectile.style.left = startX + "px";
  projectile.style.top = y + "px";

  container.appendChild(projectile);

  setTimeout(() => {
    projectile.style.transform = `translateX(${endX - startX}px)`;
  }, 10);

  setTimeout(() => {
    projectile.remove();
    showImpact(endX, y);
  }, 400);
}

function showImpact(x, y) {
  const container = document.getElementById("projectile-container");

  const hit = document.createElement("img");
  hit.src = "assets/fx_hit_1.png";
  hit.className = "fx";
  hit.style.left = x + "px";
  hit.style.top = y + "px";

  container.appendChild(hit);

  setTimeout(() => hit.remove(), 400);
}

/* ================= QUESTION ================= */

function nextQuestion() {

  if (playerHP <= 0) return lose();
  if (enemyHP <= 0) return winRound();

  document.getElementById("explanation").textContent = "";

  startTimer();

  const q = questions[questionIndex];

  document.getElementById("question").textContent = q.question;
  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  q.answers.forEach(ans => {
    const btn = document.createElement("div");
    btn.className = "answer";
    btn.textContent = ans.text;

    btn.onclick = () => {
      clearInterval(timer);
      ans.correct ? handleGood(q) : handleWrong(q);
    };

    answersDiv.appendChild(btn);
  });
}

/* ================= REPONSES ================= */

function handleGood(q) {
  totalCorrect++;

  launchAttack(true);

  enemyHP -= 20;
  updateHP();

  enemyImg.src = "assets/isoku_hit.png";
  setTimeout(() => enemyImg.src = "assets/isoku.png", 300);

  document.getElementById("explanation").textContent = q.explanation;

  const delay = Math.max(2000, q.explanation.length * 30);
  setTimeout(nextStep, delay);
}

function handleWrong(q) {

  launchAttack(false);

  playerHP -= 20;
  updateHP();

  playerImg.src = getPlayerHitSprite();
  setTimeout(() => playerImg.src = getPlayerSprite(), 300);

  if (q) {
    document.getElementById("explanation").textContent = q.explanation;
  }

  const delay = q ? Math.max(2000, q.explanation.length * 30) : 2000;
  setTimeout(nextStep, delay);
}

/* ================= STEP ================= */

function nextStep() {
  questionIndex++;

  if (questionIndex >= questions.length) {
    questionIndex = 0;
  }

  setTimeout(nextQuestion, 500);
}

/* ================= WIN ROUND ================= */

async function winRound() {

  round++;

  if (round > 3) return winGame();

  questionIndex = 0;

  playerImg.src = getPlayerSprite();
  updatePlayerName();

  playEvolutionAnimation();
  showEvolutionText();

  resetHP();
  updateRoundUI();

  await loadQuestions();

  setTimeout(() => showRoundTransition(), 600);

  setTimeout(() => nextQuestion(), 1200);
}

/* ================= WIN GAME ================= */

function winGame() {
  enemyImg.src = "assets/pokeball.png";

  document.getElementById("final-score").textContent =
    "Score : " + totalCorrect;

  document.getElementById("result-screen").classList.remove("hidden");
  restartBtn.classList.remove("hidden");
}

/* ================= LOSE ================= */

function lose() {
  alert("💀 ISOKu t’a battu !");
  restartBtn.classList.remove("hidden");
}

/* ================= EVENTS ================= */

startBtn.onclick = startGame;
restartBtn.onclick = startGame;

});
