import { Grid, CellValue } from './types';

function cloneGrid(grid: Grid): Grid {
  return grid.map(row => [...row]) as Grid;
}

function isValid(grid: Grid, row: number, col: number, val: number): boolean {
  if (grid[row].includes(val as CellValue)) return false;

  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === val) return false;
  }

  const boxR = Math.floor(row / 3) * 3;
  const boxC = Math.floor(col / 3) * 3;
  for (let r = boxR; r < boxR + 3; r++) {
    for (let c = boxC; c < boxC + 3; c++) {
      if (grid[r][c] === val) return false;
    }
  }

  return true;
}

function findBestEmpty(grid: Grid): [number, number] | null {
  let bestRow = -1;
  let bestCol = -1;
  let minOptions = 10;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== 0) continue;

      let count = 0;
      for (let v = 1; v <= 9; v++) {
        if (isValid(grid, r, c, v)) count++;
      }

      if (count < minOptions) {
        minOptions = count;
        bestRow = r;
        bestCol = c;
      }
    }
  }

  return bestRow === -1 ? null : [bestRow, bestCol];
}

export function solve(input: Grid): Grid | null {
  const grid = cloneGrid(input);

  function backtrack(): boolean {
    const cell = findBestEmpty(grid);
    if (!cell) return true;

    const [row, col] = cell;

    for (let val = 1; val <= 9; val++) {
      if (isValid(grid, row, col, val)) {
        grid[row][col] = val as CellValue;
        if (backtrack()) return true;
        grid[row][col] = 0;
      }
    }

    return false;
  }

  return backtrack() ? grid : null;
}
