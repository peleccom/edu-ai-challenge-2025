const { BOARD_SIZE } = require('../config/constants');

// Board class to manage board state and operations
class Board {
  constructor(size = BOARD_SIZE) {
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

module.exports = Board; 