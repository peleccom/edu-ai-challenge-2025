const { BOARD_SIZE } = require('../config/constants');

class GameDisplay {
  constructor(gameState) {
    this.gameState = gameState;
  }
  
  printBoard() {
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    let header = '  ';
    for (let h = 0; h < BOARD_SIZE; h++) header += h + ' ';
    console.log(`${header}     ${header}`);

    for (let i = 0; i < BOARD_SIZE; i++) {
      let rowStr = `${i} `;

      for (let j = 0; j < BOARD_SIZE; j++) {
        rowStr += `${this.gameState.opponentBoard.grid[i][j]} `;
      }
      rowStr += `    ${i} `;

      for (let j = 0; j < BOARD_SIZE; j++) {
        rowStr += `${this.gameState.playerBoard.grid[i][j]} `;
      }
      console.log(rowStr);
    }
    console.log('\n');
  }
  
  showGameStart() {
    console.log("\nLet's play Sea Battle!");
    console.log(`Try to sink the ${this.gameState.cpuNumShips} enemy ships.`);
  }
  
  showPlayerWin() {
    console.log('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
    this.printBoard();
  }
  
  showCpuWin() {
    console.log('\n*** GAME OVER! The CPU sunk all your battleships! ***');
    this.printBoard();
  }
}

module.exports = GameDisplay; 