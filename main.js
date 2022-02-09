import SETTINGS from "./settings.js";

const { step, speed, cellWidth, cellHeight, gameWidth,
  gameHeight, cellBorder, cobraFillColor, cobraBorderColor,
  appleBorderColor, appleFillColor } = SETTINGS;

const DIRECTIONS = {
  RIGHT: "RIGHT",
  LEFT: "LEFT",
  UP: "UP",
  DOWN: "DOWN"
}

const initialCobra = [{ x: 100, y: 100 }, { x: 120, y: 100 }, { x: 140, y: 100 }, { x: 160, y: 100 }];

const canvas = document.getElementById("cobra-game");
const startCobra = document.getElementById("start-cobra");
const stopCobra = document.getElementById("stop-cobra");
const cobraInfo = document.querySelector(".cobra-info b");
const cobraModal = document.querySelector(".cobra-modal");
const cobraModalInfo = document.querySelector(".cobra-modal p b");
const playCobraAgain = document.getElementById("play-cobra-again");
const ctx = canvas.getContext("2d");

let cobraState = {
  cobra: initialCobra,
  direction: DIRECTIONS.RIGHT
};
let apple = newAppleState();
let gameId;
let isGameRunning = false;

const drawCobra = () => {
  cobraState.cobra.forEach(({ x, y }) => {
    drawOneCell(x, y, cobraFillColor, cobraBorderColor);
  });
}

const drawApple = () => {
  drawOneCell(apple.x, apple.y, appleFillColor, appleBorderColor);
}

const drawOneCell = (x, y, fillColor, borderColor) => {
  ctx.fillStyle = borderColor;
  ctx.fillRect(x - cellBorder, y - cellBorder, cellWidth + cellBorder * 2, cellHeight + cellBorder * 2);
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, cellWidth, cellHeight);
}

const clearOneCell = (x, y) => {
  ctx.clearRect(x - cellBorder, y - cellBorder, cellWidth + cellBorder * 2, cellHeight + cellBorder * 2);
}

function newAppleState() {
  let randX = randomMultiple(0, gameWidth - step, step);
  let randY = randomMultiple(0, gameHeight - step, step);

  while(cobraState.cobra.find((item) => item.x === randX && item.y === randY)) {
    randX = randomMultiple(0, gameWidth - step, step);
    randY = randomMultiple(0, gameHeight - step, step);
  }

  return { x: randX, y: randY };
}

const newCobraState = () => {
  const { cobra, direction } = cobraState;
  const length = cobra.length;
  let newCobra = [];

  clearOneCell(cobra[0].x, cobra[0].y);

  // IF DIE
  for (let i = 0; i < length - 1; i++) {
    if (cobra[length - 1].x === cobra[i].x && cobra[length - 1].y === cobra[i].y) {
      stopGame();
      cobraModal.style.display = "block";
    }
  }

  // IF APPLE
  if (apple.x === cobra[length - 1].x && apple.y === cobra[length - 1].y) {
    apple = newAppleState();
    newCobra.push({ x: cobra[0].x, y: cobra[0].y });
  }

  cobra.forEach((item, i) => {
    if (i !== length - 1) {
      newCobra.push(cobra[i + 1]);
    }
  });

  switch (direction) {
    case DIRECTIONS.RIGHT:
      if (cobra[length - 1].x + step >= gameWidth) {
        newCobra.push({ x: 0, y: cobra[length - 1].y });
      } else {
        newCobra.push({ x: cobra[length - 1].x + step, y: cobra[length - 1].y });
      }
      break;
    case DIRECTIONS.LEFT:
      if (cobra[length - 1].x - step < 0) {
        newCobra.push({ x: gameWidth - step, y: cobra[length - 1].y });
      } else {
        newCobra.push({ x: cobra[length - 1].x - step, y: cobra[length - 1].y });
      }
      break;
    case DIRECTIONS.UP:
      if (cobra[length - 1].y - step < 0) {
        newCobra.push({ x: cobra[length - 1].x, y: gameHeight - step });
      } else {
        newCobra.push({ x: cobra[length - 1].x, y: cobra[length - 1].y - step });
      }
      break;
    case DIRECTIONS.DOWN:
      if (cobra[length - 1].y + step >= gameHeight) {
        newCobra.push({ x: cobra[length - 1].x, y: 0 });
      } else {
        newCobra.push({ x: cobra[length - 1].x, y: cobra[length - 1].y + step });
      }
      break;
    default:
      break;
  }

  cobraState.cobra = newCobra;
}

document.onkeydown = (event) => {
  event.preventDefault();

  const { direction } = cobraState;

  switch (event.code) {
    case "ArrowRight":
      if (direction !== DIRECTIONS.LEFT) {
        cobraState.direction = DIRECTIONS.RIGHT;
      }
      break;
    case "ArrowLeft":
      if (direction !== DIRECTIONS.RIGHT) {
        cobraState.direction = DIRECTIONS.LEFT;
      }
      break;
    case "ArrowUp":
      if (direction !== DIRECTIONS.DOWN) {
        cobraState.direction = DIRECTIONS.UP;
      }
      break;
    case "ArrowDown":
      if (direction !== DIRECTIONS.UP) {
        cobraState.direction = DIRECTIONS.DOWN;
      }
      break;
    default:
      break;
  }
};

const updateInfo = () => {
  cobraInfo.innerText = cobraState.cobra.length;
  cobraModalInfo.innerText = cobraState.cobra.length;
}

function randomMultiple(min, max, multiple) {
  return Math.floor(Math.random() * (((max - min) / multiple) + 1)) * multiple + min;
}

const runGame = () => {
  newCobraState();
  drawCobra();
  drawApple();
  updateInfo();
}

const startGame = () => {
  if (!isGameRunning) {
    gameId = setInterval(runGame, speed);
    isGameRunning = true;
  }
}

const stopGame = () => {
  if (isGameRunning) {
    clearInterval(gameId);
    isGameRunning = false;
  }
}

startCobra.onclick = startGame;
stopCobra.onclick = stopGame;
playCobraAgain.onclick = () => {
  cobraModal.style.display = "none";
  ctx.clearRect(0, 0, gameWidth, gameHeight);
  cobraState.cobra = initialCobra;
  cobraState.direction = DIRECTIONS.RIGHT;
  newCobraState();
  apple = newAppleState();
  startGame();
};
