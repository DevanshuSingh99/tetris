const page = document.getElementById("page");

let GAME_ID = null;

let IS_STARTED = false;
let IS_PAUSED = false;

let SCORE = 0;
const ROWS = 20;
const COLUMNS = 12;
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
    rotation: true,
  },
  {
    name: "T",
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 1],
    ],
    rotation: true,
  },
  {
    name: "L",
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ],
    rotation: true,
  },
  {
    name: "Z",
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
    rotation: true,
  },
  {
    name: "O",
    cells: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    rotation: false,
  },
];
const START_COLUMN = Math.floor(COLUMNS / 2);

let GRID_ARRAY = [];

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
  GRID_ARRAY.length = 0;
  page.innerHTML = "";
  const grid = document.createElement("div");
  grid.classList.add(`grid`);
  grid.setAttribute("id", "grid");
  for (let i = 0; i < y; i++) {
    const row_array = [];
    const row = document.createElement("div");
    row.classList.add("row");

    for (let j = 0; j < x; j++) {
      row_array.push(0);
      const cellId = "cell-" + i + "-" + j;
      const cell = createNewCell(cellId);
      row.appendChild(cell);
    }
    GRID_ARRAY.push(row_array);
    grid.appendChild(row);
  }
  page.appendChild(grid);
}

function createGridsV2(GRID) {
  page.innerHTML = "";
  const grid = document.createElement("div");
  grid.classList.add(`grid`);
  grid.setAttribute("id", "grid");
  for (let i = 0; i < GRID.length; i++) {
    const row_array = [];
    const row = document.createElement("div");
    row.classList.add("row");

    for (let j = 0; j < GRID[i].length; j++) {
      const cellId = "cell-" + i + "-" + j;
      const cell = createNewCell(cellId);
      cell.setAttribute("data-object-id", GRID[i][j].id);
      cell.style.backgroundColor = GRID[i][j].color;
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
    for (const cell of object.cells) {
      cell[1] = cell[1] + START_COLUMN;
      const cellId = cell[0] + "-" + cell[1];
      GRID_ARRAY[cell[0]][cell[1]] = { object, color, id };
      const cellElement = getElementByCellId(cellId);
      cellElement.setAttribute("data-object-id", id);
      cellElement.style.backgroundColor = color;
    }
    return { object, color, id };
  },
};

const OBJECT_MOVEMENT_FUNCTIONS = {
  rotate: () => {
    if (PLAYING_OBJECT.object === null) return;
    if (!PLAYING_OBJECT.object.rotation) return;

    const rotation_axis = PLAYING_OBJECT.object.cells[1];
    const newPlayingObject = PLAYING_OBJECT.object.cells.map((cell) => {
      const X = cell[0] - rotation_axis[0];
      const Y = cell[1] - rotation_axis[1];
      const newX = rotation_axis[0] + Y;
      const newY = rotation_axis[1] - X;
      return [newX, newY];
    });

    if (OBJECT_MOVEMENT_FUNCTIONS.isValidPosition(newPlayingObject)) {
      OBJECT_MOVEMENT_FUNCTIONS.updatePlayingObject(newPlayingObject);
    }
  },
  dropPlayingObject: () => {
    const recreate = OBJECT_MOVEMENT_FUNCTIONS.moveDown();
    return recreate;
  },
  isValidPosition: (newPlayingObject, freshBlock = false) => {
    return newPlayingObject.every((cell) => {
      if (
        !(cell[0] >= 0 && cell[0] < ROWS && cell[1] >= 0 && cell[1] < COLUMNS)
      ) {
        return false;
      }

      const newCellId = cell[0] + "-" + cell[1];
      const isNewCellOccupied = GRID_ARRAY[cell[0]][cell[1]] ?? 0;
      if (isNewCellOccupied) {
        const newCellObjectId =
          getElementByCellId(newCellId).getAttribute("data-object-id");
        if (
          freshBlock &&
          cell[0] === 0 &&
          newCellObjectId &&
          Number(newCellObjectId) !== PLAYING_OBJECT.id
        ) {
          return true;
        } else if (Number(newCellObjectId) === PLAYING_OBJECT.id) return true;
        else {
          return false;
        }
      } else {
        return true;
      }
    });
  },
  updatePlayingObject: (newPlayingObject) => {
    for (const cell of PLAYING_OBJECT.object.cells) {
      const cellId = cell[0] + "-" + cell[1];
      let cellElement = getElementByCellId(cellId);
      cellElement.replaceWith(createNewCell("cell-" + cellId));
      GRID_ARRAY[cell[0]][cell[1]] = 0;
    }
    for (const cell of newPlayingObject) {
      const cellId = cell[0] + "-" + cell[1];
      let cellElement = getElementByCellId(cellId);
      GRID_ARRAY[cell[0]][cell[1]] = {
        object: { ...PLAYING_OBJECT.object, cells: [cell[0], cell[1]] },
        color: PLAYING_OBJECT.color,
        id: PLAYING_OBJECT.id,
      };
      cellElement.setAttribute("data-object-id", PLAYING_OBJECT.id);
      cellElement.style.backgroundColor = PLAYING_OBJECT.color;
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

const GAME_FUNCTIONS = {
  shiftRows: (rows) => {
    const newArra = [];
    for (let i = 0; i < GRID_ARRAY.length; i++) {
      if (!rows.includes(i)) {
        newArra.push(GRID_ARRAY[i]);
      } else {
        newArra.unshift(new Array(COLUMNS).fill(0));
      }
    }
    GRID_ARRAY = newArra;
    createGridsV2(GRID_ARRAY);
  },
  clearRow: (rows) => {
    for (const y of rows) {
      for (const x in GRID_ARRAY[y]) {
        const cellId = y + "-" + x;
        let cellElement = getElementByCellId(cellId);
        cellElement.replaceWith(createNewCell("cell-" + cellId));
        GRID_ARRAY[y][x] = 0;
      }
    }
  },
  checkIfRowsAreFilled: () => {
    const to_clear = [];
    for (let rowIndex = ROWS - 1; rowIndex > 0; --rowIndex) {
      let is_full = GRID_ARRAY[rowIndex].every((cell) => {
        if (typeof cell === "object") return true;
        else return false;
      });

      if (is_full) {
        to_clear.push(rowIndex);
      }

      if (rowIndex === 19) {
      }
    }
    if (to_clear.length) {
      GAME_FUNCTIONS.clearRow(to_clear);
      GAME_FUNCTIONS.shiftRows(to_clear);
    }
  },
  startGame: () => {
    if (!IS_STARTED) {
      IS_STARTED = true;
      GAME_ID = setInterval(function () {
        // if (!IS_PAUSED) {
        game_logic();
        SCORE++;
        $("#timer").text(`Timer : ${SCORE}`);
        // }
      }, DIFFICULTIES.easy);
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
  gameOver: () => {
    clearInterval(GAME_ID);
    IS_PAUSED = true;
    IS_STARTED = false;
    alert("Game Over");
  },
};

function game_logic() {
  if (PLAYING_OBJECT.object === null) {
    PLAYING_OBJECT = OBJECT_FUNCTIONS.renderNewObjects();
  } else {
    const recreate = OBJECT_MOVEMENT_FUNCTIONS.dropPlayingObject();
    if (recreate) {
      GAME_FUNCTIONS.checkIfRowsAreFilled();
      PLAYING_OBJECT = OBJECT_FUNCTIONS.renderNewObjects();
    }
  }
}

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
        case "ArrowDown":
          OBJECT_MOVEMENT_FUNCTIONS.moveDown();
          break;
        case "ArrowUp":
          OBJECT_MOVEMENT_FUNCTIONS.rotate();
          break;
        case "KeyC":
          createGridsV2(GRID_ARRAY);
          break;
      }
    });
  });
}

main();
