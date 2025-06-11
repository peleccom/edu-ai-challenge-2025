const readline = require('readline');

const boardSize = 10;
const numShips = 3;
const shipLength = 3;

// Ship class to encapsulate ship behavior
class Ship {
  constructor(locations) {
    this.locations = locations;
    this.hits = new Array(locations.length).fill('');
  }
  
  isHit(location) {
    return this.locations.includes(location);
  }
  
  hit(location) {
    const index = this.locations.indexOf(location);
    if (index >= 0) {
      this.hits[index] = 'hit';
      return true;
    }
    return false;
  }
  
  isSunk() {
    return this.hits.every(hit => hit === 'hit');
  }
  
  isAlreadyHit(location) {
    const index = this.locations.indexOf(location);
    return index >= 0 && this.hits[index] === 'hit';
  }
}

// Board class to manage board state and operations
class Board {
  constructor(size = boardSize) {
    this.size = size;
    this.grid = this.createGrid();
  }
  
  createGrid() {
    const grid = [];
    for (let i = 0; i < this.size; i++) {
      grid[i] = [];
      for (let j = 0; j < this.size; j++) {
        grid[i][j] = '~';
      }
    }
    return grid;
  }
  
  markHit(row, col) {
    this.grid[row][col] = 'X';
  }
  
  markMiss(row, col) {
    this.grid[row][col] = 'O';
  }
  
  markShip(row, col) {
    this.grid[row][col] = 'S';
  }
  
  isValidPosition(row, col) {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }
  
  isCellEmpty(row, col) {
    return this.grid[row][col] === '~';
  }
}

let playerShips = [];
let cpuShips = [];
let playerNumShips = numShips;
let cpuNumShips = numShips;

let guesses = [];
let cpuGuesses = [];
let cpuMode = 'hunt';
let cpuTargetQueue = [];

let opponentBoard = new Board();
let playerBoard = new Board();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function createBoard() {
  opponentBoard = new Board();
  playerBoard = new Board();
  console.log('Boards created.');
}

function placeShipsRandomly(targetBoard, shipsArray, numberOfShips) {
  let placedShips = 0;
  while (placedShips < numberOfShips) {
    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    let startRow, startCol;
    let shipLocations = [];
    let collision = false;

    if (orientation === 'horizontal') {
      startRow = Math.floor(Math.random() * boardSize);
      startCol = Math.floor(Math.random() * (boardSize - shipLength + 1));
    } else {
      startRow = Math.floor(Math.random() * (boardSize - shipLength + 1));
      startCol = Math.floor(Math.random() * boardSize);
    }

    const tempLocations = [];
    for (let i = 0; i < shipLength; i++) {
      let checkRow = startRow;
      let checkCol = startCol;
      if (orientation === 'horizontal') {
        checkCol += i;
      } else {
        checkRow += i;
      }
      const locationStr = `${checkRow}${checkCol}`;
      tempLocations.push(locationStr);

      if (!targetBoard.isValidPosition(checkRow, checkCol)) {
        collision = true;
        break;
      }

      if (!targetBoard.isCellEmpty(checkRow, checkCol)) {
        collision = true;
        break;
      }
    }

    if (!collision) {
      const shipLocations = [];
      for (let i = 0; i < shipLength; i++) {
        let placeRow = startRow;
        let placeCol = startCol;
        if (orientation === 'horizontal') {
          placeCol += i;
        } else {
          placeRow += i;
        }
        const locationStr = `${placeRow}${placeCol}`;
        shipLocations.push(locationStr);

        if (targetBoard === playerBoard) {
          targetBoard.markShip(placeRow, placeCol);
        }
      }
      const newShip = new Ship(shipLocations);
      shipsArray.push(newShip);
      placedShips++;
    }
  }
  console.log(
    `${numberOfShips} ships placed randomly for ${targetBoard === playerBoard ? 'Player' : 'CPU'}.`
  );
}

const printBoard = () => {
  console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
  let header = '  ';
  for (let h = 0; h < boardSize; h++) header += h + ' ';
  console.log(`${header}     ${header}`);

  for (let i = 0; i < boardSize; i++) {
    let rowStr = `${i} `;

    for (let j = 0; j < boardSize; j++) {
      rowStr += `${opponentBoard.grid[i][j]} `;
    }
    rowStr += `    ${i} `;

    for (let j = 0; j < boardSize; j++) {
      rowStr += `${playerBoard.grid[i][j]} `;
    }
    console.log(rowStr);
  }
  console.log('\n');
};

function processPlayerGuess(guess) {
  if (guess === null || guess.length !== 2) {
    console.log('Oops, input must be exactly two digits (e.g., 00, 34, 98).');
    return false;
  }

  const row = parseInt(guess[0]);
  const col = parseInt(guess[1]);

  if (
    isNaN(row) ||
    isNaN(col) ||
    row < 0 ||
    row >= boardSize ||
    col < 0 ||
    col >= boardSize
  ) {
    console.log(
      `Oops, please enter valid row and column numbers between 0 and ${boardSize - 1}.`
    );
    return false;
  }

  const formattedGuess = guess;

  if (guesses.includes(formattedGuess)) {
    console.log('You already guessed that location!');
    return false;
  }
  guesses.push(formattedGuess);

  let hit = false;

  for (let i = 0; i < cpuShips.length; i++) {
    const ship = cpuShips[i];

    if (ship.isAlreadyHit(formattedGuess)) {
      console.log('You already hit that spot!');
      hit = true;
      break;
    } else if (ship.isHit(formattedGuess)) {
      ship.hit(formattedGuess);
      opponentBoard.markHit(row, col);
      console.log('PLAYER HIT!');
      hit = true;

      if (ship.isSunk()) {
        console.log('You sunk an enemy battleship!');
        cpuNumShips--;
      }
      break;
    }
  }

  if (!hit) {
    opponentBoard.markMiss(row, col);
    console.log('PLAYER MISS.');
  }

  return true;
}

const isValidAndNewGuess = (row, col, guessList) => {
  if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
    return false;
  }
  const guessStr = `${row}${col}`;
  return !guessList.includes(guessStr);
};

function cpuTurn() {
  console.log("\n--- CPU's Turn ---");
  let guessRow, guessCol, guessStr;
  let madeValidGuess = false;

  while (!madeValidGuess) {
    if (cpuMode === 'target' && cpuTargetQueue.length > 0) {
      guessStr = cpuTargetQueue.shift();
      guessRow = parseInt(guessStr[0]);
      guessCol = parseInt(guessStr[1]);
      console.log(`CPU targets: ${guessStr}`);

              if (cpuGuesses.includes(guessStr)) {
          if (cpuTargetQueue.length === 0) cpuMode = 'hunt';
          continue;
        }
    } else {
      cpuMode = 'hunt';
      guessRow = Math.floor(Math.random() * boardSize);
      guessCol = Math.floor(Math.random() * boardSize);
      guessStr = `${guessRow}${guessCol}`;

      if (!isValidAndNewGuess(guessRow, guessCol, cpuGuesses)) {
        continue;
      }
    }

    madeValidGuess = true;
    cpuGuesses.push(guessStr);

    let hit = false;
    for (let i = 0; i < playerShips.length; i++) {
      const ship = playerShips[i];

      if (ship.isHit(guessStr)) {
        ship.hit(guessStr);
        playerBoard.markHit(guessRow, guessCol);
        console.log(`CPU HIT at ${guessStr}!`);
        hit = true;

        if (ship.isSunk()) {
          console.log('CPU sunk your battleship!');
          playerNumShips--;

          cpuMode = 'hunt';
          cpuTargetQueue = [];
        } else {
          cpuMode = 'target';
          const adjacent = [
            { r: guessRow - 1, c: guessCol },
            { r: guessRow + 1, c: guessCol },
            { r: guessRow, c: guessCol - 1 },
            { r: guessRow, c: guessCol + 1 },
          ];
          for (const adj of adjacent) {
                          if (isValidAndNewGuess(adj.r, adj.c, cpuGuesses)) {
                const adjStr = `${adj.r}${adj.c}`;

                if (!cpuTargetQueue.includes(adjStr)) {
                  cpuTargetQueue.push(adjStr);
                }
            }
          }
        }
        break;
      }
    }

    if (!hit) {
      playerBoard.markMiss(guessRow, guessCol);
      console.log(`CPU MISS at ${guessStr}.`);

      if (cpuMode === 'target' && cpuTargetQueue.length === 0) {
        cpuMode = 'hunt';
      }
    }
  }
}



function gameLoop() {
  if (cpuNumShips === 0) {
    console.log('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
    printBoard();
    rl.close();
    return;
  }
  if (playerNumShips === 0) {
    console.log('\n*** GAME OVER! The CPU sunk all your battleships! ***');
    printBoard();
    rl.close();
    return;
  }

  printBoard();
  rl.question('Enter your guess (e.g., 00): ', function (answer) {
    const playerGuessed = processPlayerGuess(answer);

    if (playerGuessed) {
      if (cpuNumShips === 0) {
        gameLoop();
        return;
      }

      cpuTurn();

      if (playerNumShips === 0) {
        gameLoop();
        return;
      }
    }

    gameLoop();
  });
}

// Only run the game if this file is executed directly (not imported as a module)
if (require.main === module) {
  createBoard();

  placeShipsRandomly(playerBoard, playerShips, playerNumShips);
  placeShipsRandomly(opponentBoard, cpuShips, cpuNumShips);

  console.log("\nLet's play Sea Battle!");
  console.log(`Try to sink the ${cpuNumShips} enemy ships.`);
  gameLoop();
}

// Export functions and variables for testing
module.exports = {
  // Classes
  Ship,
  Board,
  
  // Functions
  createBoard,
  placeShipsRandomly,
  processPlayerGuess,
  isValidAndNewGuess,
  cpuTurn,
  gameLoop,
  printBoard,
  
  // Getters for game state variables
  getGameState: function() {
    return {
      board: opponentBoard.grid,
      playerBoard: playerBoard.grid,
      playerShips,
      cpuShips,
      guesses,
      cpuGuesses,
      boardSize,
      shipLength,
      numShips,
      playerNumShips,
      cpuNumShips,
      cpuMode,
      cpuTargetQueue
    };
  },
  
  // Reset function for testing
  resetGame: function() {
    playerShips.length = 0;
    cpuShips.length = 0;
    playerNumShips = numShips;
    cpuNumShips = numShips;
    guesses.length = 0;
    cpuGuesses.length = 0;
    cpuMode = 'hunt';
    cpuTargetQueue.length = 0;
    opponentBoard = new Board();
    playerBoard = new Board();
  }
};
