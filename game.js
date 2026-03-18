let round = 1;
let correctAnswers = 0;
let questionIndex = 0;
let questions = [];

let playerHP = 100;
let enemyHP = 100;

let timer;
let timeLeft = 40;

/* conteneur projectiles */
const gameDiv = document.getElementById("game");
let projectileDiv = document.getElementById("projectile-container");
if (!projectileDiv) {
  projectileDiv = document.createElement("div");
  projectileDiv.id = "projectile-container";
  projectileDiv.style.position = "absolute";
  projectileDiv.style.width = "100%";
  projectileDiv.style.height = "300px";
  projectileDiv.style.pointerEvents = "none";
  projectileDiv.style.top = "0";
  gameDiv.appendChild(projectileDiv);
}

/* 📥 charger JSON */
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
  document.getElementById("timer").textContent = "⏱️ " + timeLeft;

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

/* ⚔️ ANIMATION ATTACK */
function animateAttack(attacker, defender, callback) {
  const projectile = document.createElement("img");
  projectile.src = "assets/attack_projectile_1.png";
  projectile.style.position = "absolute";
  projectile.style.width = "60px";
  projectile.style.top = attacker === "player" ? "230px" : "50px";
  projectile.style.left = attacker === "player" ? "180px" : "620px";
  projectileDiv.appendChild(projectile);

  let toggle = false;
  const animInterval = setInterval(() => {
    projectile.src = toggle ? "assets/attack_projectile_1.png" : "assets/attack_projectile_2.png";
    toggle = !toggle;
  }, 100);

  setTimeout(() => {
    projectile.style.left = attacker === "player" ? "600px" : "150px";
  }, 50);

  setTimeout(() => {
    clearInterval(animInterval);
    projectileDiv.removeChild(projectile);

    // flash
    const flash = document.createElement("img");
    flash.src = "assets/fx_flash_1.png";
    flash.style.position = "absolute";
    flash.style.width = "80px";
    flash.style.top = defender === "player" ? "210px" : "30px";
    flash.style.left = defender === "player" ? "150px" : "590px";
    projectileDiv.appendChild(flash);

    setTimeout(() => projectileDiv.removeChild(flash), 300);

    // hit
    const hit = document.createElement("img");
    hit.src = "assets/fx_hit_1.png";
    hit.style.position = "absolute";
    hit.style.width = "80px";
    hit.style.top = defender === "player" ? "210px" : "30px";
    hit.style.left = defender === "player" ? "150px" : "590px";
    projectileDiv.appendChild(hit);

    setTimeout(() => {
      projectileDiv.removeChild(hit);
      callback();
    }, 400);
  }, 600);
}

/* ⚔️ BONNE REPONSE */
function goodAnswer() {
  correctAnswers++;
  const playerImg = document.getElementById("player-img");
  playerImg.src = getPlayerSprite("attack");

  animateAttack("player", "enemy", () => {
    const enemyImg = document.getElementById("enemy-img");
    enemyImg.src = "assets/isoku_hurt.png";
    setTimeout(() => enemyImg.src = "assets/isoku.png", 500);

    enemyHP -= 20;
    updateHP();

    checkNext();
  });
}

/* ❌ MAUVAISE REPONSE */
function wrongAnswer() {
  const enemyImg = document.getElementById("enemy-img");
  enemyImg.src = "assets/isoku_attack.png";

  animateAttack("enemy", "player", () => {
    const playerImg = document.getElementById("player-img");
    playerImg.src = getPlayerSprite("hurt");
    setTimeout(() => playerImg.src = getPlayerSprite("idle"), 500);

    playerHP -= 20;
    updateHP();

    checkNext();
  });
}

function checkNext() {
  if (questionIndex + 1 >= questions.length) {
    if (correctAnswers >= 5) {
      nextRound();
    } else {
      nextQuestion(); // continue si moins de 5 bonnes réponses mais questions restantes
    }
  } else {
    questionIndex++;
    nextQuestion();
  }
}

/* 🧬 SPRITES BACK */
function getPlayerSprite(type) {
  if (round === 1) return `assets/rssilet_${type === "idle" ? "back" : type}.png`;
  if (round === 2) return `assets/rssilex_${type === "idle" ? "back" : type}.png`;
  return `assets/rssirex_${type === "idle" ? "back" : type}.png`;
}

/* ⚡ POKEBALL FINALE */
function throwPokeball() {
  const enemy = document.getElementById("enemy-img");
  enemy.src = "assets/pokeball.png";

  setTimeout(() => alert("🎉 ISOku capturé ! Certification obtenue !"), 1500);
}

/* 🧬 ÉVOLUTION */
function nextRound() {
  round++;
  correctAnswers = 0;
  questionIndex = 0;

  if (round > 3) {
    throwPokeball();
    return;
  }

  const text = document.getElementById("evolution-text");
  text.textContent =
    round === 2 ? "✨ RSSIlet évolue en RSSIlex !" : "🔥 RSSIlex évolue en RSSIrex !";

  document.getElementById("player-img").src = getPlayerSprite("idle");

  setTimeout(async () => {
    text.textContent = "";
    await loadQuestions();
    nextQuestion();
  }, 2000);
}

function updateHP() {
  document.getElementById("player-hp").textContent = playerHP;
  document.getElementById("enemy-hp").textContent = enemyHP;
}

function restartGame() {
  location.reload();
}
