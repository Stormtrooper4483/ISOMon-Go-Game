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

const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

const timerText = document.getElementById("timer");

const playerImg = document.getElementById("player-img");
const enemyImg = document.getElementById("enemy-img");

const playerHPBar = document.getElementById("player-hp-bar");
const enemyHPBar = document.getElementById("enemy-hp-bar");

const playerHPText = document.getElementById("player-hp");
const enemyHPText = document.getElementById("enemy-hp");

const projectileContainer = document.createElement("div");
document.body.appendChild(projectileContainer);

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
  correctAnswers = 0;
  totalCorrect = 0;
  questionIndex = 0;

  playerHP = 100;
  enemyHP = 100;

  startBtn.classList.add("hidden");
  restartBtn.classList.add("hidden");

  document.getElementById("result-screen").classList.add("hidden");

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
      handleWrong();
    }
  }, 1000);
}

/* PROJECTILE */
function animateProjectile(fromPlayer, callback) {
  const proj = document.createElement("img");
  proj.src = "assets/attack_projectile_1.png";
  proj.style.position = "absolute";
  proj.style.width = "50px";
  proj.style.top = fromPlayer ? "220px" : "80px";
  proj.style.left = fromPlayer ? "120px" : "300px";

  projectileContainer.appendChild(proj);

  setTimeout(() => {
    proj.src = "assets/attack_projectile_2.png";
    proj.style.left = fromPlayer ? "300px" : "120px";
  }, 100);

  setTimeout(() => {
    projectileContainer.removeChild(proj);
    callback();
  }, 400);
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

      if (ans.correct) handleGood(q);
      else handleWrong(q);
    };

    answersDiv.appendChild(btn);
  });
}

/* GOOD */
function handleGood(q) {
  correctAnswers++;
  totalCorrect++;

  animateProjectile(true, () => {
    enemyImg.src = "assets/isoku_hit.png";

    setTimeout(() => {
      enemyImg.src = "assets/isoku.png";
    }, 300);

    enemyHP -= 20;
    updateHP();

    document.getElementById("explanation").textContent = q.explanation;

    nextStep();
  });
}

/* WRONG */
function handleWrong(q) {
  animateProjectile(false, () => {
    playerImg.src = getPlayerSprite("hurt");

    setTimeout(() => {
      playerImg.src = getPlayerSprite("idle");
    }, 300);

    playerHP -= 20;
    updateHP();

    if (q) document.getElementById("explanation").textContent = q.explanation;

    nextStep();
  });
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

  setTimeout(nextQuestion, 800);
}

/* ROUND */
async function endRound() {
  if (correctAnswers >= 5) {
    round++;
    correctAnswers = 0;
    questionIndex = 0;

    if (round > 3) return win();

    await loadQuestions();
    nextQuestion();
  } else {
    lose();
  }
}

/* WIN */
function win() {
  enemyImg.src = "assets/pokeball.png";

  document.getElementById("final-score").textContent =
    "Score : " + totalCorrect + "/18";

  document.getElementById("result-screen").classList.remove("hidden");
  restartBtn.classList.remove("hidden");
}

/* LOSE */
function lose() {
  alert("Perdu !");
  restartBtn.classList.remove("hidden");
}

startBtn.onclick = startGame;
restartBtn.onclick = startGame;

});
