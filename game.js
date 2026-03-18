let currentRound = 1;
let playerHP = 100;
let enemyHP = 100;

let timer;
let timeLeft = 40;

function startGame() {
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  startRound();
}

function startRound() {
  updateRound();
  handleEvolution();
  loadQuestion();
  startTimer();
}

function updateRound() {
  document.getElementById("round-display").textContent = "Round " + currentRound;
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 40;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = "⏱️ " + timeLeft + "s";

    if (timeLeft <= 0) {
      clearInterval(timer);
      enemyAttack();
    }
  }, 1000);
}

/* 🧬 EVOLUTION */
function handleEvolution() {
  const img = document.getElementById("player-img");
  const name = document.getElementById("player-name");
  const text = document.getElementById("evolution-text");

  text.classList.remove("hidden");

  if (currentRound === 1) {
    img.src = "assets/rssilet.png";
    name.textContent = "RSSIlet";
    text.classList.add("hidden");
    return;
  }

  if (currentRound === 2) {
    text.textContent = "✨ RSSIlet évolue en RSSIlex !";
    img.classList.add("evolve");

    setTimeout(() => {
      img.src = "assets/rssilex.png";
      name.textContent = "RSSIlex";
      img.classList.remove("evolve");
    }, 300);
  }

  if (currentRound === 3) {
    text.textContent = "🔥 RSSIlex évolue en RSSIrex !";
    img.classList.add("evolve");

    setTimeout(() => {
      img.src = "assets/rssirex.png";
      name.textContent = "RSSIrex";
      img.classList.remove("evolve");
    }, 300);
  }
}

/* ⚔️ SPRITES dynamiques */
function getPlayerSprites() {
  if (currentRound === 1) {
    return {
      idle: "assets/rssilet.png",
      attack: "assets/rssilet_attack.png",
      hurt: "assets/rssilet_hurt.png"
    };
  }

  if (currentRound === 2) {
    return {
      idle: "assets/rssilex.png",
      attack: "assets/rssilex_attack.png",
      hurt: "assets/rssilex_hurt.png"
    };
  }

  return {
    idle: "assets/rssirex.png",
    attack: "assets/rssirex_attack.png",
    hurt: "assets/rssirex_hurt.png"
  };
}

const enemySprites = {
  idle: "assets/isoku.png",
  attack: "assets/isoku_attack.png",
  hurt: "assets/isoku_hurt.png"
};

function playAnimation(target, type) {
  const img = document.getElementById(target + "-img");

  if (target === "player") {
    const sprites = getPlayerSprites();
    img.src = sprites[type];
    setTimeout(() => img.src = sprites.idle, 500);
  } else {
    img.src = enemySprites[type];
    setTimeout(() => img.src = enemySprites.idle, 500);
  }
}

/* ⚔️ COMBAT */
function playerAttack() {
  playAnimation("player", "attack");
  playAnimation("enemy", "hurt");

  enemyHP -= 20;
  updateHP();
}

function enemyAttack() {
  playAnimation("enemy", "attack");
  playAnimation("player", "hurt");

  playerHP -= 20;
  updateHP();
}

function updateHP() {
  document.getElementById("player-hp").style.width = playerHP + "%";
  document.getElementById("enemy-hp").style.width = enemyHP + "%";

  if (playerHP <= 0 || enemyHP <= 0) {
    endGame();
  }
}

/* ❓ QUESTIONS */
function loadQuestion() {
  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  ["A", "B", "C", "D"].forEach(ans => {
    const btn = document.createElement("div");
    btn.className = "answer";
    btn.textContent = ans;

    btn.onclick = () => {
      clearInterval(timer);
      playerAttack();
      nextTurn();
    };

    answersDiv.appendChild(btn);
  });
}

function nextTurn() {
  setTimeout(() => {
    currentRound++;
    if (currentRound <= 3) {
      startRound();
    } else {
      endGame();
    }
  }, 1000);
}

function endGame() {
  alert(playerHP <= 0 ? "Perdu !" : "🎉 Certification ISO27001 obtenue !");
}

function restartGame() {
  location.reload();
}
