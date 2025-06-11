const { BOARD_SIZE } = require('../config/constants');

// Helper function to validate guess coordinates
const isValidAndNewGuess = (row, col, guessList) => {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    return false;
  }
  const guessStr = `${row}${col}`;
  return !guessList.includes(guessStr);
};

module.exports = {
  isValidAndNewGuess
}; 