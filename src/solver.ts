import { Grid, CellValue } from './types';

/**
 * Crea una copia profonda della griglia.
 */
function cloneGrid(grid: Grid): Grid {
  return grid.map(row => [...row]) as Grid;
}

/**
 * Verifica se inserire `val` in (row, col) è lecito.
 */
function isValid(grid: Grid, row: number, col: number, val: number): boolean {
  // Controllo riga
  if (grid[row].includes(val as CellValue)) return false;

  // Controllo colonna
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === val) return false;
  }

  // Controllo box 3×3
  const boxR = Math.floor(row / 3) * 3;
  const boxC = Math.floor(col / 3) * 3;
  for (let r = boxR; r < boxR + 3; r++) {
    for (let c = boxC; c < boxC + 3; c++) {
      if (grid[r][c] === val) return false;
    }
  }

  return true;
}

/**
 * Trova la cella vuota con il minor numero di candidati (euristica MRV).
 * Restituisce null se non ci sono celle vuote.
 */
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

/**
 * Risolve il puzzle con backtracking + MRV.
 * Ritorna la griglia risolta oppure null se non ha soluzione.
 */
export function solve(input: Grid): Grid | null {
  const grid = cloneGrid(input);

  function backtrack(): boolean {
    const cell = findBestEmpty(grid);
    if (!cell) return true; // griglia piena = soluzione trovata

    const [row, col] = cell;

    for (let val = 1; val <= 9; val++) {
      if (isValid(grid, row, col, val)) {
        grid[row][col] = val as CellValue;
        if (backtrack()) return true;
        grid[row][col] = 0;
      }
    }

    return false; // nessun valore funziona → backtrack
  }

  return backtrack() ? grid : null;
}

/**
 * Verifica se il puzzle ha esattamente una soluzione.
 * Utile per validare puzzle generati o importati.
 */
export function countSolutions(input: Grid, limit = 2): number {
  const grid = cloneGrid(input);
  let count = 0;

  function backtrack(): void {
    if (count >= limit) return;

    const cell = findBestEmpty(grid);
    if (!cell) {
      count++;
      return;
    }

    const [row, col] = cell;
    for (let val = 1; val <= 9; val++) {
      if (isValid(grid, row, col, val)) {
        grid[row][col] = val as CellValue;
        backtrack();
        grid[row][col] = 0;
      }
    }
  }

  backtrack();
  return count;
}
