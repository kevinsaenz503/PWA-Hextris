const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
	
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const HEX_RADIUS = 100;
const BLOCK_HEIGHT = 24;
const MAX_STACK_HEIGHT = 10;

let score = 0;
let gameOver = false;

let currentRotation = 0;
let targetRotation = 0;

const colors = [
    "#ff5252",
    "#ffeb3b",
    "#4caf50",
    "#2196f3",
    "#9c27b0",
    "#ff9800"
];

const stacks = [
    [],
    [],
    [],
    [],
    [],
    []
];

const blocks = [];
const particles = [];

let highScore =
    parseInt(
        localStorage.getItem(
            "hextrisHighScore"
        )
    ) || 0;
   const highScoreElement =
    document.getElementById(
        "highScore"
    );

if (highScoreElement) {

    highScoreElement.textContent =
        highScore;
} 
    
let spawnInterval = 1500;

/* =========================
   CLASE BLOQUE
========================= */

class Block {

    constructor() {

        this.lane =
            Math.floor(
                Math.random() * 6
            );

        this.color =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];

        this.distance = 320;

        this.speed = 1.5;
    }

    update() {

        this.distance -=
            this.speed;
    }

    draw() {

        const angle =
            (Math.PI / 3) *
            this.lane;

        const x =
            centerX +
            this.distance *
            Math.cos(angle);

        const y =
            centerY +
            this.distance *
            Math.sin(angle);

        ctx.save();

        ctx.translate(
            x,
            y
        );

        ctx.rotate(angle);

        ctx.fillStyle =
            this.color;

        ctx.fillRect(
            -14,
            -32,
            28,
            64
        );

        ctx.restore();
    }
}
class Particle {

    constructor(
        x,
        y,
        color
    ) {

        this.x = x;
        this.y = y;

        this.color =
            color;

        this.life = 40;

        this.vx =
            (Math.random() - 0.5)
            * 6;

        this.vy =
            (Math.random() - 0.5)
            * 6;
    }

    update() {

        this.x += this.vx;

        this.y += this.vy;

        this.life--;
    }

    draw() {

        ctx.globalAlpha =
            this.life / 40;

        ctx.fillStyle =
            this.color;

        ctx.fillRect(
            this.x,
            this.y,
            4,
            4
        );

        ctx.globalAlpha = 1;
    }
}
/* =========================
   GENERACIÓN DE BLOQUES
========================= */

function spawnBlock() {

    if (gameOver) {
        return;
    }

    blocks.push(
        new Block()
    );
}

setInterval(
    spawnBlock,
    spawnInterval
);
setInterval(() => {

    if (gameOver) {
        return;
    }

    for (
        const block
        of blocks
    ) {

        block.speed += 0.08;
    }

}, 10000);
/* =========================
   ROTACIÓN SUAVE
========================= */

function updateRotation() {

    currentRotation +=
        (
            targetRotation -
            currentRotation
        ) * 0.18;
}

document.addEventListener(
    "keydown",
    (e) => {

        if (
            e.key ===
            "ArrowLeft"
        ) {

            targetRotation -=
                Math.PI / 3;
        }

        if (
            e.key ===
            "ArrowRight"
        ) {

            targetRotation +=
                Math.PI / 3;
        }
    }
);

/* =========================
   HEXÁGONO CENTRAL
========================= */

function drawHexagon() {

    ctx.save();

    ctx.translate(
        centerX,
        centerY
    );

    ctx.rotate(
        currentRotation
    );

    ctx.beginPath();

    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const angle =
            (Math.PI / 3) * i;

        const x =
            HEX_RADIUS *
            Math.cos(angle);

        const y =
            HEX_RADIUS *
            Math.sin(angle);

        if (i === 0) {

            ctx.moveTo(
                x,
                y
            );

        } else {

            ctx.lineTo(
                x,
                y
            );
        }
    }

    ctx.closePath();

    ctx.strokeStyle =
        "#00BCD4";

    ctx.lineWidth = 12;

    ctx.shadowBlur = 25;

    ctx.shadowColor =
        "#00BCD4";

    ctx.stroke();

    ctx.restore();
}

/* =========================
   DIBUJAR PILAS
========================= */

function drawStacks() {

    for (
        let side = 0;
        side < 6;
        side++
    ) {

        const stack =
            stacks[side];

        const angle =
            (Math.PI / 3) *
            side +
            currentRotation;

        for (
            let level = 0;
            level < stack.length;
            level++
        ) {

            const distance =
                HEX_RADIUS +
                25 +
                (
                    level *
                    BLOCK_HEIGHT
                );

            const x =
                centerX +
                distance *
                Math.cos(angle);

            const y =
                centerY +
                distance *
                Math.sin(angle);

            ctx.save();

            ctx.translate(
                x,
                y
            );

            ctx.rotate(
                angle
            );

            ctx.fillStyle =
                stack[level]
                .color;

            ctx.fillRect(
                -12,
                -18,
                24,
                36
            );

            ctx.restore();
        }
    }
}

/* =========================
   LADO REAL
========================= */

function getRealSide(
    block
) {

    const steps =
        Math.round(
            currentRotation /
            (
                Math.PI / 3
            )
        );

    let side =
        (
            block.lane -
            steps
        ) % 6;

    if (
        side < 0
    ) {

        side += 6;
    }

    return side;
}

/* =========================
   ACTUALIZAR BLOQUES
========================= */

function updateBlocks() {

    for (
        let i =
            blocks.length - 1;
        i >= 0;
        i--
    ) {

        const block =
            blocks[i];

        block.update();

        const side =
            getRealSide(
                block
            );

        const stackHeight =
            stacks[side]
            .length;

        const collisionDistance =
            HEX_RADIUS +
            25 +
            (
                stackHeight *
                BLOCK_HEIGHT
            );

        if (
            block.distance <=
            collisionDistance
        ) {

            stacks[side]
                .push({

                    color:
                        block.color

                });

            blocks.splice(
                i,
                1
            );

            checkMatches(
                side
            );
        }
    }
}

/* =========================
   DIBUJAR BLOQUES
========================= */

function drawBlocks() {

    for (
        const block
        of blocks
    ) {

        block.draw();
    }
}

/* =========================
   COMBINACIONES
========================= */

function checkMatches(
    side
) {

    const stack =
        stacks[side];

    if (
        stack.length < 3
    ) {
        return;
    }

    const color =
        stack[
            stack.length - 1
        ].color;

    let count = 0;

    for (
        let i =
            stack.length - 1;
        i >= 0;
        i--
    ) {

        if (
            stack[i]
            .color ===
            color
        ) {

            count++;

        } else {

            break;
        }
    }

    if (
        count >= 3
    ) {

        stack.splice(
            stack.length -
            count,
            count
        );

        score +=
            count * 100;

        document
            .getElementById(
                "score"
            )
            .textContent =
            score;
    }
}

/* =========================
   GAME OVER
========================= */
function saveHighScore() {

    if (
        score >
        highScore
    ) {

        highScore =
            score;

        localStorage.setItem(
            "hextrisHighScore",
            highScore
        );
    }
}
function endGame() {
saveHighScore();
    gameOver = true;

    document
        .getElementById(
            "finalScore"
        )
        .textContent =
        score;

    document
        .getElementById(
            "gameOverModal"
        )
        .classList
        .remove(
            "hidden"
        );
}

/* =========================
   VERIFICAR ALTURA MÁXIMA
========================= */

function checkGameOver() {

    for (
        let side = 0;
        side < 6;
        side++
    ) {

        if (
            stacks[side]
            .length >=
            MAX_STACK_HEIGHT
        ) {

            endGame();
            return;
        }
    }
}

/* =========================
   REINICIAR
========================= */

function restartGame() {

    score = 0;

    gameOver = false;

    currentRotation = 0;

    targetRotation = 0;

    blocks.length = 0;

    for (
        let i = 0;
        i < 6;
        i++
    ) {

        stacks[i] = [];
    }

    document
        .getElementById(
            "score"
        )
        .textContent =
        "0";

    document
        .getElementById(
            "gameOverModal"
        )
        .classList
        .add(
            "hidden"
        );
}

/* =========================
   BOTONES
========================= */

document
    .getElementById(
        "restartBtn"
    )
    .addEventListener(
        "click",
        restartGame
    );

document
    .getElementById(
        "playAgainBtn"
    )
    .addEventListener(
        "click",
        restartGame
    );

/* =========================
   BUCLE PRINCIPAL
========================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    if (
        !gameOver
    ) {

        updateRotation();

        updateBlocks();

        checkGameOver();
    }

    drawHexagon();

    drawStacks();

    drawBlocks();
    

    requestAnimationFrame(
        draw
    );
}

/* =========================
   INICIAR JUEGO
========================= */

let gameStarted = false;

function startHextris() {

    if (gameStarted) return;

    gameStarted = true;

    restartGame();

    draw();

}
