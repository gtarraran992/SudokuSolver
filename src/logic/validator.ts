import { Grid, GridSize, ValidationResult } from './types';

// Restituisce le dimensioni del box in base alla dimensione della griglia
export function getBoxDimensions(size: GridSize): { boxRows: number; boxCols: number } {
  switch (size) {
    case 4:  return { boxRows: 2, boxCols: 2 };
    case 6:  return { boxRows: 2, boxCols: 3 };
    case 9:  return { boxRows: 3, boxCols: 3 };
    case 12: return { boxRows: 3, boxCols: 4 };
    case 16: return { boxRows: 4, boxCols: 4 };
  }
}

export function validateGrid(grid: Grid, size: GridSize): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const { boxRows, boxCols } = getBoxDimensions(size);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = grid[r][c];
      if (val === 0) continue;

      // Controlla riga
      for (let cc = 0; cc < size; cc++) {
        if (cc !== c && grid[r][cc] === val)
          errors.push({ row: r, col: c, reason: `Duplicato ${val} nella riga ${r + 1}` });
      }
      // Controlla colonna
      for (let rr = 0; rr < size; rr++) {
        if (rr !== r && grid[rr][c] === val)
          errors.push({ row: r, col: c, reason: `Duplicato ${val} nella colonna ${c + 1}` });
      }
      // Controlla box
      const boxR = Math.floor(r / boxRows) * boxRows;
      const boxC = Math.floor(c / boxCols) * boxCols;
      for (let rr = boxR; rr < boxR + boxRows; rr++)
        for (let cc = boxC; cc < boxC + boxCols; cc++)
          if ((rr !== r || cc !== c) && grid[rr][cc] === val)
            errors.push({ row: r, col: c, reason: `Duplicato ${val} nel box` });
    }
  }

  const seen = new Set<string>();
  const deduped = errors.filter(e => {
    const key = `${e.row},${e.col}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { valid: deduped.length === 0, errors: deduped };
}

export function getCandidates(grid: Grid, row: number, col: number, size: GridSize): number[] {
  if (grid[row][col] !== 0) return [];
  const { boxRows, boxCols } = getBoxDimensions(size);
  const used = new Set<number>();

  for (let i = 0; i < size; i++) {
    used.add(grid[row][i]);
    used.add(grid[i][col]);
  }

  const boxR = Math.floor(row / boxRows) * boxRows;
  const boxC = Math.floor(col / boxCols) * boxCols;
  for (let r = boxR; r < boxR + boxRows; r++)
    for (let c = boxC; c < boxC + boxCols; c++)
      used.add(grid[r][c]);

  return Array.from({ length: size }, (_, i) => i + 1).filter(n => !used.has(n));
}