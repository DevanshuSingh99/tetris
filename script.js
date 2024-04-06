const page = document.getElementById("page");

let playingObject = null;
let PAUSED = false;

let OCCUPIED_CELL = new Set();

let time = 0;
const ROWS = 15;
const COLUMNS = 15;
const stagingRows = 4;
const TIMER_INTERVAL = {
  easy: 1000,
  medium: 500,
  hard: 300,
  crazy: 50,
};
const STAGING_GRID_AREA = {
  rows: 4,
  columns: COLUMNS,
};

const OBJECT_COLORS = ["red", "green", "blue", "brown"];
const OBJECT = [
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 2],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ],
];
const START_COLUMN = Math.floor(COLUMNS / 2);

const TOTAL_AREA = {
  rows: ROWS + STAGING_GRID_AREA.rows,
  columns: COLUMNS,
};
function createGrids() {
  const grid = document.createElement("div");
  grid.classList.add(`grid`);

  for (let i = 0; i < ROWS + STAGING_GRID_AREA.rows; i++) {
    const row = document.createElement("div");
    row.classList.add("row");

    for (let j = 0; j < COLUMNS; j++) {
      const cell = document.createElement("div");
      if (i < STAGING_GRID_AREA.rows) {
        cell.style.border = "1px solid red";
      }
      cell.classList.add("cell");
      const cellId = "cell-" + i + "-" + j;
      cell.setAttribute("id", cellId);
      row.appendChild(cell);
    }

    grid.appendChild(row);
  }
  page.appendChild(grid);
}

function renderNewObjects() {
  const randomObjectId = Math.floor(Math.random() * 1010101010);
  const randomColor =
    OBJECT_COLORS[Math.floor(Math.random() * OBJECT_COLORS.length)];
  const object = JSON.parse(
    JSON.stringify(OBJECT[Math.floor(Math.random() * OBJECT.length)])
  );
  PLAYING_OBJECT_Id = randomObjectId;
  object.forEach((cell) => {
    cell[1] = cell[1] + START_COLUMN;
    const cellId = "cell-" + cell[0] + "-" + cell[1];
    const cellElement = document.getElementById(cellId);
    // console.log(START_COLUMN, "START_COLUMN", cellId, object);
    cellElement.setAttribute("data-object-id", randomObjectId);
    cellElement.classList.add("object");
    cellElement.style.backgroundColor = randomColor;
  });
  return { object, randomColor };
}

let PLAYING_OBJECT = null;
let PLAYING_OBJECT_COLOR = null;
let PLAYING_OBJECT_Id = null;

const MOVEMENT = {
  dropPlayingObject: () => {
    let canMove = true;
    const newPlayingObject = PLAYING_OBJECT.map((cell) => [...cell]);
    // Check if the object can move down
    newPlayingObject.forEach((cell) => {
      const newRow = newPlayingObject[newPlayingObject.length - 1][0] + 1;
      if (
        newRow >= TOTAL_AREA.rows ||
        document
          .getElementById("cell-" + newRow + "-" + cell[1])
          .classList.contains("object")
      ) {
        canMove = false;
      }
    });

    // If the object can move down, update its position
    if (canMove) {
      // Clear the current position of the newPlayingObject
      for (const cell of newPlayingObject) {
        const cellId = "cell-" + cell[0] + "-" + cell[1];
        const cellElement = document.getElementById(cellId);
        cellElement.removeAttribute("data-object-id");
        cellElement.classList.remove("object");
        cellElement.classList.remove(PLAYING_OBJECT_COLOR);
      }

      // Update the position of the newPlayingObject by incrementing the row index
      for (const cell of newPlayingObject) {
        ++cell[0];
        const newCellId = "cell-" + cell[0] + "-" + cell[1];
        const cellElement = document.getElementById(newCellId);
        cellElement.setAttribute("data-object-id", PLAYING_OBJECT_Id);
        cellElement.classList.add("object");
        cellElement.classList.add(PLAYING_OBJECT_COLOR);
      }
      return { object: newPlayingObject };
    } else {
      return { recreate: true };
    }
  },
  updatePlayingObject: (newPlayingObject) => {
    const newPlayingObjectIds = new Set();
    const cellUpdates = {};

    // Prepare updates for cell elements
    for (const cell of newPlayingObject) {
      const cellId = "cell-" + cell[0] + "-" + cell[1];
      newPlayingObjectIds.add(cellId);

      cellUpdates[cellId] = {
        addClasses: ["object", PLAYING_OBJECT_COLOR],
      };
    }

    // Remove object and color classes from cells not in the new object
    for (const cell of PLAYING_OBJECT) {
      const cellId = "cell-" + cell[0] + "-" + cell[1];
      if (!newPlayingObjectIds.has(cellId)) {
        cellUpdates[cellId] = {
          removeClasses: ["object", PLAYING_OBJECT_COLOR],
        };
      }
    }

    // Apply batch updates to the DOM
    for (const cellId in cellUpdates) {
      const cellElement = document.getElementById(cellId);
      const { addClasses, removeClasses } = cellUpdates[cellId];

      if (addClasses) {
        for (const cls of addClasses) {
          cellElement.classList.add(cls);
        }
      }

      if (removeClasses) {
        for (const cls of removeClasses) {
          cellElement.classList.remove(cls);
        }
      }
    }

    // Update the PLAYING_OBJECT reference
    PLAYING_OBJECT = newPlayingObject;
  },
  isValidPosition: (newPlayingObject) => {
    return newPlayingObject.every((cell) => {
      const cellElement = document.getElementById(
        "cell-" + cell[0] + "-" + cell[1]
      );
      const isObjectCell = cellElement.classList.contains("object");
      const objectId = cellElement.getAttribute("data-object-id");

      // console.log(isObjectCell);
      // console.log(objectId);
      // console.log(PLAYING_OBJECT_Id);

      if (isObjectCell) {
        if (objectId == PLAYING_OBJECT_Id) return true;
        else {
          return false;
        }
      }

      return (
        cell[0] >= 0 &&
        cell[0] < TOTAL_AREA.rows &&
        cell[1] >= 0 &&
        cell[1] < TOTAL_AREA.columns
      );
    });
  },
  moveLeft: () => {
    const newPlayingObject = PLAYING_OBJECT.map((cell) => [
      cell[0],
      cell[1] - 1,
    ]);
    if (MOVEMENT.isValidPosition(newPlayingObject)) {
      MOVEMENT.updatePlayingObject(newPlayingObject);
    }
  },

  moveRight: () => {
    const newPlayingObject = PLAYING_OBJECT.map((cell) => [
      cell[0],
      cell[1] + 1,
    ]);
    if (MOVEMENT.isValidPosition(newPlayingObject)) {
      MOVEMENT.updatePlayingObject(newPlayingObject);
    }
  },
};

function main() {
  //   createGrids(stagingRows, columns, true);
  createGrids();
  document.addEventListener("DOMContentLoaded", function () {
    setInterval(function () {
      if (!PAUSED) {
        if (PLAYING_OBJECT === null) {
          let { object, randomColor } = renderNewObjects();
          PLAYING_OBJECT = object;
          PLAYING_OBJECT_COLOR = randomColor;
        } else {
          let { object, recreate } = MOVEMENT.dropPlayingObject();
          if (recreate) {
            let { object, randomColor } = renderNewObjects();
            PLAYING_OBJECT = object;
            PLAYING_OBJECT_COLOR = randomColor;
          } else {
            PLAYING_OBJECT = object;
          }
        }

        time++;
        $("#timer").text(`Timer : ${time}`);
      }
    }, TIMER_INTERVAL.hard);

    document.addEventListener("keydown", function (event) {
      if (PLAYING_OBJECT !== null) {
        switch (event.key) {
          case "ArrowLeft":
            MOVEMENT.moveLeft();
            break;
          case "p":
            PAUSED = !PAUSED;
            break;
          case "ArrowRight":
            MOVEMENT.moveRight();
            break;
          //   case "ArrowDown":
          // moveDown();
          // break;
          // Add additional cases for other arrow keys if needed
        }
      }
    });
  });
}

main();
