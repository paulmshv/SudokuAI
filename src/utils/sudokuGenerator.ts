export type Board = (number | null)[][];

// Create an empty 9x9 board
function createEmptyBoard(): Board {
  return Array(9).fill(null).map(() => Array(9).fill(null));
}

// Check if placing num at (row, col) is valid
function isValid(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }
  // Check column
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

// Shuffle array
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Fill the board using backtracking with randomization
function fillBoard(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Count solutions (up to limit) - optimized
function countSolutions(board: Board, limit: number = 2): number {
  let count = 0;
  const b = board.map(row => [...row]);

  function solve(): boolean {
    // Find first empty cell
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (b[row][col] === null) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(b, row, col, num)) {
              b[row][col] = num;
              if (solve()) {
                b[row][col] = null;
                return true;
              }
              b[row][col] = null;
            }
          }
          return false;
        }
      }
    }
    count++;
    return count >= limit;
  }

  solve();
  return count;
}

// Generate puzzle based on difficulty
// difficulty: 1=Very Easy, 2=Easy, 3=Medium, 4=Hard, 5=Expert
export function generateSudoku(difficulty: number): { puzzle: Board; solution: Board } {
  // Generate complete solution
  const solution = createEmptyBoard();
  fillBoard(solution);

  // Determine how many cells to remove based on difficulty
  const cellsToRemove = [30, 38, 45, 52, 56][difficulty - 1] || 40;

  // Create puzzle by removing cells
  const puzzle = solution.map(row => [...row]);

  // Get all positions and shuffle them
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  const shuffledPositions = shuffle(positions);

  let removed = 0;
  for (const [row, col] of shuffledPositions) {
    if (removed >= cellsToRemove) break;

    const backup = puzzle[row][col];
    puzzle[row][col] = null;

    // For easier difficulties, check uniqueness
    // For harder difficulties, skip some checks for speed
    if (difficulty <= 3) {
      if (countSolutions(puzzle) === 1) {
        removed++;
      } else {
        puzzle[row][col] = backup;
      }
    } else {
      // For hard/expert, just remove without checking (faster)
      // Still check occasionally to maintain some uniqueness
      if (removed % 5 === 0) {
        if (countSolutions(puzzle) === 1) {
          removed++;
        } else {
          puzzle[row][col] = backup;
        }
      } else {
        removed++;
      }
    }
  }

  return { puzzle, solution };
}

// Solve the puzzle completely
export function solveSudoku(board: Board): Board | null {
  const copy = board.map(row => [...row]);

  function solve(b: Board): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (b[row][col] === null) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(b, row, col, num)) {
              b[row][col] = num;
              if (solve(b)) return true;
              b[row][col] = null;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  if (solve(copy)) return copy;
  return null;
}

// Find a hint: a cell that can be determined with current state
export function findHint(board: Board, solution: Board): { row: number; col: number; value: number } | null {
  // First, find cells that are empty and have only one possibility
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        const possibleValues: number[] = [];
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            possibleValues.push(num);
          }
        }
        if (possibleValues.length === 1) {
          return { row, col, value: possibleValues[0] };
        }
      }
    }
  }

  // If no cell with single possibility, return the solution value for first empty cell
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        return { row, col, value: solution[row][col]! };
      }
    }
  }

  return null;
}

// Check if the board has any errors (conflicts)
export function findErrors(board: Board): Set<string> {
  const errors = new Set<string>();

  // Check rows
  for (let row = 0; row < 9; row++) {
    const seen = new Map<number, number[]>();
    for (let col = 0; col < 9; col++) {
      const val = board[row][col];
      if (val !== null) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(col);
      }
    }
    for (const [, cols] of seen) {
      if (cols.length > 1) {
        cols.forEach(c => errors.add(`${row}-${c}`));
      }
    }
  }

  // Check columns
  for (let col = 0; col < 9; col++) {
    const seen = new Map<number, number[]>();
    for (let row = 0; row < 9; row++) {
      const val = board[row][col];
      if (val !== null) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(row);
      }
    }
    for (const [, rows] of seen) {
      if (rows.length > 1) {
        rows.forEach(r => errors.add(`${r}-${col}`));
      }
    }
  }

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Map<number, [number, number][]>();
      for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
        for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
          const val = board[r][c];
          if (val !== null) {
            if (!seen.has(val)) seen.set(val, []);
            seen.get(val)!.push([r, c]);
          }
        }
      }
      for (const [, positions] of seen) {
        if (positions.length > 1) {
          positions.forEach(([r, c]) => errors.add(`${r}-${c}`));
        }
      }
    }
  }

  return errors;
}

// Find cells that can be determined (for hint highlighting)
export function findDeterminableCells(board: Board): { row: number; col: number; value: number }[] {
  const results: { row: number; col: number; value: number }[] = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        const possibleValues: number[] = [];
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            possibleValues.push(num);
          }
        }
        if (possibleValues.length === 1) {
          results.push({ row, col, value: possibleValues[0] });
        }
      }
    }
  }

  return results;
}

// Check if board is complete and correct
export function isBoardComplete(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) return false;
    }
  }
  return findErrors(board).size === 0;
}
