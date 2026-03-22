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

const questionEl = document.getElementById("question");
const answersDiv = document.getElementById("answers");

/* ================= INTRO ================= */

const introText = `
🎮 ISOKu apparaît !

⚔️ Réponds aux questions pour l’attaquer  
🏆 Gagne les 3 rounds pour le capturer  

🛡️ Remporte le badge ISO27001 de la ligue Conformité !
`;

function typeWriter(text, speed = 18) {
  questionEl.innerHTML = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      const char = text.charAt(i);
      questionEl.innerHTML += (char === "\n") ? "<br>" : char;
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

typeWriter(introText);

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

/* ================= CAPTURE ================= */

function playCaptureAnimation() {
  const container = document.getElementById("projectile-container");

  const ball = document.createElement("img");
  ball.src = "assets/pokeball.png";
  ball.className = "capture-ball";

  container.appendChild(ball);

  /* 📍 position dynamique sur ISOKU */
  const enemyRect = enemyImg.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  ball.style.left = (enemyRect.left - containerRect.left + 60) + "px";
  ball.style.top = (enemyRect.top - containerRect.top + 60) + "px";

  const FRAME_WIDTH = 64;
  let frame = 0;

  const anim = setInterval(() => {
    ball.style.objectPosition = `-${frame * FRAME_WIDTH}px 0`;

    if (frame === 2) {
      spawnSparkles(ball);
    }

    frame++;

    if (frame > 3) {
      clearInterval(anim);
      setTimeout(() => ball.remove(), 400);
    }
  }, 120);
}

function spawnSparkles(ball) {
  const container = document.getElementById("projectile-container");

  for (let i = 0; i < 8; i++) {
    const spark = document.createElement("div");
    spark.className = "spark";

    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 20;

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    spark.style.left = ball.offsetLeft + 32 + "px";
    spark.style.top = ball.offsetTop + 32 + "px";

    spark.style.setProperty("--dx", x + "px");
    spark.style.setProperty("--dy", y + "px");

    container.appendChild(spark);

    setTimeout(() => spark.remove(), 600);
  }
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

/* ================= GAME ================= */

async function startGame() {
  round = 1;
  totalCorrect = 0;
  questionIndex = 0;

  answersDiv.innerHTML = "";

  startBtn.classList.add("hidden");
  restartBtn.classList.add("hidden");
  document.getElementById("result-screen").classList.add("hidden");

  enemyImg.style.opacity = "1";

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

/* ================= QUESTION ================= */

function nextQuestion() {

  if (playerHP <= 0) return lose();
  if (enemyHP <= 0) return winRound();

  document.getElementById("explanation").textContent = "";

  startTimer();

  const q = questions[questionIndex];

  questionEl.textContent = q.question;
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

  enemyHP -= 20;
  updateHP();

  enemyImg.src = "assets/isoku_hit.png";
  setTimeout(() => enemyImg.src = "assets/isoku.png", 300);

  document.getElementById("explanation").textContent = q.explanation;

  const delay = Math.max(3000, q.explanation.length * 45);
  setTimeout(nextStep, delay);
}

function handleWrong(q) {

  playerHP -= 20;
  updateHP();

  playerImg.src = getPlayerHitSprite();
  setTimeout(() => playerImg.src = getPlayerSprite(), 300);

  if (q) {
    document.getElementById("explanation").textContent = q.explanation;
  }

  const delay = q ? Math.max(3000, q.explanation.length * 45) : 3000;
  setTimeout(nextStep, delay);
}

/* ================= FLOW ================= */

function nextStep() {
  questionIndex++;
  if (questionIndex >= questions.length) questionIndex = 0;
  setTimeout(nextQuestion, 500);
}

async function winRound() {

  round++;

  if (round > 3) return winGame();

  questionIndex = 0;

  playerImg.src = getPlayerSprite();
  updatePlayerName();

  playEvolutionAnimation();

  resetHP();
  updateRoundUI();

  await loadQuestions();

  setTimeout(() => showRoundTransition(), 600);
  setTimeout(() => nextQuestion(), 1200);
}

function winGame() {

  enemyImg.style.opacity = "0";

  playCaptureAnimation();

  setTimeout(() => {
    document.getElementById("final-score").textContent =
      "Score : " + totalCorrect;

    document.getElementById("result-screen").classList.remove("hidden");
    restartBtn.classList.remove("hidden");
  }, 1500);
}

function lose() {
  alert("💀 ISOKu t’a battu !");
  restartBtn.classList.remove("hidden");
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

/* ================= EVENTS ================= */

startBtn.onclick = startGame;
restartBtn.onclick = startGame;

});
