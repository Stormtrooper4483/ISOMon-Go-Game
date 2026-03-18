let data;
let levels = ["easy","medium","hard"];
let levelIndex = 0;
let questions = [];
let i = 0;
let score = 0;

let playerHP = 100;
let enemyHP = 100;

async function init() {
  const res = await fetch("questions.json");
  data = await res.json();
  startLevel();
}

function startLevel() {
  let pool = [...data[levels[levelIndex]]];
  questions = pool.sort(()=>0.5-Math.random()).slice(0,6);
  i = 0;
  score = 0;
  nextQuestion();
}

function nextQuestion() {
  if (i >= questions.length) {
    if (score >= 5) levelUp();
    else gameOver();
    return;
  }

  let q = questions[i];
  document.getElementById("question").innerText = q.question;

  let answers = document.getElementById("answers");
  answers.innerHTML = "";

  q.answers.forEach((a, idx)=>{
    let btn = document.createElement("button");
    btn.innerText = a;
    btn.onclick = ()=>answer(idx === q.correct);
    answers.appendChild(btn);
  });
}

function answer(correct){
  if(correct){
    enemyHP -= 20;
    hit("enemy");
    score++;
  } else {
    playerHP -= 20;
    hit("player");
  }

  updateHP();

  i++;
  setTimeout(nextQuestion,1000);
}

function hit(target){
  let el = document.getElementById(target+"-sprite");
  el.classList.add("hit");

  if(target==="enemy"){
    el.src="sprites/isoku_hit.png";
    setTimeout(()=>el.src="assets/isoku.png",300);
  } else {
    el.src="sprites/rssilet_hit.png";
    setTimeout(()=>el.src="assets/rssilet_back.png",300);
  }

  setTimeout(()=>el.classList.remove("hit"),200);
}

function updateHP(){
  document.getElementById("enemy-hp").style.width = enemyHP+"%";
  document.getElementById("player-hp").style.width = playerHP+"%";

  if(enemyHP<=0 && levelIndex===2){
    captureSequence();
  }
}

function levelUp(){
  levelIndex++;
  playerHP = 100;
  enemyHP = 100;

  if(levelIndex===1)
    document.getElementById("player-sprite").src="assets/rssirex_back.png";
  if(levelIndex===2)
    document.getElementById("player-sprite").src="assets/rssilex_back.png";

  startLevel();
}

function captureSequence(){
  showText("RSSIlex lance une Pokéball !");

  let ball = document.createElement("img");
  ball.src="assets/pokeball.png";
  ball.className="pokeball";
  document.getElementById("game").appendChild(ball);

  setTimeout(()=>{
    ball.classList.add("capture");

    setTimeout(()=>{
      showText("...");
    },500);

    setTimeout(()=>{
      showText("ISOKu est capturé !");
    },1500);

    setTimeout(()=>{
      winGame();
    },2500);

  },800);
}

function showText(text){
  document.getElementById("battle-text").innerText = text;
}

function gameOver(){
  showText("Game Over...");
}

function winGame(){
  showText("🎓 Certification ISO 27001 obtenue !");
}

init();
