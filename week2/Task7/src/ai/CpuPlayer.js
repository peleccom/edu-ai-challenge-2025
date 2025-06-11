const { isValidAndNewGuess } = require('../utils/helpers');
const { BOARD_SIZE } = require('../config/constants');

class CpuPlayer {
  constructor(gameState) {
    this.gameState = gameState;
  }
  
  takeTurn() {
    console.log("\n--- CPU's Turn ---");
    let guessRow, guessCol, guessStr;
    let madeValidGuess = false;

    while (!madeValidGuess) {
      if (this.gameState.cpuMode === 'target' && this.gameState.cpuTargetQueue.length > 0) {
        guessStr = this.gameState.cpuTargetQueue.shift();
        guessRow = parseInt(guessStr[0]);
        guessCol = parseInt(guessStr[1]);
        console.log(`CPU targets: ${guessStr}`);

        if (this.gameState.cpuGuesses.includes(guessStr)) {
          if (this.gameState.cpuTargetQueue.length === 0) this.gameState.cpuMode = 'hunt';
          continue;
        }
      } else {
        this.gameState.cpuMode = 'hunt';
        guessRow = Math.floor(Math.random() * BOARD_SIZE);
        guessCol = Math.floor(Math.random() * BOARD_SIZE);
        guessStr = `${guessRow}${guessCol}`;

        if (!isValidAndNewGuess(guessRow, guessCol, this.gameState.cpuGuesses)) {
          continue;
        }
      }

      madeValidGuess = true;
      this.gameState.cpuGuesses.push(guessStr);

      let hit = false;
      for (let i = 0; i < this.gameState.playerShips.length; i++) {
        const ship = this.gameState.playerShips[i];

        if (ship.isHit(guessStr)) {
          ship.hit(guessStr);
          this.gameState.playerBoard.markHit(guessRow, guessCol);
          console.log(`CPU HIT at ${guessStr}!`);
          hit = true;

          if (ship.isSunk()) {
            console.log('CPU sunk your battleship!');
            this.gameState.playerNumShips--;

            this.gameState.cpuMode = 'hunt';
            this.gameState.cpuTargetQueue = [];
          } else {
            this.gameState.cpuMode = 'target';
            const adjacent = [
              { r: guessRow - 1, c: guessCol },
              { r: guessRow + 1, c: guessCol },
              { r: guessRow, c: guessCol - 1 },
              { r: guessRow, c: guessCol + 1 },
            ];
            for (const adj of adjacent) {
              if (isValidAndNewGuess(adj.r, adj.c, this.gameState.cpuGuesses)) {
                const adjStr = `${adj.r}${adj.c}`;

                if (!this.gameState.cpuTargetQueue.includes(adjStr)) {
                  this.gameState.cpuTargetQueue.push(adjStr);
                }
              }
            }
          }
          break;
        }
      }

      if (!hit) {
        this.gameState.playerBoard.markMiss(guessRow, guessCol);
        console.log(`CPU MISS at ${guessStr}.`);

        if (this.gameState.cpuMode === 'target' && this.gameState.cpuTargetQueue.length === 0) {
          this.gameState.cpuMode = 'hunt';
        }
      }
    }
  }
}

module.exports = CpuPlayer; 