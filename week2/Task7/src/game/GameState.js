const Board = require('../models/Board');
const { NUM_SHIPS } = require('../config/constants');

// Game state management
class GameState {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.playerShips = [];
    this.cpuShips = [];
    this.playerNumShips = NUM_SHIPS;
    this.cpuNumShips = NUM_SHIPS;
    
    this.guesses = [];
    this.cpuGuesses = [];
    this.cpuMode = 'hunt';
    this.cpuTargetQueue = [];
    
    this.opponentBoard = new Board();
    this.playerBoard = new Board();
  }
  
  getState() {
    return {
      board: this.opponentBoard.grid,
      playerBoard: this.playerBoard.grid,
      playerShips: this.playerShips,
      cpuShips: this.cpuShips,
      guesses: this.guesses,
      cpuGuesses: this.cpuGuesses,
      boardSize: this.opponentBoard.size,
      shipLength: 3, // From constants
      numShips: NUM_SHIPS,
      playerNumShips: this.playerNumShips,
      cpuNumShips: this.cpuNumShips,
      cpuMode: this.cpuMode,
      cpuTargetQueue: this.cpuTargetQueue
    };
  }
}

module.exports = GameState; 