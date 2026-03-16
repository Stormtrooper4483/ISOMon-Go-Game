// ============================
// ISOmon GO - Game Engine
// ============================

const QUESTIONS_PER_LEVEL = 6
const TIME_PER_QUESTION = 40

let levels = []
let currentLevel = 0
let currentQuestions = []
let questionIndex = 0

let playerHP = 100
let enemyHP = 100

let timerInterval
let timeLeft = TIME_PER_QUESTION

// DOM
const startBtn = document.getElementById("startBtn")
const dialogue = document.getElementById("dialogue")
const questionBox = document.getElementById("question")
const answersBox = document.getElementById("answers")

const timerDisplay = document.getElementById("timer")

const playerHPbar = document.getElementById("playerHP")
const enemyHPbar = document.getElementById("enemyHP")

const playerSprite = document.getElementById("playerSprite")
const enemySprite = document.getElementById("enemySprite")

const playerName = document.getElementById("playerName")

// ============================
// LOAD QUESTIONS
// ============================

fetch("questions.json")
.then(response => response.json())
.then(data => {

levels = data.levels

console.log("Questions loaded")

})

// ============================
// START GAME
// ============================

startBtn.onclick = () => {

startBtn.style.display = "none"

dialogueText(
"Prof Cyber : Bienvenue dresseur !\n" +
"Pour obtenir la certification ISO 27001,\n" +
"tu dois capturer le Pokémon légendaire ISOku."
)

setTimeout(() => {

dialogueText(
"Réponds correctement aux questions ISO 27001\n" +
"pour attaquer ISOku !"
)

},3000)

setTimeout(() => {

startLevel()

},6000)

}

// ============================
// START LEVEL
// ============================

function startLevel(){

enemyHP = 100
updateHP()

questionIndex = 0

const levelQuestions = levels[currentLevel].questions

currentQuestions = shuffle(levelQuestions).slice(0, QUESTIONS_PER_LEVEL)

dialogueText("ISOku apparaît !")

setTimeout(loadQuestion,2000)

}

// ============================
// LOAD QUESTION
// ============================

function loadQuestion(){

if(questionIndex >= currentQuestions.length){

levelCompleted()
return

}

const q = currentQuestions[questionIndex]

questionBox.innerText = q.question

answersBox.innerHTML = ""

q.options.forEach((option,index)=>{

const btn = document.createElement("button")

btn.innerText = option

btn.className = "answerButton"

btn.onclick = () => checkAnswer(index)

answersBox.appendChild(btn)

})

startTimer()

}

// ============================
// TIMER
// ============================

function startTimer(){

clearInterval(timerInterval)

timeLeft = TIME_PER_QUESTION
timerDisplay.innerText = timeLeft

timerInterval = setInterval(()=>{

timeLeft--

timerDisplay.innerText = timeLeft

if(timeLeft <= 0){

clearInterval(timerInterval)

enemyAttack()

}

},1000)

}

// ============================
// ANSWER
// ============================

function checkAnswer(selected){

clearInterval(timerInterval)

const q = currentQuestions[questionIndex]

if(q.answers.includes(selected)){

playerAttack()

}else{

enemyAttack()

}

}

// ============================
// PLAYER ATTACK
// ============================

function playerAttack(){

animateAttack(playerSprite)

dialogueText(playerName.innerText + " utilise Firewall Strike !")

enemyHP -= 20

updateHP()

if(enemyHP <= 0){

setTimeout(levelCompleted,1500)

return

}

nextQuestion()

}

// ============================
// ENEMY ATTACK
// ============================

function enemyAttack(){

animateAttack(enemySprite)

dialogueText("ISOku utilise Procedure Blast !")

playerHP -= 20

updateHP()

if(playerHP <= 0){

gameOver()
return

}

nextQuestion()

}

// ============================
// NEXT QUESTION
// ============================

function nextQuestion(){

questionIndex++

setTimeout(loadQuestion,2000)

}

// ============================
// LEVEL COMPLETED
// ============================

function levelCompleted(){

dialogueText("Le RSSI lance une Pokeball !")

setTimeout(()=>{

currentLevel++

if(currentLevel === 1){

evolve("RSSIrex","assets/rssirex.png")

}

else if(currentLevel === 2){

evolve("RSSIlex","assets/rssilex.png")

}

else{

winGame()
return

}

startLevel()

},2500)

}

// ============================
// EVOLUTION
// ============================

function evolve(name,sprite){

dialogueText(playerName.innerText + " évolue en " + name + " !")

playerName.innerText = name

playerSprite.src = sprite

}

// ============================
// WIN GAME
// ============================

function winGame(){

dialogueText(
"ISOku a été capturé !\n" +
"Certification ISO 27001 obtenue !"
)

questionBox.innerText = ""
answersBox.innerHTML = ""

}

// ============================
// GAME OVER
// ============================

function gameOver(){

dialogueText("RSSIlex est KO.\nGame Over.")

questionBox.innerText = ""
answersBox.innerHTML = ""

}

// ============================
// UPDATE HP
// ============================

function updateHP(){

playerHPbar.style.width = playerHP + "%"
enemyHPbar.style.width = enemyHP + "%"

}

// ============================
// DIALOGUE
// ============================

function dialogueText(text){

dialogue.innerText = text

}

// ============================
// ANIMATION
// ============================

function animateAttack(sprite){

sprite.style.transform = "translateX(-20px)"

setTimeout(()=>{

sprite.style.transform = "translateX(0px)"

},200)

}

// ============================
// SHUFFLE
// ============================

function shuffle(array){

for(let i = array.length - 1; i > 0; i--){

const j = Math.floor(Math.random() * (i + 1))

[array[i],array[j]] = [array[j],array[i]]

}

return array

}