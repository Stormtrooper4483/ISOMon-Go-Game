document.addEventListener("DOMContentLoaded", () => {

let round = 1;
let correctAnswers = 0;
let totalCorrect = 0;
let questionIndex = 0;
let questions = [];

let timer;
let timeLeft = 40;

const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

const timerText = document.getElementById("timer");

async function loadQuestions() {
  const res = await fetch("questions.json");
  const data = await res.json();

  questions = data
    .filter(q => q.difficulty === round)
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);
}

async function startGame() {
  round = 1;
  correctAnswers = 0;
  totalCorrect = 0;
  questionIndex = 0;

  startBtn.classList.add("hidden");
  restartBtn.classList.add("hidden");

  document.getElementById("result-screen").classList.add("hidden");

  await loadQuestions();
  nextQuestion();
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 40;

  timerText.textContent = "⏱️ " + timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    timerText.textContent = "⏱️ " + timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      questionIndex++;
      nextQuestion();
    }
  }, 1000);
}

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
        correctAnswers++;
        totalCorrect++;
      }

      document.getElementById("explanation").textContent = q.explanation;
      questionIndex++;

      setTimeout(nextQuestion, 800);
    };

    answersDiv.appendChild(btn);
  });
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
  restartBtn.classList.remove("hidden");
}

function lose() {
  alert("Perdu !");
  restartBtn.classList.remove("hidden");
}

startBtn.onclick = startGame;
restartBtn.onclick = startGame;

});

function downloadImage() {
  html2canvas(document.querySelector("#capture-area")).then(canvas => {
    const link = document.createElement("a");
    link.download = "score.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}
