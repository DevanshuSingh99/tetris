const page = document.getElementById("page");

let GAME_ID = null;

let IS_STARTED = false;
let IS_PAUSED = false;

let OCCUPIED_CELL = new Set();

let SCORE = 0;
const ROWS = 20;
const COLUMNS = 15;
const DIFFICULTIES = {
  easy: 1000,
  medium: 500,
  hard: 300,
  crazy: 50,
};

const OBJECT_COLORS = ["red", "green", "blue", "brown"];
const OBJECTS = [
  {
    name: "I",
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
    rotation_rules: [],
  },
  {
    name: "L",
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ],
    rotation_rules: [],
  },
  {
    name: "Z",
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
    rotation_rules: [],
  },
  {
    name: "O",
    cells: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    rotation_rules: [],
  },
];
const START_COLUMN = Math.floor(COLUMNS / 2);

let PLAYING_OBJECT = { object: null, id: null, color: null };

function createGrids(y, x) {
  page.innerHTML = "";
  const grid = document.createElement("div");
  grid.classList.add(`grid`);

  for (let i = 0; i < y; i++) {
    const row = document.createElement("div");
    row.classList.add("row");

    for (let j = 0; j < x; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      const cellId = "cell-" + i + "-" + j;
      cell.setAttribute("id", cellId);
      row.appendChild(cell);
    }

    grid.appendChild(row);
  }
  page.appendChild(grid);
}
function getElementByCellId(id) {
  return document.getElementById(`cell-${id}`);
}

const OBJECT_FUNCTIONS = {
  renderNewObjects: () => {
    const id = Math.floor(Math.random() * 1010101010);
    const color =
      OBJECT_COLORS[Math.floor(Math.random() * OBJECT_COLORS.length)];
    const object = JSON.parse(
      JSON.stringify(
        OBJECTS[Math.floor(Math.random() * Object.keys(OBJECTS).length)]
      )
    );
    //   PLAYING_OBJECT_Id = randomObjectId;
    for (const cell of object.cells) {
      cell[1] = cell[1] + START_COLUMN;
      const cellId = cell[0] + "-" + cell[1];
      const cellElement = getElementByCellId(cellId);
      OCCUPIED_CELL.add(cellId);
      cellElement.style.backgroundColor = color;
    }
    return { object, color, id };
  },
};

const OBJECT_MOVEMENT_FUNCTIONS = {
  dropPlayingObject: () => {},
};

function logic() {
  if (PLAYING_OBJECT.object === null) {
    PLAYING_OBJECT = OBJECT_FUNCTIONS.renderNewObjects();
  } else {
    // let { object, recreate } = MOVEMENT.dropPlayingObject();
    // if (recreate) {
    //   PLAYING_OBJECT = renderNewObjects();
    // } else {
    //   PLAYING_OBJECT = object;
    // }
    console.log(PLAYING_OBJECT);
  }
}

const GAME_FUNCTIONS = {
  startGame: () => {
    if (!IS_STARTED) {
      IS_STARTED = true;
      GAME_ID = setInterval(function () {
        // if (!IS_PAUSED) {
        logic();
        SCORE++;
        $("#timer").text(`Timer : ${SCORE}`);
        // }
      }, DIFFICULTIES.hard);
    }
  },
  pauseGame: () => {
    if (GAME_ID) {
      clearInterval(GAME_ID);
      IS_PAUSED = true;
    }
  },
  resumeGame: () => {
    IS_PAUSED = false;
    IS_STARTED = false;
    GAME_FUNCTIONS.startGame();
  },
  restartGame: () => {
    clearInterval(GAME_ID);
    SCORE = 0;
    IS_PAUSED = false;
    IS_STARTED = false;
    PLAYING_OBJECT = { object: null, id: null, color: null };
    createGrids(ROWS, COLUMNS);
    GAME_FUNCTIONS.startGame();
  },
};

function main() {
  createGrids(ROWS, COLUMNS);
  document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("keydown", function (event) {
      switch (event.code) {
        case "KeyS":
          GAME_FUNCTIONS.startGame();
          break;
        case "KeyR":
          GAME_FUNCTIONS.restartGame();
          break;
        case "Space":
          if (!IS_STARTED) return;
          if (IS_PAUSED) {
            GAME_FUNCTIONS.resumeGame();
          } else {
            GAME_FUNCTIONS.pauseGame();
          }
          break;
      }
    });
  });
}

main();
