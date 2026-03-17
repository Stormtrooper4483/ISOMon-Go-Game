let data;
let currentLevel = 0;
let levels = ["easy", "medium", "hard"];
let questions = [];
let index = 0;
let score = 0;

let playerHP = 100;
let enemyHP = 100;

let timer;
let timeLeft = 40;

const playerForms = [
  "rssilet_back.png",
  "rssirex_back.png",
  "rssilex_back.png"
];

async function init() {
  const res = await fetch("questions.json");
  data = await res.json();
  startLevel();
}

function startLevel() {
  let pool = [...data[levels[currentLevel]]];
  questions = pool.sort(() => 0.5 - Math.random()).slice(0, 6);
  index = 0;
  score = 0;
  nextQuestion();
}

function nextQuestion() {
  if (index >= questions.length) {
    if (score >= 5) {
      levelUp();
    } else {
      gameOver();
    }
    return;
  }

  let q = questions[index];
  document.getElementById("question").innerText = q.question;

  let answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  q.answers.forEach((a, i) => {
    let btn = document.createElement("button");
    btn.innerText = a;
    btn.onclick = () => answer(i === q.correct);
    answersDiv.appendChild(btn);
  });

  startTimer();
}

function answer(correct) {
  clearInterval(timer);

  if (correct) {
    score++;
    enemyHP -= 15;
    animate("enemy");
  } else {
    playerHP -= 15;
    animate("player");
  }

  updateHP();

  index++;
  setTimeout(nextQuestion, 1000);
}

function updateHP() {
  document.getElementById("enemy-hp").style.width = enemyHP + "%";
  document.getElementById("player-hp").style.width = playerHP + "%";
}

function animate(target) {
  let el = document.getElementById(target + "-sprite");
  el.style.transform = "translateX(10px)";
  setTimeout(() => el.style.transform = "translateX(0)", 200);
}

function levelUp() {
  currentLevel++;

  if (currentLevel >= 3) {
    winGame();
    return;
  }

  alert("Évolution !");
  document.getElementById("player-sprite").src =
    "sprites/" + playerForms[currentLevel];

  startLevel();
}

function startTimer() {
  timeLeft = 40;
  document.getElementById("timer").innerText = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      answer(false);
    }
  }, 1000);
}

function gameOver() {
  alert("Game Over !");
}

function winGame() {
  alert("Certification ISO 27001 obtenue !");
}

init();
