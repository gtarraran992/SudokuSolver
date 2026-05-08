import { Grid, Hint, CellValue } from './types';
import { getCandidates } from './validator';

export function getHint(grid: Grid, solution: Grid, level: 1 | 2 | 3): Hint | null {
  const result = findNakedSingle(grid) ?? findHiddenSingle(grid) ?? findAnyEmpty(grid, solution);
  if (!result) return null;
  return buildHint(result, level);
}

interface TechniqueResult {
  technique: 'naked_single' | 'hidden_single' | 'fallback';
  row: number; col: number; answer: CellValue;
  context: { highlightRows?: number[]; highlightCols?: number[]; highlightBoxRow?: number; highlightBoxCol?: number; };
}

function findNakedSingle(grid: Grid): TechniqueResult | null {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== 0) continue;
      const candidates = getCandidates(grid, r, c);
      if (candidates.length === 1)
        return { technique: 'naked_single', row: r, col: c, answer: candidates[0] as CellValue,
          context: { highlightRows: [r], highlightCols: [c], highlightBoxRow: Math.floor(r/3), highlightBoxCol: Math.floor(c/3) } };
    }
  return null;
}

function findHiddenSingle(grid: Grid): TechniqueResult | null {
  for (let r = 0; r < 9; r++)
    for (let num = 1; num <= 9; num++) {
      if (grid[r].includes(num as CellValue)) continue;
      const pos = [];
      for (let c = 0; c < 9; c++) if (grid[r][c] === 0 && getCandidates(grid, r, c).includes(num)) pos.push(c);
      if (pos.length === 1) return { technique: 'hidden_single', row: r, col: pos[0], answer: num as CellValue, context: { highlightRows: [r] } };
    }

  for (let c = 0; c < 9; c++)
    for (let num = 1; num <= 9; num++) {
      const colVals = Array.from({ length: 9 }, (_, r) => grid[r][c]);
      if (colVals.includes(num as CellValue)) continue;
      const pos = [];
      for (let r = 0; r < 9; r++) if (grid[r][c] === 0 && getCandidates(grid, r, c).includes(num)) pos.push(r);
      if (pos.length === 1) return { technique: 'hidden_single', row: pos[0], col: c, answer: num as CellValue, context: { highlightCols: [c] } };
    }

  for (let boxR = 0; boxR < 3; boxR++)
    for (let boxC = 0; boxC < 3; boxC++)
      for (let num = 1; num <= 9; num++) {
        let inBox = false;
        for (let r = boxR*3; r < boxR*3+3; r++) for (let c = boxC*3; c < boxC*3+3; c++) if (grid[r][c] === num) inBox = true;
        if (inBox) continue;
        const pos: [number,number][] = [];
        for (let r = boxR*3; r < boxR*3+3; r++) for (let c = boxC*3; c < boxC*3+3; c++)
          if (grid[r][c] === 0 && getCandidates(grid, r, c).includes(num)) pos.push([r,c]);
        if (pos.length === 1) return { technique: 'hidden_single', row: pos[0][0], col: pos[0][1], answer: num as CellValue, context: { highlightBoxRow: boxR, highlightBoxCol: boxC } };
      }

  return null;
}

function findAnyEmpty(grid: Grid, solution: Grid): TechniqueResult | null {
  let bestRow = -1, bestCol = -1, min = 10;
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
    if (grid[r][c] !== 0) continue;
    const n = getCandidates(grid, r, c).length;
    if (n < min) { min = n; bestRow = r; bestCol = c; }
  }
  if (bestRow === -1) return null;
  return { technique: 'fallback', row: bestRow, col: bestCol, answer: solution[bestRow][bestCol], context: { highlightRows: [bestRow], highlightCols: [bestCol] } };
}

function buildHint(result: TechniqueResult, level: 1 | 2 | 3): Hint {
  const { technique, row, col, answer, context } = result;
  const techniqueName = { naked_single: 'Singolo candidato', hidden_single: 'Singolo nascosto', fallback: 'Analisi avanzata' }[technique];
  let description = '';
  if (level === 1) {
    if (context.highlightRows && !context.highlightCols) description = `Concentrati sulla riga ${row+1}.`;
    else if (context.highlightCols && !context.highlightRows) description = `Concentrati sulla colonna ${col+1}.`;
    else if (context.highlightBoxRow !== undefined) description = `Concentrati sul box evidenziato.`;
    else description = `Guarda la cella in riga ${row+1}, colonna ${col+1}.`;
  } else if (level === 2) {
    if (technique === 'naked_single') description = `Tecnica: Singolo candidato. La cella in riga ${row+1}, colonna ${col+1} ha un unico numero possibile.`;
    else if (technique === 'hidden_single') {
      if (context.highlightRows) description = `Tecnica: Singolo nascosto in riga. Nella riga ${row+1} un numero può stare solo in una cella.`;
      else if (context.highlightCols) description = `Tecnica: Singolo nascosto in colonna. Nella colonna ${col+1} un numero può stare solo in una cella.`;
      else description = `Tecnica: Singolo nascosto nel box. In questo box un numero può occupare solo una cella.`;
    } else description = `La cella in riga ${row+1}, colonna ${col+1} è la più vincolata. Analizza i candidati.`;
  } else {
    description = `Nella cella in riga ${row+1}, colonna ${col+1} inserisci il numero ${answer}.`;
  }
  return { level, techniqueName, description, targetRow: row, targetCol: col, answer: level === 3 ? answer : undefined, ...context };
}
