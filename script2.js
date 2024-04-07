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

let PLAYING_OBJECT = {
  object: null,
  id: null,
  color: null,
};
function createNewCell(cellId) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cellId && cell.setAttribute("id", cellId);
  return cell;
}
function createGrids(y, x) {
  page.innerHTML = "";
  const grid = document.createElement("div");
  grid.classList.add(`grid`);

  for (let i = 0; i < y; i++) {
    const row = document.createElement("div");
    row.classList.add("row");

    for (let j = 0; j < x; j++) {
      const cellId = "cell-" + i + "-" + j;
      const cell = createNewCell(cellId);
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
      cellElement.setAttribute("data-object-id", id);
      cellElement.style.backgroundColor = color;
    }
    return { object, color, id };
  },
};

const OBJECT_MOVEMENT_FUNCTIONS = {
  dropPlayingObject: () => {
    let canMove = true;

    const recreate = OBJECT_MOVEMENT_FUNCTIONS.moveDown();
    return recreate;
    console.log(recreate, "recreate");
  },
  isValidPosition: (newPlayingObject) => {
    return newPlayingObject.every((cell) => {
      const newCellId = cell[0] + "-" + cell[1];

      const isNewCellOccupied = OCCUPIED_CELL.has(newCellId);

      if (isNewCellOccupied) {
        const newCellObjectId =
          getElementByCellId(newCellId).getAttribute("data-object-id");
        if (newCellObjectId == PLAYING_OBJECT.id) return true;
        else {
          return false;
        }
      }

      return (
        cell[0] >= 0 && cell[0] < ROWS && cell[1] >= 0 && cell[1] < COLUMNS
      );
      //   return true;
    });
  },
  updatePlayingObject: (newPlayingObject) => {
    // Prepare updates for cell elements
    for (const cell of PLAYING_OBJECT.object.cells) {
      const cellId = cell[0] + "-" + cell[1];
      let cellElement = getElementByCellId(cellId);
      cellElement.replaceWith(createNewCell("cell-" + cellId));
      OCCUPIED_CELL.delete(cellId);
    }
    for (const cell of newPlayingObject) {
      const cellId = cell[0] + "-" + cell[1];
      let cellElement = getElementByCellId(cellId);
      cellElement.setAttribute("data-object-id", PLAYING_OBJECT.id);
      cellElement.style.backgroundColor = PLAYING_OBJECT.color;
      OCCUPIED_CELL.add(cellId);
    }

    PLAYING_OBJECT["object"]["cells"] = newPlayingObject;
  },
  moveDown: () => {
    const newPlayingObject = JSON.parse(
      JSON.stringify(
        PLAYING_OBJECT.object.cells.map((cell) => [cell[0] + 1, cell[1]])
      )
    );
    if (OBJECT_MOVEMENT_FUNCTIONS.isValidPosition(newPlayingObject)) {
      OBJECT_MOVEMENT_FUNCTIONS.updatePlayingObject(newPlayingObject);
      return false;
    } else {
      return true;
    }
  },
  moveLeft: () => {
    const newPlayingObject = PLAYING_OBJECT.object.cells.map((cell) => [
      cell[0],
      cell[1] - 1,
    ]);
    if (OBJECT_MOVEMENT_FUNCTIONS.isValidPosition(newPlayingObject)) {
      OBJECT_MOVEMENT_FUNCTIONS.updatePlayingObject(newPlayingObject);
    }
  },

  moveRight: () => {
    const newPlayingObject = PLAYING_OBJECT.object.cells.map((cell) => [
      cell[0],
      cell[1] + 1,
    ]);
    if (OBJECT_MOVEMENT_FUNCTIONS.isValidPosition(newPlayingObject)) {
      OBJECT_MOVEMENT_FUNCTIONS.updatePlayingObject(newPlayingObject);
    }
  },
};

function game_logic() {
  if (PLAYING_OBJECT.object === null) {
    PLAYING_OBJECT = OBJECT_FUNCTIONS.renderNewObjects();
  } else {
    const recreate = OBJECT_MOVEMENT_FUNCTIONS.dropPlayingObject();
    if (recreate) {
      PLAYING_OBJECT = OBJECT_FUNCTIONS.renderNewObjects();
      // } else {
      //   PLAYING_OBJECT = object;
    }
  }
}

const GAME_FUNCTIONS = {
  startGame: () => {
    if (!IS_STARTED) {
      IS_STARTED = true;
      GAME_ID = setInterval(function () {
        // if (!IS_PAUSED) {
        game_logic();
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
    PLAYING_OBJECT = {
      object: null,
      id: null,
      color: null,
    };
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
        case "ArrowLeft":
          OBJECT_MOVEMENT_FUNCTIONS.moveLeft();
          break;
        case "ArrowRight":
          OBJECT_MOVEMENT_FUNCTIONS.moveRight();
          break;
      }
    });
  });
}

main();
