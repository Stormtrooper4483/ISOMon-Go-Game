let enemyHP = 80;
let playerHP = 90;

function answer(isCorrect) {
  const feedback = document.getElementById("feedback");

  if (isCorrect) {
    feedback.innerText = "Attaque réussie !";

    enemyHP -= 20;
    document.querySelector(".enemy-hp").style.width = enemyHP + "%;

    animateHit(".enemy-sprite");
  } else {
    feedback.innerText = "Mauvaise réponse...";

    playerHP -= 20;
    document.querySelector(".player-hp").style.width = playerHP + "%";

    animateHit(".player-sprite");
  }
}

function animateHit(selector) {
  const el = document.querySelector(selector);

  el.style.transform = "translateX(10px)";
  setTimeout(() => {
    el.style.transform = "translateX(-10px)";
  }, 100);

  setTimeout(() => {
    el.style.transform = "translateX(0)";
  }, 200);
}
