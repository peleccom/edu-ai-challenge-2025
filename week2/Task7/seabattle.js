const readline = require('readline');

// Import modules
const GameState = require('./src/game/GameState');
const GameLogic = require('./src/game/GameLogic');
const CpuPlayer = require('./src/ai/CpuPlayer');
const GameDisplay = require('./src/ui/GameDisplay');
const { isValidAndNewGuess } = require('./src/utils/helpers');

// Re-export classes for backward compatibility with tests
const Ship = require('./src/models/Ship');
const Board = require('./src/models/Board');

// Initialize game components
const gameState = new GameState();
const gameLogic = new GameLogic(gameState);
const cpuPlayer = new CpuPlayer(gameState);
const gameDisplay = new GameDisplay(gameState);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Main game functions
function createBoard() {
  gameLogic.createBoard();
}

function placeShipsRandomly(targetBoard, shipsArray, numberOfShips) {
  gameLogic.placeShipsRandomly(targetBoard, shipsArray, numberOfShips);
}

function processPlayerGuess(guess) {
  return gameLogic.processPlayerGuess(guess);
}

function cpuTurn() {
  cpuPlayer.takeTurn();
}

const printBoard = () => {
  gameDisplay.printBoard();
};

function gameLoop() {
  if (gameState.cpuNumShips === 0) {
    gameDisplay.showPlayerWin();
    rl.close();
    return;
  }
  if (gameState.playerNumShips === 0) {
    gameDisplay.showCpuWin();
    rl.close();
    return;
  }

  gameDisplay.printBoard();
  rl.question('Enter your guess (e.g., 00): ', function (answer) {
    const playerGuessed = processPlayerGuess(answer);

    if (playerGuessed) {
      if (gameState.cpuNumShips === 0) {
        gameLoop();
        return;
      }

      cpuTurn();

      if (gameState.playerNumShips === 0) {
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

  placeShipsRandomly(gameState.playerBoard, gameState.playerShips, gameState.playerNumShips);
  placeShipsRandomly(gameState.opponentBoard, gameState.cpuShips, gameState.cpuNumShips);

  gameDisplay.showGameStart();
  gameLoop();
}

// Export functions and variables for testing
module.exports = {
  // Classes (for backward compatibility)
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
    return gameState.getState();
  },
  
  // Reset function for testing
  resetGame: function() {
    gameState.reset();
  }
};
