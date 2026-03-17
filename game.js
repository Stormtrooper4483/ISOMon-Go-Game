// ============================
// ISOmon GO - Game Engine (VERSION FINALE)
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

let gameReady = false
let answering = false

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

const pokeball = document.getElementById("pokeball")

// ============================
// LOAD QUESTIONS
// ============================

fetch("./questions.json")
.then(response => response.json())
.then(data => {
    levels = data.levels
    gameReady = true
    console.log("Questions loaded")
})
.catch(err => {
    console.error("Erreur chargement JSON", err)
    dialogueText("Erreur de chargement des questions 😢")
})

// ============================
// START GAME
// ============================

startBtn.onclick = () => {
    if(!gameReady){
        dialogueText("Chargement en cours...")
        return
    }

    startBtn.style.display = "none"

    dialogueText(
        "Prof Cyber : Bienvenue dresseur !\n" +
        "Pour obtenir la certification ISO 27001,\n" +
        "tu dois capturer ISOku."
    )

    setTimeout(() => {
        dialogueText("Réponds correctement pour attaquer !")
    },3000)

    setTimeout(() => {
        startLevel()
    },5000)
}

// ============================
// START LEVEL
// ============================

function startLevel(){
    if(!levels[currentLevel]){
        console.error("Level introuvable", currentLevel)
        return
    }

    enemyHP = 100
    playerHP = 100
    updateHP()

    questionIndex = 0

    const levelQuestions = levels[currentLevel].questions

    currentQuestions = shuffle([...levelQuestions]).slice(0, QUESTIONS_PER_LEVEL)

    dialogueText("ISOku apparaît !")

    setTimeout(loadQuestion,1500)
}

// ============================
// LOAD QUESTION
// ============================

function loadQuestion(){
    answering = false

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

        btn.onclick = () => {
            if(answering) return
            answering = true
            checkAnswer(index)
        }

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
    } else {
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
        setTimeout(levelCompleted,1200)
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
    setTimeout(loadQuestion,1200)
}

// ============================
// LEVEL COMPLETED
// ============================

function levelCompleted(){
    clearInterval(timerInterval)
    dialogueText("Le RSSI lance une Pokeball !")

    if(pokeball){
        pokeball.style.display = "block"
        pokeball.classList.add("throw")

        setTimeout(()=>{
            pokeball.style.display = "none"
            pokeball.classList.remove("throw")
        },1500)
    }

    setTimeout(()=>{
        currentLevel++

        if(currentLevel === 1){
            evolve("RSSIrex","./assets/rssirex.png")
        }
        else if(currentLevel === 2){
            evolve("RSSIlex","./assets/rssilex.png")
        }
        else{
            winGame()
            return
        }

        startLevel()
    },2000)
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
    dialogueText("ISOku capturé ! Certification obtenue 🎉")
    questionBox.innerText = ""
    answersBox.innerHTML = ""
}

// ============================
// GAME OVER
// ============================

function gameOver(){
    dialogueText("Ton Pokémon est KO... Game Over")
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
// SHUFFLE (Fisher-Yates FINAL)
// ============================

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // ✅ correct
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
