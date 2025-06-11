const Ship = require('../models/Ship');
const { BOARD_SIZE, SHIP_LENGTH } = require('../config/constants');

class GameLogic {
  constructor(gameState) {
    this.gameState = gameState;
  }
  
  createBoard() {
    this.gameState.opponentBoard = new (require('../models/Board'))();
    this.gameState.playerBoard = new (require('../models/Board'))();
    console.log('Boards created.');
  }
  
  placeShipsRandomly(targetBoard, shipsArray, numberOfShips) {
    let placedShips = 0;
    while (placedShips < numberOfShips) {
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      let startRow, startCol;
      let collision = false;

      if (orientation === 'horizontal') {
        startRow = Math.floor(Math.random() * BOARD_SIZE);
        startCol = Math.floor(Math.random() * (BOARD_SIZE - SHIP_LENGTH + 1));
      } else {
        startRow = Math.floor(Math.random() * (BOARD_SIZE - SHIP_LENGTH + 1));
        startCol = Math.floor(Math.random() * BOARD_SIZE);
      }

      const tempLocations = [];
      for (let i = 0; i < SHIP_LENGTH; i++) {
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
        for (let i = 0; i < SHIP_LENGTH; i++) {
          let placeRow = startRow;
          let placeCol = startCol;
          if (orientation === 'horizontal') {
            placeCol += i;
          } else {
            placeRow += i;
          }
          const locationStr = `${placeRow}${placeCol}`;
          shipLocations.push(locationStr);

          // Always mark ship positions for collision detection
          targetBoard.markShip(placeRow, placeCol);
        }
        const newShip = new Ship(shipLocations);
        shipsArray.push(newShip);
        placedShips++;
      }
    }
    
    // If this is the opponent board, unmark ships to keep them hidden
    if (targetBoard !== this.gameState.playerBoard) {
      shipsArray.forEach(ship => {
        ship.locations.forEach(location => {
          const row = parseInt(location[0]);
          const col = parseInt(location[1]);
          targetBoard.grid[row][col] = '~';
        });
      });
    }
    
    console.log(
      `${numberOfShips} ships placed randomly for ${targetBoard === this.gameState.playerBoard ? 'Player' : 'CPU'}.`
    );
  }
  
  processPlayerGuess(guess) {
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
      row >= BOARD_SIZE ||
      col < 0 ||
      col >= BOARD_SIZE
    ) {
      console.log(
        `Oops, please enter valid row and column numbers between 0 and ${BOARD_SIZE - 1}.`
      );
      return false;
    }

    const formattedGuess = guess;

    if (this.gameState.guesses.includes(formattedGuess)) {
      console.log('You already guessed that location!');
      return false;
    }
    this.gameState.guesses.push(formattedGuess);

    let hit = false;

    for (let i = 0; i < this.gameState.cpuShips.length; i++) {
      const ship = this.gameState.cpuShips[i];

      if (ship.isAlreadyHit(formattedGuess)) {
        console.log('You already hit that spot!');
        hit = true;
        break;
      } else if (ship.isHit(formattedGuess)) {
        ship.hit(formattedGuess);
        this.gameState.opponentBoard.markHit(row, col);
        console.log('PLAYER HIT!');
        hit = true;

        if (ship.isSunk()) {
          console.log('You sunk an enemy battleship!');
          this.gameState.cpuNumShips--;
        }
        break;
      }
    }

    if (!hit) {
      this.gameState.opponentBoard.markMiss(row, col);
      console.log('PLAYER MISS.');
    }

    return true;
  }
}

module.exports = GameLogic; 