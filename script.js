const page = document.getElementById("page");

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
  const object = JSON.parse(
    JSON.stringify(OBJECT[Math.floor(Math.random() * OBJECT.length)])
  );
  object.forEach((cell) => {
    cell[1] = cell[1] + START_COLUMN;
    const cellId = "cell-" + cell[0] + "-" + cell[1];
    const cellElement = document.getElementById(cellId);
    // console.log(START_COLUMN, "START_COLUMN", cellId, object);
    cellElement.classList.add("object");
  });
  return object;
}

function dropPlayingObject(playingObject) {
  let canMove = true;
  const newPlayingObject = playingObject.map((cell) => [...cell]);
  // Check if the object can move down
  newPlayingObject.forEach((cell) => {
    const newRow = newPlayingObject[newPlayingObject.length - 1][0] + 1;
    if (
      newRow >= TOTAL_AREA.rows ||
      $("#cell-" + newRow + "-" + cell[1]).hasClass("object")
    ) {
      canMove = false;
    }
  });

  // If the object can move down, update its position
  if (canMove) {
    // Clear the current position of the newPlayingObject
    newPlayingObject.forEach((cell) => {
      const cellId = "cell-" + cell[0] + "-" + cell[1];
      document.getElementById(cellId).classList.remove("object");
    });

    // Update the position of the newPlayingObject by incrementing the row index
    newPlayingObject.forEach((cell) => {
      ++cell[0];
      const newCellId = "cell-" + cell[0] + "-" + cell[1];
      document.getElementById(newCellId).classList.add("object");
    });
    return { object: newPlayingObject };
  } else {
    return { recreate: true };
  }
}

function main() {
  //   createGrids(stagingRows, columns, true);
  createGrids();

  $(page).ready(function () {
    let playingObject = null;

    setInterval(function () {
      if (playingObject === null) {
        playingObject = renderNewObjects();
      } else {
        let { object, recreate } = dropPlayingObject([...playingObject]);
        if (recreate) {
          playingObject = renderNewObjects();
        } else {
          playingObject = object;
        }
      }

      time++;
      $("#timer").text(`Timer : ${time}`);
    }, TIMER_INTERVAL.medium);

    function moveLeft() {
      const newPlayingObject = playingObject.map((cell) => [
        cell[0],
        cell[1] - 1,
      ]);
      updatePlayingObject(newPlayingObject);
    }

    function moveRight() {
      const newPlayingObject = playingObject.map((cell) => [
        cell[0],
        cell[1] + 1,
      ]);
      updatePlayingObject(newPlayingObject);
    }

    function updatePlayingObject(newPlayingObject) {
      // Clear the current position of the playingObject
      playingObject.forEach((cell) => {
        const cellId = "cell-" + cell[0] + "-" + cell[1];
        document.getElementById(cellId).classList.remove("object");
      });

      // Update the position of the playingObject
      newPlayingObject.forEach((cell) => {
        const cellId = "cell-" + cell[0] + "-" + cell[1];
        document.getElementById(cellId).classList.add("object");
      });

      playingObject = newPlayingObject;
    }

    document.addEventListener("keydown", function (event) {
      if (playingObject !== null) {
        switch (event.key) {
          case "ArrowLeft":
            moveLeft();
            break;
          case "ArrowRight":
            moveRight();
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
