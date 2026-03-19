document.addEventListener("DOMContentLoaded", () => {

let round = 1;
let correctAnswers = 0;
let questionIndex = 0;
let questions = [];
let totalCorrect = 0;

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

const questionText = document.getElementById("question");
const answersDiv = document.getElementById("answers");
const explanationDiv = document.getElementById("explanation");

async function loadQuestions() {
  const res = await fetch("questions.json");
  const data = await res.json();
  questions = data.filter(q => q.difficulty === round)
                  .sort(() => Math.random() - 0.5)
                  .slice(0, 6);
}

async function startGame() {
  round = 1;
  totalCorrect = 0;
  playerHP = 100;
  enemyHP = 100;
  correctAnswers = 0;
  questionIndex = 0;

  document.getElementById("result-screen").classList.add("hidden");

  await loadQuestions();
  nextQuestion();
}

function nextQuestion() {
  if (questionIndex >= questions.length) return endRound();

  const q = questions[questionIndex];
  questionText.textContent = q.question;
  answersDiv.innerHTML = "";

  q.answers.forEach(ans => {
    const btn = document.createElement("div");
    btn.className = "answer";
    btn.textContent = ans.text;

    btn.onclick = () => {
      ans.correct ? good(q) : wrong(q);
    };

    answersDiv.appendChild(btn);
  });
}

function good(q) {
  correctAnswers++;
  totalCorrect++;
  enemyHP -= 20;
  explanationDiv.textContent = q.explanation;
  next();
}

function wrong(q) {
  playerHP -= 20;
  explanationDiv.textContent = q.explanation;
  next();
}

function next() {
  questionIndex++;
  if (playerHP <= 0) return lose();
  nextQuestion();
}

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

function win() {
  document.getElementById("final-score").textContent =
    "Score : " + totalCorrect + "/18";

  document.getElementById("result-screen").classList.remove("hidden");
}

function lose() {
  alert("Game Over");
}

startBtn.onclick = startGame;
restartBtn.onclick = startGame;

});

/* SCREENSHOT */
function downloadImage() {
  html2canvas(document.querySelector("#capture-area")).then(canvas => {
    const link = document.createElement("a");
    link.download = "score.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}
