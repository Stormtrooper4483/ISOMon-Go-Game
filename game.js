document.addEventListener("DOMContentLoaded", () => {

let round = 1;
let correctAnswers = 0;
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

/* SPRITES RSSI */
function getPlayerSprite() {
  if (round === 1) return "assets/rssilet_back.png";
  if (round === 2) return "assets/rssirex_back.png";
  return "assets/rssilex_back.png";
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

/* RESET ROUND */
function resetHP() {
  playerHP = 100;
  enemyHP = 100;
  updateHP();
}

/* UPDATE HP */
function updateHP() {
  playerHP = Math.max(0, playerHP);
  enemyHP = Math.max(0, enemyHP);

  playerHPBar.value = playerHP;
  enemyHPBar.value = enemyHP;

  playerHPText.textContent = playerHP;
  enemyHPText.textContent = enemyHP;
}

/* START */
async function startGame() {
  round = 1;
  correctAnswers = 0;
  totalCorrect = 0;
  questionIndex = 0;

  startBtn.classList.add("hidden");
  restartBtn.classList.add("hidden");

  document.getElementById("result-screen").classList.add("hidden");

  playerImg.src = getPlayerSprite();
  resetHP();

  await loadQuestions();
  updateRoundUI();
  nextQuestion();
}

/* ROUND UI */
function updateRoundUI() {
  roundText.textContent = "Round " + round;
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
      handleWrong();
    }
  }, 1000);
}

/* QUESTION */
function nextQuestion() {
  if (questionIndex >= questions.length) return endRound();

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

      if (ans.correct) {
        handleGood(q);
      } else {
        handleWrong(q);
      }
    };

    answersDiv.appendChild(btn);
  });
}

/* GOOD ANSWER */
function handleGood(q) {
  correctAnswers++;
  totalCorrect++;

  enemyHP -= 20;
  updateHP();

  enemyImg.src = "assets/isoku_hit.png";
  setTimeout(() => enemyImg.src = "assets/isoku.png", 300);

  document.getElementById("explanation").textContent = q.explanation;

  nextStep();
}

/* WRONG ANSWER */
function handleWrong(q) {
  playerHP -= 20;
  updateHP();

  playerImg.src = "assets/rssilet_hit.png";
  setTimeout(() => playerImg.src = getPlayerSprite(), 300);

  if (q) {
    document.getElementById("explanation").textContent = q.explanation;
  }

  nextStep();
}

/* NEXT STEP */
function nextStep() {
  questionIndex++;

  if (playerHP <= 0) return lose();
  if (enemyHP <= 0) return winRound();

  setTimeout(nextQuestion, 800);
}

/* WIN ROUND */
async function winRound() {
  if (correctAnswers >= 5) {
    round++;

    if (round > 3) return winGame();

    correctAnswers = 0;
    questionIndex = 0;

    playerImg.src = getPlayerSprite();
    resetHP();
    updateRoundUI();

    await loadQuestions();
    nextQuestion();
  } else {
    lose();
  }
}

/* END ROUND */
function endRound() {
  if (correctAnswers >= 5) {
    winRound();
  } else {
    lose();
  }
}

/* WIN GAME */
function winGame() {
  enemyImg.src = "assets/pokeball.png";

  document.getElementById("final-score").textContent =
    "Score : " + totalCorrect + "/18";

  document.getElementById("result-screen").classList.remove("hidden");
  restartBtn.classList.remove("hidden");
}

/* LOSE */
function lose() {
  alert("💀 ISOKu t’a battu !");
  restartBtn.classList.remove("hidden");
}

startBtn.onclick = startGame;
restartBtn.onclick = startGame;

});
