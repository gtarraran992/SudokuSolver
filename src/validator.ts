import { Grid, ValidationResult } from './types';

/**
 * Controlla se la griglia inserita è coerente:
 * - nessun duplicato in riga, colonna o box 3×3
 * Non verifica se il puzzle ha soluzione — quello lo fa il solver.
 */
export function validateGrid(grid: Grid): ValidationResult {
  const errors: ValidationResult['errors'] = [];

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val === 0) continue;

      // Controlla riga
      for (let cc = 0; cc < 9; cc++) {
        if (cc !== c && grid[r][cc] === val) {
          errors.push({ row: r, col: c, reason: `Duplicato ${val} nella riga ${r + 1}` });
        }
      }

      // Controlla colonna
      for (let rr = 0; rr < 9; rr++) {
        if (rr !== r && grid[rr][c] === val) {
          errors.push({ row: r, col: c, reason: `Duplicato ${val} nella colonna ${c + 1}` });
        }
      }

      // Controlla box 3×3
      const boxR = Math.floor(r / 3) * 3;
      const boxC = Math.floor(c / 3) * 3;
      for (let rr = boxR; rr < boxR + 3; rr++) {
        for (let cc = boxC; cc < boxC + 3; cc++) {
          if ((rr !== r || cc !== c) && grid[rr][cc] === val) {
            errors.push({ row: r, col: c, reason: `Duplicato ${val} nel box` });
          }
        }
      }
    }
  }

  // Deduplicazione errori per cella
  const seen = new Set<string>();
  const deduped = errors.filter(e => {
    const key = `${e.row},${e.col}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { valid: deduped.length === 0, errors: deduped };
}

/**
 * Ritorna i candidati validi per una cella (numeri non ancora presenti
 * in riga, colonna e box).
 */
export function getCandidates(grid: Grid, row: number, col: number): number[] {
  if (grid[row][col] !== 0) return [];

  const used = new Set<number>();

  for (let i = 0; i < 9; i++) {
    used.add(grid[row][i]);
    used.add(grid[i][col]);
  }

  const boxR = Math.floor(row / 3) * 3;
  const boxC = Math.floor(col / 3) * 3;
  for (let r = boxR; r < boxR + 3; r++) {
    for (let c = boxC; c < boxC + 3; c++) {
      used.add(grid[r][c]);
    }
  }

  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !used.has(n));
}
