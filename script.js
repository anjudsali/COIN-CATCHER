// ===============================
// COIN CATCHER - ULTIMATE ARCADE
// ===============================

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const homeButton = document.getElementById("homeButton");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");

let score = 0;
let lives = 3;
let gameOver = false;
let animationId = null;

let objects = [];
let spawnCounter = 0;
let gameSpeed = 1;

let selectedCharacter =
    localStorage.getItem("selectedCharacter") || "🐱";

let keys = {};

let magnetActive = false;
let starActive = false;
let shieldActive = false;

let magnetTimer;
let starTimer;

// PLAYER

const player = {
    x: 270,
    y: 330,
    width: 60,
    height: 60,
    speed: 3
};

// OBJECTS

const objectTypes = [
    { type: "coin", emoji: "🪙", points: 10, weight: 40 },
    { type: "apple", emoji: "🍎", points: 20, weight: 12 },
    { type: "strawberry", emoji: "🍓", points: 15, weight: 10 },
    { type: "banana", emoji: "🍌", points: 25, weight: 10 },
    { type: "diamond", emoji: "💎", points: 50, weight: 6 },
    { type: "magnet", emoji: "🧲", points: 0, weight: 5 },
    { type: "star", emoji: "⭐", points: 0, weight: 5 },
    { type: "bomb", emoji: "💣", points: 0, weight: 8 },
    { type: "shield", emoji: "🛡️", points: 0, weight: 4 }
];

// CHARACTER SELECTION

const characters = document.querySelectorAll(".character");

characters.forEach(character => {

    if (character.dataset.character === selectedCharacter) {
        character.classList.add("selected");
    }

    character.addEventListener("click", () => {

        const description = character.querySelector("p");

        if (description.textContent.includes("Locked")) {
            alert("This character is locked!");
            return;
        }

        characters.forEach(c => c.classList.remove("selected"));

        character.classList.add("selected");

        selectedCharacter = character.dataset.character;

        localStorage.setItem("selectedCharacter", selectedCharacter);

    });

});

// CREATE FALLING OBJECT

function createObject() {

    let totalWeight = objectTypes.reduce(
        (total, item) => total + item.weight,
        0
    );

    let random = Math.random() * totalWeight;

    let selected = objectTypes[0];

    for (let item of objectTypes) {

        random -= item.weight;

        if (random <= 0) {
            selected = item;
            break;
        }
    }

    objects.push({

        type: selected.type,
        emoji: selected.emoji,
        points: selected.points,

        x: Math.random() * (canvas.width - 40) + 20,
        y: -30,

        size: 32,

        speed: (0.7 + Math.random() * 0.4) * gameSpeed

    });

}

// DRAW PLAYER

function drawPlayer() {

    ctx.font = "45px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        selectedCharacter,
        player.x + player.width / 2,
        player.y + 45
    );

}

// MOVE PLAYER

function movePlayer() {

    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
        player.x -= player.speed;
    }

    if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
        player.x += player.speed;
    }

    player.x = Math.max(
        0,
        Math.min(canvas.width - player.width, player.x)
    );

}

// DRAW OBJECTS

function drawObjects() {

    ctx.font = "30px Arial";
    ctx.textAlign = "center";

    objects.forEach(object => {

        ctx.fillText(
            object.emoji,
            object.x,
            object.y
        );

    });

}

// UPDATE OBJECTS

function updateObjects() {

    for (let i = objects.length - 1; i >= 0; i--) {

        let object = objects[i];

        object.y += object.speed;

        // MAGNET POWER

        if (magnetActive && object.type === "coin") {

            let targetX = player.x + player.width / 2;

            object.x += (targetX - object.x) * 0.025;

        }

        // COLLISION DETECTION

        let playerCenterX = player.x + player.width / 2;
        let playerCenterY = player.y + player.height / 2;

        let distanceX = Math.abs(object.x - playerCenterX);
        let distanceY = Math.abs(object.y - playerCenterY);

        if (distanceX < 40 && distanceY < 35) {

            collectObject(object);

            objects.splice(i, 1);

            continue;
        }

        // OBJECT MISSED

        if (object.y > canvas.height + 30) {

            objects.splice(i, 1);

        }

    }

}

// COLLECT OBJECT

function collectObject(object) {

    if (object.type === "bomb") {

        if (shieldActive) {

            shieldActive = false;

        } else {

            lives--;

            livesDisplay.textContent = lives;

        }

    }

    else if (object.type === "magnet") {

        magnetActive = true;

        clearTimeout(magnetTimer);

        magnetTimer = setTimeout(() => {
            magnetActive = false;
        }, 6000);

    }

    else if (object.type === "star") {

        starActive = true;

        clearTimeout(starTimer);

        starTimer = setTimeout(() => {
            starActive = false;
        }, 6000);

    }

    else if (object.type === "shield") {

        shieldActive = true;

    }

    else {

        let points = object.points;

        if (starActive) {
            points *= 2;
        }

        score += points;

        scoreDisplay.textContent = score;

    }

}

// DRAW POWERUP STATUS

function drawPowerups() {

    ctx.font = "16px Arial";
    ctx.textAlign = "left";

    let y = 25;

    if (magnetActive) {
        ctx.fillText("🧲 Magnet Active", 10, y);
        y += 22;
    }

    if (starActive) {
        ctx.fillText("⭐ Double Score", 10, y);
        y += 22;
    }

    if (shieldActive) {
        ctx.fillText("🛡️ Shield Active", 10, y);
    }

}

// GAME OVER

function showGameOver() {

    gameOver = true;

    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2, 175);

    ctx.font = "22px Arial";
    ctx.fillText(
        "Your Score: " + score,
        canvas.width / 2,
        220
    );

    ctx.font = "18px Arial";
    ctx.fillText(
        "Press Play Again!",
        canvas.width / 2,
        265
    );

    restartButton.hidden = false;

}

// MAIN GAME LOOP

function gameLoop() {

    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();

    drawPlayer();

    spawnCounter++;

    if (spawnCounter >= 110) {

        createObject();

        spawnCounter = 0;

    }

    updateObjects();

    drawObjects();

    drawPowerups();

    // SLOW DIFFICULTY INCREASE

    gameSpeed = Math.min(
        1.2,
        1 + score / 5000
    );

    if (lives <= 0) {

        showGameOver();

        return;

    }

    animationId = requestAnimationFrame(gameLoop);

}

// RESET GAME

function resetGame() {

    score = 0;
    lives = 3;

    gameOver = false;

    objects = [];

    player.x = 270;

    gameSpeed = 1;

    spawnCounter = 0;

    magnetActive = false;
    starActive = false;
    shieldActive = false;

    clearTimeout(magnetTimer);
    clearTimeout(starTimer);

    keys = {};

    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;

    restartButton.hidden = true;

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
    }

    gameLoop();

}

// START GAME

startButton.addEventListener("click", () => {

    startScreen.hidden = true;

    gameScreen.hidden = false;

    resetGame();

});

// RESTART GAME

restartButton.addEventListener("click", () => {

    resetGame();

});

// HOME BUTTON

homeButton.addEventListener("click", () => {

    gameOver = true;

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
    }

    clearTimeout(magnetTimer);
    clearTimeout(starTimer);

    gameScreen.hidden = true;

    startScreen.hidden = false;

});

// KEYBOARD CONTROLS

document.addEventListener("keydown", event => {

    keys[event.key] = true;

    if (
        ["ArrowLeft", "ArrowRight", " "].includes(event.key)
    ) {
        event.preventDefault();
    }

});

document.addEventListener("keyup", event => {

    keys[event.key] = false;

});