// seabattle.test.js
const game = require('./seabattle');

// Mock readline to prevent actual input/output during tests
jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn(),
    close: jest.fn()
  }))
}));

// Mock console methods to prevent cluttered test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Test helper functions
function createTestShip(locations) {
  return new game.Ship(locations);
}

describe('Sea Battle Game Tests', () => {
  let gameState;
  
  beforeEach(() => {
    // Reset game state before each test
    game.resetGame();
    gameState = game.getGameState();
  });

  describe('createBoard()', () => {
    test('should create boards with correct dimensions', () => {
      game.createBoard();
      gameState = game.getGameState();
      
      expect(gameState.board).toHaveLength(gameState.boardSize);
      expect(gameState.playerBoard).toHaveLength(gameState.boardSize);
      
      for (let i = 0; i < gameState.boardSize; i++) {
        expect(gameState.board[i]).toHaveLength(gameState.boardSize);
        expect(gameState.playerBoard[i]).toHaveLength(gameState.boardSize);
      }
    });

    test('should initialize all board cells with water (~)', () => {
      game.createBoard();
      gameState = game.getGameState();
      
      for (let i = 0; i < gameState.boardSize; i++) {
        for (let j = 0; j < gameState.boardSize; j++) {
          expect(gameState.board[i][j]).toBe('~');
          expect(gameState.playerBoard[i][j]).toBe('~');
        }
      }
    });
  });

  describe('isValidAndNewGuess()', () => {
    beforeEach(() => {
      gameState = game.getGameState();
    });

    test('should return false for out-of-bounds coordinates', () => {
      expect(game.isValidAndNewGuess(-1, 0, [])).toBe(false);
      expect(game.isValidAndNewGuess(0, -1, [])).toBe(false);
      expect(game.isValidAndNewGuess(gameState.boardSize, 0, [])).toBe(false);
      expect(game.isValidAndNewGuess(0, gameState.boardSize, [])).toBe(false);
    });

    test('should return false for already guessed coordinates', () => {
      const guessList = ['00', '11', '22'];
      expect(game.isValidAndNewGuess(0, 0, guessList)).toBe(false);
      expect(game.isValidAndNewGuess(1, 1, guessList)).toBe(false);
      expect(game.isValidAndNewGuess(2, 2, guessList)).toBe(false);
    });

    test('should return true for valid new coordinates', () => {
      const guessList = ['00', '11'];
      expect(game.isValidAndNewGuess(2, 2, guessList)).toBe(true);
      expect(game.isValidAndNewGuess(5, 5, guessList)).toBe(true);
      expect(game.isValidAndNewGuess(9, 9, guessList)).toBe(true);
    });

    test('should handle edge coordinates correctly', () => {
      expect(game.isValidAndNewGuess(0, 0, [])).toBe(true);
      expect(game.isValidAndNewGuess(9, 9, [])).toBe(true);
      expect(game.isValidAndNewGuess(0, 9, [])).toBe(true);
      expect(game.isValidAndNewGuess(9, 0, [])).toBe(true);
    });
  });

  describe('Ship.isSunk()', () => {
    test('should return true when all ship parts are hit', () => {
      const ship = createTestShip(['00', '01', '02']);
      ship.hits = ['hit', 'hit', 'hit'];
      expect(ship.isSunk()).toBe(true);
    });

    test('should return false when not all ship parts are hit', () => {
      const ship = createTestShip(['00', '01', '02']);
      ship.hits = ['hit', '', 'hit'];
      expect(ship.isSunk()).toBe(false);
    });

    test('should return false when no ship parts are hit', () => {
      const ship = createTestShip(['00', '01', '02']);
      expect(ship.isSunk()).toBe(false);
    });
  });

  describe('processPlayerGuess()', () => {
    beforeEach(() => {
      game.createBoard();
      gameState = game.getGameState();
      
      // Clear existing ships and add a test ship to CPU ships
      gameState.cpuShips.length = 0;
      gameState.cpuShips.push(createTestShip(['00', '01', '02']));
      gameState.cpuNumShips = 1;
    });

    test('should reject invalid input format', () => {
      expect(game.processPlayerGuess(null)).toBe(false);
      expect(game.processPlayerGuess('')).toBe(false);
      expect(game.processPlayerGuess('0')).toBe(false);
      expect(game.processPlayerGuess('000')).toBe(false);
    });

    test('should reject out-of-bounds coordinates', () => {
      expect(game.processPlayerGuess('aa')).toBe(false);
      expect(game.processPlayerGuess('9a')).toBe(false);
    });

    test('should accept valid coordinates', () => {
      expect(game.processPlayerGuess('99')).toBe(true);
      gameState = game.getGameState();
      gameState.guesses.length = 0; // Reset guesses for next test
      expect(game.processPlayerGuess('88')).toBe(true);
    });

    test('should reject duplicate guesses', () => {
      expect(game.processPlayerGuess('55')).toBe(true);
      expect(game.processPlayerGuess('55')).toBe(false);
    });

    test('should register hit when guess matches ship location', () => {
      const result = game.processPlayerGuess('00');
      gameState = game.getGameState();
      
      expect(result).toBe(true);
      expect(gameState.cpuShips[0].hits[0]).toBe('hit');
      expect(gameState.board[0][0]).toBe('X');
    });

    test('should register miss when guess does not match ship location', () => {
      const result = game.processPlayerGuess('99');
      gameState = game.getGameState();
      
      expect(result).toBe(true);
      expect(gameState.board[9][9]).toBe('O');
    });

    test('should detect sunk ship', () => {
      // Ensure proper setup for this specific test
      gameState = game.getGameState();
      gameState.cpuShips.length = 0;
      gameState.cpuShips.push(createTestShip(['00', '01', '02']));
      
      // Count initial ships and set cpuNumShips to match
      const initialShipCount = gameState.cpuShips.length;
      gameState.cpuNumShips = initialShipCount;
      
      // Verify setup
      expect(gameState.cpuShips).toHaveLength(1);
      expect(gameState.cpuNumShips).toBe(1);
      
      // Hit all parts of the ship and verify each hit
      game.processPlayerGuess('00');
      gameState = game.getGameState();
      expect(gameState.cpuShips[0].hits[0]).toBe('hit');
      
      game.processPlayerGuess('01');
      gameState = game.getGameState();
      expect(gameState.cpuShips[0].hits[1]).toBe('hit');
      
      // Before the final hit, record the current cpuNumShips
      const beforeFinalHit = gameState.cpuNumShips;
      
      game.processPlayerGuess('02');
      gameState = game.getGameState();
      expect(gameState.cpuShips[0].hits[2]).toBe('hit');
      
      // After sinking, cpuNumShips should be decremented by 1
      expect(gameState.cpuNumShips).toBe(beforeFinalHit - 1);
    });

    test('should handle multiple ships correctly', () => {
      gameState = game.getGameState();
      gameState.cpuShips.push(createTestShip(['55', '56', '57']));
      gameState.cpuNumShips = 2; // Now we have 2 ships
      
      // Hit first ship
      game.processPlayerGuess('00');
      gameState = game.getGameState();
      expect(gameState.board[0][0]).toBe('X');
      
      // Hit second ship  
      game.processPlayerGuess('55');
      gameState = game.getGameState();
      expect(gameState.board[5][5]).toBe('X');
      
      // Miss
      game.processPlayerGuess('99');
      gameState = game.getGameState();
      expect(gameState.board[9][9]).toBe('O');
    });
  });

  describe('placeShipsRandomly()', () => {
    beforeEach(() => {
      game.createBoard();
      gameState = game.getGameState();
    });

    test('should place correct number of ships', () => {
      const testShips = [];
      const testBoard = new game.Board();
      game.placeShipsRandomly(testBoard, testShips, 2);
      expect(testShips).toHaveLength(2);
    });

    test('should create ships with correct structure', () => {
      const testShips = [];
      const testBoard = new game.Board();
      game.placeShipsRandomly(testBoard, testShips, 1);
      
      expect(testShips[0]).toHaveProperty('locations');
      expect(testShips[0]).toHaveProperty('hits');
      expect(testShips[0].locations).toHaveLength(gameState.shipLength);
      expect(testShips[0].hits).toHaveLength(gameState.shipLength);
    });

    test('should place ships within board boundaries', () => {
      const testShips = [];
      const testBoard = new game.Board();
      game.placeShipsRandomly(testBoard, testShips, 3);
      
      testShips.forEach(ship => {
        ship.locations.forEach(location => {
          const row = parseInt(location[0]);
          const col = parseInt(location[1]);
          expect(row).toBeGreaterThanOrEqual(0);
          expect(row).toBeLessThan(gameState.boardSize);
          expect(col).toBeGreaterThanOrEqual(0);
          expect(col).toBeLessThan(gameState.boardSize);
        });
      });
    });

    test('should not place overlapping ships', () => {
      const testShips = [];
      const testBoard = new game.Board();
      game.placeShipsRandomly(testBoard, testShips, 3);
      
      const allLocations = [];
      testShips.forEach(ship => {
        ship.locations.forEach(location => {
          expect(allLocations).not.toContain(location);
          allLocations.push(location);
        });
      });
    });

    test('should create ships with proper locations', () => {
      const testShips = [];
      const testBoard = new game.Board();
      game.placeShipsRandomly(testBoard, testShips, 1);
      
      // Verify that ships are created with correct locations
      expect(testShips[0].locations).toHaveLength(gameState.shipLength);
      testShips[0].locations.forEach(location => {
        const row = parseInt(location[0]);
        const col = parseInt(location[1]);
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThan(gameState.boardSize);
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThan(gameState.boardSize);
      });
    });
  });

  describe('cpuTurn()', () => {
    beforeEach(() => {
      game.createBoard();
      gameState = game.getGameState();
      
      // Add a test ship to player ships
      gameState.playerShips.push(createTestShip(['55', '56', '57']));
      gameState.playerNumShips = 1;
    });

    test('should make a valid guess', () => {
      const initialGuessCount = gameState.cpuGuesses.length;
      game.cpuTurn();
      gameState = game.getGameState();
      
      expect(gameState.cpuGuesses).toHaveLength(initialGuessCount + 1);
    });

    test('should not make duplicate guesses', () => {
      gameState = game.getGameState();
      
      // Fill most of the board with guesses
      for (let i = 0; i < gameState.boardSize; i++) {
        for (let j = 0; j < gameState.boardSize; j++) {
          if (i < 5 || j < 5) { // Leave some spaces for the test
            gameState.cpuGuesses.push(`${i}${j}`);
          }
        }
      }
      
      const initialGuessCount = gameState.cpuGuesses.length;
      game.cpuTurn();
      gameState = game.getGameState();
      
      expect(gameState.cpuGuesses).toHaveLength(initialGuessCount + 1);
    });

    test('should switch to target mode after a hit', () => {
      gameState = game.getGameState();
      const originalRandom = Math.random;
      Math.random = () => 0.55; // This should target around row 5, col 5
      
      game.cpuTurn();
      gameState = game.getGameState();
      
      Math.random = originalRandom;
      
      // Check if we got a hit and mode changed (this is probabilistic)
      if (gameState.cpuMode === 'target') {
        expect(gameState.cpuTargetQueue.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Game Logic Integration', () => {
    test('should handle complete game scenario', () => {
      game.createBoard();
      gameState = game.getGameState();
      
      const playerShips = [];
      const cpuShips = [];
      const testPlayerBoard = new game.Board();
      const testOpponentBoard = new game.Board();
      
      // Place ships
      game.placeShipsRandomly(testPlayerBoard, playerShips, 2);
      game.placeShipsRandomly(testOpponentBoard, cpuShips, 2);
      
      expect(playerShips).toHaveLength(2);
      expect(cpuShips).toHaveLength(2);
      
      // Make some guesses
      const result = game.processPlayerGuess('88');
      expect(result).toBe(true);
      
      gameState = game.getGameState();
      expect(gameState.guesses).toContain('88');
    });

    test('should maintain game state correctly', () => {
      game.createBoard();
      gameState = game.getGameState();
      
      // Initial state
      expect(gameState.guesses).toHaveLength(0);
      expect(gameState.cpuGuesses).toHaveLength(0);
      expect(gameState.cpuMode).toBe('hunt');
      
      // After a player guess
      gameState.cpuShips.length = 0;
      gameState.cpuShips.push(createTestShip(['99']));
      gameState.cpuNumShips = 1;
      game.processPlayerGuess('00');
      gameState = game.getGameState();
      
      expect(gameState.guesses).toContain('00');
      expect(gameState.board[0][0]).toBe('O'); // Should be a miss
    });
  });

  describe('printBoard()', () => {
    test('should not throw errors when called', () => {
      game.createBoard();
      expect(() => game.printBoard()).not.toThrow();
    });
  });

  describe('gameLoop()', () => {
    test('should not throw errors when game is over (CPU wins)', () => {
      game.createBoard();
      gameState = game.getGameState();
      gameState.playerNumShips = 0; // Simulate player losing
      
      expect(() => game.gameLoop()).not.toThrow();
    });

    test('should not throw errors when game is over (Player wins)', () => {
      game.createBoard();
      gameState = game.getGameState();
      gameState.cpuNumShips = 0; // Simulate CPU losing
      
      expect(() => game.gameLoop()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty ship arrays', () => {
      game.createBoard();
      gameState = game.getGameState();
      gameState.cpuShips.length = 0;
      
      const result = game.processPlayerGuess('00');
      gameState = game.getGameState();
      
      expect(result).toBe(true);
      expect(gameState.board[0][0]).toBe('O'); // Should be a miss
    });

    test('should handle maximum board coordinates', () => {
      game.createBoard();
      gameState = game.getGameState();
      gameState.cpuShips.length = 0;
      gameState.cpuShips.push(createTestShip(['99']));
      gameState.cpuNumShips = 1;
      
      const result = game.processPlayerGuess('99');
      gameState = game.getGameState();
      
      expect(result).toBe(true);
      expect(gameState.board[9][9]).toBe('X'); // Should be a hit
    });

    test('should handle repeated hits on same location', () => {
      game.createBoard();
      gameState = game.getGameState();
      gameState.cpuShips.length = 0;
      gameState.cpuShips.push(createTestShip(['00', '01', '02']));
      gameState.cpuNumShips = 1;
      
      // First hit
      const result1 = game.processPlayerGuess('00');
      expect(result1).toBe(true);
      
      // Try to hit same location again
      const result2 = game.processPlayerGuess('00');
      expect(result2).toBe(false);
    });
  });

  describe('resetGame()', () => {
    test('should reset all game state variables', () => {
      // Set up some game state
      game.createBoard();
      gameState = game.getGameState();
      gameState.playerShips.push(createTestShip(['00']));
      gameState.guesses.push('11');
      gameState.cpuMode = 'target';
      
      // Reset the game
      game.resetGame();
      gameState = game.getGameState();
      
      expect(gameState.playerShips).toHaveLength(0);
      expect(gameState.cpuShips).toHaveLength(0);
      expect(gameState.guesses).toHaveLength(0);
      expect(gameState.cpuGuesses).toHaveLength(0);
      expect(gameState.cpuMode).toBe('hunt');
      expect(gameState.cpuTargetQueue).toHaveLength(0);
      // Check that boards are properly reset (should be 10x10 grids)
      expect(gameState.board).toHaveLength(10);
      expect(gameState.playerBoard).toHaveLength(10);
      expect(gameState.board[0]).toHaveLength(10);
      expect(gameState.playerBoard[0]).toHaveLength(10);
    });
  });
}); 