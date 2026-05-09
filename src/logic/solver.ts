import { Grid, GridSize, CellValue } from './types';
import { getBoxDimensions } from './validator';

function cloneGrid(grid: Grid): Grid {
  return grid.map(row => [...row]) as Grid;
}

function isValid(grid: Grid, row: number, col: number, val: number, size: GridSize): boolean {
  const { boxRows, boxCols } = getBoxDimensions(size);

  if (grid[row].includes(val as CellValue)) return false;
  for (let r = 0; r < size; r++) if (grid[r][col] === val) return false;

  const boxR = Math.floor(row / boxRows) * boxRows;
  const boxC = Math.floor(col / boxCols) * boxCols;
  for (let r = boxR; r < boxR + boxRows; r++)
    for (let c = boxC; c < boxC + boxCols; c++)
      if (grid[r][c] === val) return false;

  return true;
}

function findBestEmpty(grid: Grid, size: GridSize): [number, number] | null {
  let bestRow = -1, bestCol = -1, minOptions = size + 1;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== 0) continue;
      let count = 0;
      for (let v = 1; v <= size; v++) if (isValid(grid, r, c, v, size)) count++;
      if (count < minOptions) { minOptions = count; bestRow = r; bestCol = c; }
    }
  }
  return bestRow === -1 ? null : [bestRow, bestCol];
}

export function solve(input: Grid, size: GridSize): Grid | null {
  const grid = cloneGrid(input);

  function backtrack(): boolean {
    const cell = findBestEmpty(grid, size);
    if (!cell) return true;
    const [row, col] = cell;
    for (let val = 1; val <= size; val++) {
      if (isValid(grid, row, col, val, size)) {
        grid[row][col] = val as CellValue;
        if (backtrack()) return true;
        grid[row][col] = 0;
      }
    }
    return false;
  }

  return backtrack() ? grid : null;
}