// On attend que le DOM soit entièrement chargé
document.addEventListener("DOMContentLoaded", () => {

  // Variables globales
  let round = 1;
  let correctAnswers = 0;
  let questionIndex = 0;
  let questions = [];

  let playerHP = 100;
  let enemyHP = 100;

  let timer;
  let timeLeft = 40;

  // Éléments du DOM
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");

  const playerImg = document.getElementById("player-img");
  const trainerImg = document.getElementById("trainer-img");
  const enemyImg = document.getElementById("enemy-img");

  const playerHPBar = document.getElementById("player-hp-bar");
  const enemyHPBar = document.getElementById("enemy-hp-bar");

  const playerHPText = document.getElementById("player-hp");
  const enemyHPText = document.getElementById("enemy-hp");

  const roundText = document.getElementById("round");
  const timerText = document.getElementById("timer");
  const questionText = document.getElementById("question");
  const answersDiv = document.getElementById("answers");
  const evolutionText = document.getElementById("evolution-text");

  const projectileContainer = document.getElementById("projectile-container");

  // -------------------
  // Fonctions principales
  // -------------------

  // Charger questions JSON
  async function loadQuestions() {
    const res = await fetch("questions.json");
    const data = await res.json();
    questions = data["level" + round];
    shuffleArray(questions);
  }

  // Mélange un tableau (Fisher-Yates)
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // Démarrage du jeu
  async function startGame() {
    if (!startBtn || !restartBtn) return;
    startBtn.classList.add("hidden");
    restartBtn.classList.add("hidden");
    evolutionText.textContent = "";
    playerHP = 100;
    enemyHP = 100;
    updateHPBars();
    roundText.textContent = "Round " + round;
    questionIndex = 0;
    correctAnswers = 0;
    await loadQuestions();
    nextQuestion();
    startTimer();
  }

  // Timer 40 sec
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

  // Afficher question et réponses
  function nextQuestion() {
    if (questionIndex >= questions.length) {
      endRound();
      return;
    }
    startTimer();
    const q = questions[questionIndex];
    questionText.textContent = q.question;
    answersDiv.innerHTML = "";

    q.answers.forEach((ans) => {
      const btn = document.createElement("div");
      btn.classList.add("answer");
      btn.textContent = ans.text;
      btn.onclick = () => {
        clearInterval(timer);
        if (ans.correct) handleGoodAnswer();
        else handleWrongAnswer();
      };
      answersDiv.appendChild(btn);
    });
  }

  // Mise à jour des PV
  function updateHPBars() {
    playerHPBar.value = playerHP;
    enemyHPBar.value = enemyHP;
    playerHPText.textContent = playerHP;
    enemyHPText.textContent = enemyHP;
  }

  // Animation attaque avec projectiles et fx
  function animateAttack(attacker, defender, callback) {
    const projectile = document.createElement("img");
    projectile.src = "assets/attack_projectile_1.png";
    projectile.style.position = "absolute";
    projectile.style.width = "60px";
    projectile.style.top = attacker === "player" ? "230px" : "50px";
    projectile.style.left = attacker === "player" ? "180px" : "620px";
    projectileContainer.appendChild(projectile);

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
      projectileContainer.removeChild(projectile);

      const flash = document.createElement("img");
      flash.src = "assets/fx_flash_1.png";
      flash.style.position = "absolute";
      flash.style.width = "80px";
      flash.style.top = defender === "player" ? "210px" : "30px";
      flash.style.left = defender === "player" ? "150px" : "590px";
      projectileContainer.appendChild(flash);

      setTimeout(() => projectileContainer.removeChild(flash), 300);

      const hit = document.createElement("img");
      hit.src = "assets/fx_hit_1.png";
      hit.style.position = "absolute";
      hit.style.width = "80px";
      hit.style.top = defender === "player" ? "210px" : "30px";
      hit.style.left = defender === "player" ? "150px" : "590px";
      projectileContainer.appendChild(hit);

      setTimeout(() => {
        projectileContainer.removeChild(hit);
        callback();
      }, 400);
    }, 600);
  }

  // Gestion bonne réponse
  function handleGoodAnswer() {
    correctAnswers++;
    playerImg.src = getPlayerSprite("attack");
    animateAttack("player", "enemy", () => {
      enemyImg.src = "assets/isoku_hurt.png";
      setTimeout(() => (enemyImg.src = "assets/isoku.png"), 500);

      enemyHP -= 20;
      if (enemyHP < 0) enemyHP = 0;
      updateHPBars();

      nextStep();
    });
  }

  // Gestion mauvaise réponse
  function handleWrongAnswer() {
    enemyImg.src = "assets/isoku_attack.png";
    animateAttack("enemy", "player", () => {
      playerImg.src = getPlayerSprite("hurt");
      setTimeout(() => (playerImg.src = getPlayerSprite("idle")), 500);

      playerHP -= 20;
      if (playerHP < 0) playerHP = 0;
      updateHPBars();

      nextStep();
    });
  }

  // Étape suivante
  function nextStep() {
    questionIndex++;
    if (questionIndex >= questions.length) {
      endRound();
    } else {
      nextQuestion();
    }
  }

  // Fin de round / évolution
  function endRound() {
    clearInterval(timer);
    if (correctAnswers >= 5) {
      evolutionText.textContent =
        round === 1
          ? "✨ RSSIlet évolue en RSSIlex !"
          : round === 2
          ? "🔥 RSSIlex évolue en RSSIrex !"
          : "";
      round++;
      correctAnswers = 0;
      questionIndex = 0;
      if (round > 3) {
        setTimeout(() => {
          throwPokeball();
        }, 1500);
        return;
      }
      setTimeout(async () => {
        evolutionText.textContent = "";
        await loadQuestions();
        nextQuestion();
      }, 2500);
    } else {
      questionIndex = 0;
      correctAnswers = 0;
      setTimeout(() => nextQuestion(), 2000);
    }
  }

  // Pokéball finale
  function throwPokeball() {
    enemyImg.src = "assets/pokeball.png";
    evolutionText.textContent = "ISOku capturé ! Certification ISO27001 obtenue 🎉";
    restartBtn.classList.remove("hidden");
  }

  // Sprite joueur selon état
  function getPlayerSprite(state) {
    if (round === 1) {
      if (state === "idle") return "assets/rssilet_back.png";
      if (state === "attack") return "assets/rssilet_attack.png";
      if (state === "hurt") return "assets/rssilet_hurt.png";
    } else if (round === 2) {
      if (state === "idle") return "assets/rssilex_back.png";
      if (state === "attack") return "assets/rssilex_attack.png";
      if (state === "hurt") return "assets/rssilex_hurt.png";
    } else {
      if (state === "idle") return "assets/rssirex_back.png";
      if (state === "attack") return "assets/rssirex_attack.png";
      if (state === "hurt") return "assets/rssirex_hurt.png";
    }
  }

  // Redémarrage du jeu
  function restartGame() {
    round = 1;
    correctAnswers = 0;
    questionIndex = 0;
    playerHP = 100;
    enemyHP = 100;
    evolutionText.textContent = "";
    restartBtn.classList.add("hidden");
    startBtn.classList.remove("hidden");
    playerImg.src = getPlayerSprite("idle");
    enemyImg.src = "assets/isoku.png";
    updateHPBars();
    questionText.textContent = "";
    answersDiv.innerHTML = "";
    timerText.textContent = "⏱️ 40";
  }

  // -------------------
  // Attacher événements
  // -------------------
  if (startBtn && restartBtn) {
    startBtn.addEventListener("click", startGame);
    restartBtn.addEventListener("click", restartGame);
  }

}); // FIN DOMContentLoaded
