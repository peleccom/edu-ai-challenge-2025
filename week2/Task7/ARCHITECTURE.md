# Sea Battle Game - Modular Architecture

## Overview
The Sea Battle game has been refactored into a clean, modular architecture with clear separation of concerns. Each module is responsible for a specific aspect of the game functionality.

## Directory Structure

```
src/
├── ai/              # Artificial Intelligence
│   └── CpuPlayer.js    # CPU AI logic and decision-making
├── config/          # Configuration
│   └── constants.js    # Game constants and settings
├── game/            # Core Game Logic
│   ├── GameLogic.js    # Ship placement and player actions
│   └── GameState.js    # Game state management
├── models/          # Data Models
│   ├── Board.js        # Board state and operations
│   └── Ship.js         # Ship behavior and state
├── ui/              # User Interface
│   └── GameDisplay.js  # Display and visualization logic
└── utils/           # Utilities
    └── helpers.js      # Helper functions
```

## Module Responsibilities

### 🎯 **Models** (`src/models/`)
- **Ship.js**: Encapsulates ship behavior (hit detection, sinking logic)
- **Board.js**: Manages board state and grid operations

### 🎮 **Game Logic** (`src/game/`)
- **GameState.js**: Centralized game state management and reset functionality
- **GameLogic.js**: Core game mechanics (ship placement, player guess processing)

### 🤖 **AI** (`src/ai/`)
- **CpuPlayer.js**: CPU artificial intelligence with hunt/target modes

### 🖥️ **User Interface** (`src/ui/`)
- **GameDisplay.js**: All display logic and user feedback

### ⚙️ **Configuration** (`src/config/`)
- **constants.js**: Game configuration constants (board size, ship count, etc.)

### 🔧 **Utilities** (`src/utils/`)
- **helpers.js**: Shared utility functions

## Benefits of Modular Design

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Maintainability**: Changes to one aspect don't affect others
3. **Testability**: Individual modules can be tested in isolation
4. **Reusability**: Modules can be reused or replaced independently
5. **Readability**: Code is organized logically and easy to navigate

## Main Entry Point

The `seabattle.js` file serves as the main entry point and orchestrates all modules together while maintaining backward compatibility with existing tests.

## Test Coverage

The modular architecture maintains excellent test coverage:
- **82.22%** Statement Coverage
- **70.32%** Branch Coverage  
- **89.74%** Function Coverage
- **81.71%** Line Coverage

All tests continue to pass (34/34) ensuring no functionality regression during refactoring. 