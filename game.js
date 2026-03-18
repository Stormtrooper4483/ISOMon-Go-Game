let round = 1;
let correctAnswers = 0;
let questionIndex = 0;
let questions = [];

let timer;
let timeLeft = 40;

/* 📥 LOAD JSON */
async function loadQuestions() {
  const res = await fetch("questions.json");
  const data = await res.json();
  questions = data["level" + round];
}

/* 🚀 START */
async function startGame() {
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  await loadQuestions();
  nextQuestion();
}

/* ⏱️ TIMER */
function startTimer() {
  clearInterval(timer);
  timeLeft = 40;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = "⏱️ " + timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      wrongAnswer();
    }
  }, 1000);
}

/* ❓ QUESTION */
function nextQuestion() {
  startTimer();

  const q = questions[questionIndex];
  document.getElementById("question").textContent = q.question;

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  q.answers.forEach(a => {
    const btn = document.createElement("div");
    btn.className = "answer";
    btn.textContent = a.text;

    btn.onclick = () => {
      clearInterval(timer);
      a.correct ? goodAnswer() : wrongAnswer();
    };

    answersDiv.appendChild(btn);
  });
}

/* ⚔️ BONNE REPONSE */
function goodAnswer() {
  correctAnswers++;
  attackEnemy();

  if (correctAnswers >= 5) {
    nextRound();
  } else {
    questionIndex++;
    nextQuestion();
  }
}

/* ❌ MAUVAISE */
function wrongAnswer() {
  attackPlayer();
  questionIndex++;
  nextQuestion();
}

/* ⚔️ ANIMATIONS */
function attackEnemy() {
  const enemy = document.getElementById("enemy-img");
  enemy.src = "assets/isoku_attack.png";

  setTimeout(() => {
    enemy.src = "assets/isoku.png";
  }, 500);
}

function attackPlayer() {
  const player = document.getElementById("player-img");
  player.src = getPlayerSprite("hurt");

  setTimeout(() => {
    player.src = getPlayerSprite("idle");
  }, 500);
}

/* 🧬 EVOLUTION */
function getPlayerSprite(type) {
  if (round === 1) return `assets/rssilet_${type === "idle" ? "back" : type}.png`;
  if (round === 2) return `assets/rssilex_${type === "idle" ? "back" : type}.png`;
  return `assets/rssirex_${type === "idle" ? "back" : type}.png`;
}

function nextRound() {
  round++;
  correctAnswers = 0;
  questionIndex = 0;

  if (round > 3) {
    throwPokeball();
    return;
  }

  showEvolution();
}

/* 💬 EVOLUTION */
function showEvolution() {
  const text = document.getElementById("evolution-text");

  text.textContent =
    round === 2
      ? "✨ RSSIlet évolue en RSSIlex !"
      : "🔥 RSSIlex évolue en RSSIrex !";

  document.getElementById("player-img").src = getPlayerSprite("idle");

  setTimeout(async () => {
    text.textContent = "";
    await loadQuestions();
    nextQuestion();
  }, 2000);
}

/* 🎯 POKEBALL */
function throwPokeball() {
  const enemy = document.getElementById("enemy-img");

  enemy.src = "assets/pokeball.png";

  setTimeout(() => {
    alert("🎉 ISOku capturé ! Certification obtenue !");
  }, 1500);
}

function restartGame() {
  location.reload();
}
