document.addEventListener("DOMContentLoaded", () => {

let round = 1;
let correctAnswers = 0;
let questionIndex = 0;
let questions = [];

let playerHP = 100;
let enemyHP = 100;

let timer;
let timeLeft = 40;

const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

const playerImg = document.getElementById("player-img");
const enemyImg = document.getElementById("enemy-img");

const playerHPBar = document.getElementById("player-hp-bar");
const enemyHPBar = document.getElementById("enemy-hp-bar");

const playerHPText = document.getElementById("player-hp");
const enemyHPText = document.getElementById("enemy-hp");

const roundText = document.getElementById("round");
const timerText = document.getElementById("timer");

const questionText = document.getElementById("question");
const answersDiv = document.getElementById("answers");
const explanationDiv = document.getElementById("explanation");

const evolutionText = document.getElementById("evolution-text");
const battleZone = document.getElementById("battle-zone");

/* SPRITES */
function getPlayerSprite(state) {
  const map = {
    1: { idle: "assets/rssilet_back.png", hurt: "assets/rssilet_hit.png" },
    2: { idle: "assets/rssilex_back.png", hurt: "assets/rssilex_hit.png" },
    3: { idle: "assets/rssirex_back.png", hurt: "assets/rssirex_hit.png" }
  };
  return map[round][state] || map[round].idle;
}

/* LOAD QUESTIONS */
async function loadQuestions() {
  const res = await fetch("questions.json");
  const data = await res.json();

  questions = data
    .filter(q => q.difficulty === round)
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);
}

/* START */
async function startGame() {
  round = 1;
  playerHP = 100;
  enemyHP = 100;
  correctAnswers = 0;
  questionIndex = 0;

  startBtn.classList.add("hidden");
  restartBtn.classList.add("hidden");

  playerImg.src = getPlayerSprite("idle");
  enemyImg.src = "assets/isoku.png";

  updateHP();
  await loadQuestions();
  nextQuestion();
}

/* TIMER */
function startTimer() {
  clearInterval(timer);
  timeLeft = 40;
  timerText.textContent = "⏱️ " + timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    timerText.textContent = "⏱️ " + timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      handleWrongAnswer();
    }
  }, 1000);
}

/* QUESTION */
function nextQuestion() {
  if (questionIndex >= questions.length) return endRound();

  explanationDiv.textContent = "";

  const q = questions[questionIndex];
  questionText.textContent = q.question;
  answersDiv.innerHTML = "";

  q.answers.forEach(ans => {
    const btn = document.createElement("div");
    btn.className = "answer";
    btn.textContent = ans.text;

    btn.onclick = () => {
      clearInterval(timer);
      ans.correct ? handleGoodAnswer(q) : handleWrongAnswer(q);
    };

    answersDiv.appendChild(btn);
  });

  startTimer();
}

/* ANIMATION HIT */
function shake() {
  battleZone.classList.add("shake");
  setTimeout(() => battleZone.classList.remove("shake"), 300);
}

/* GOOD */
function handleGoodAnswer(q) {
  correctAnswers++;

  enemyImg.src = "assets/isoku_hit.png";
  shake();

  setTimeout(() => {
    enemyImg.src = "assets/isoku.png";
  }, 300);

  enemyHP -= 20;
  updateHP();

  explanationDiv.textContent = q.explanation;

  setTimeout(nextStep, 1200);
}

/* WRONG */
function handleWrongAnswer(q) {

  playerImg.src = getPlayerSprite("hurt");
  shake();

  setTimeout(() => {
    playerImg.src = getPlayerSprite("idle");
  }, 300);

  playerHP -= 20;
  updateHP();

  if (q) explanationDiv.textContent = q.explanation;

  setTimeout(nextStep, 1200);
}

/* UPDATE HP */
function updateHP() {
  playerHPBar.value = playerHP;
  enemyHPBar.value = enemyHP;
  playerHPText.textContent = playerHP;
  enemyHPText.textContent = enemyHP;
}

/* STEP */
function nextStep() {
  questionIndex++;

  if (playerHP <= 0) return lose();
  if (enemyHP <= 0) return win();

  nextQuestion();
}

/* ROUND */
async function endRound() {
  if (correctAnswers >= 5) {
    round++;

    if (round > 3) return win();

    evolutionText.textContent = "✨ Évolution RSSI !";

    correctAnswers = 0;
    questionIndex = 0;

    await loadQuestions();
    setTimeout(nextQuestion, 1500);
  } else {
    lose();
  }
}

/* WIN */
function win() {
  enemyImg.src = "assets/pokeball.png";
  evolutionText.textContent = "🎯 ISOKu capturé ! ISO 27001 obtenue !";
  restartBtn.classList.remove("hidden");
}

/* LOSE */
function lose() {
  evolutionText.textContent = "💀 ISOKu t’a battu...";
  restartBtn.classList.remove("hidden");
}

/* EVENTS */
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

});
