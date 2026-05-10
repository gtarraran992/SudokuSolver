import { Grid, GridSize, Hint, CellValue } from './types';
import { getCandidates, getCandidatesDiagonal, getBoxDimensions } from './validator';

export function getHint(grid: Grid, solution: Grid, level: 1 | 2 | 3, size: GridSize, isDiagonal: boolean = false): Hint | null {
  const getCands = (g: Grid, r: number, c: number) =>
    isDiagonal ? getCandidatesDiagonal(g, r, c, size) : getCandidates(g, r, c, size);

  const result =
    findNakedSingle(grid, size, getCands) ??
    findHiddenSingle(grid, size, getCands) ??
    findAnyEmpty(grid, solution, size, getCands);

  if (!result) return null;
  return buildHint(result, level);
}

interface TechniqueResult {
  technique: 'naked_single' | 'hidden_single' | 'fallback';
  row: number; col: number; answer: CellValue;
  context: { highlightRows?: number[]; highlightCols?: number[]; highlightBoxRow?: number; highlightBoxCol?: number; };
}

function findNakedSingle(
  grid: Grid,
  size: GridSize,
  getCands: (g: Grid, r: number, c: number) => number[]
): TechniqueResult | null {
  const { boxRows, boxCols } = getBoxDimensions(size);
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== 0) continue;
      const candidates = getCands(grid, r, c);
      if (candidates.length === 1)
        return {
          technique: 'naked_single', row: r, col: c, answer: candidates[0] as CellValue,
          context: {
            highlightRows: [r], highlightCols: [c],
            highlightBoxRow: Math.floor(r / boxRows),
            highlightBoxCol: Math.floor(c / boxCols),
          },
        };
    }
  return null;
}

function findHiddenSingle(
  grid: Grid,
  size: GridSize,
  getCands: (g: Grid, r: number, c: number) => number[]
): TechniqueResult | null {
  const { boxRows, boxCols } = getBoxDimensions(size);

  for (let r = 0; r < size; r++)
    for (let num = 1; num <= size; num++) {
      if (grid[r].includes(num as CellValue)) continue;
      const pos = [];
      for (let c = 0; c < size; c++)
        if (grid[r][c] === 0 && getCands(grid, r, c).includes(num)) pos.push(c);
      if (pos.length === 1)
        return { technique: 'hidden_single', row: r, col: pos[0], answer: num as CellValue, context: { highlightRows: [r] } };
    }

  for (let c = 0; c < size; c++)
    for (let num = 1; num <= size; num++) {
      const colVals = Array.from({ length: size }, (_, r) => grid[r][c]);
      if (colVals.includes(num as CellValue)) continue;
      const pos = [];
      for (let r = 0; r < size; r++)
        if (grid[r][c] === 0 && getCands(grid, r, c).includes(num)) pos.push(r);
      if (pos.length === 1)
        return { technique: 'hidden_single', row: pos[0], col: c, answer: num as CellValue, context: { highlightCols: [c] } };
    }

  const numBoxRows = size / boxRows;
  const numBoxCols = size / boxCols;
  for (let boxR = 0; boxR < numBoxRows; boxR++)
    for (let boxC = 0; boxC < numBoxCols; boxC++)
      for (let num = 1; num <= size; num++) {
        let inBox = false;
        for (let r = boxR * boxRows; r < boxR * boxRows + boxRows; r++)
          for (let c = boxC * boxCols; c < boxC * boxCols + boxCols; c++)
            if (grid[r][c] === num) inBox = true;
        if (inBox) continue;
        const pos: [number, number][] = [];
        for (let r = boxR * boxRows; r < boxR * boxRows + boxRows; r++)
          for (let c = boxC * boxCols; c < boxC * boxCols + boxCols; c++)
            if (grid[r][c] === 0 && getCands(grid, r, c).includes(num)) pos.push([r, c]);
        if (pos.length === 1)
          return { technique: 'hidden_single', row: pos[0][0], col: pos[0][1], answer: num as CellValue, context: { highlightBoxRow: boxR, highlightBoxCol: boxC } };
      }

  return null;
}

function findAnyEmpty(
  grid: Grid,
  solution: Grid,
  size: GridSize,
  getCands: (g: Grid, r: number, c: number) => number[]
): TechniqueResult | null {
  let bestRow = -1, bestCol = -1, min = size + 1;
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== 0) continue;
      const n = getCands(grid, r, c).length;
      if (n < min) { min = n; bestRow = r; bestCol = c; }
    }
  if (bestRow === -1) return null;
  return {
    technique: 'fallback', row: bestRow, col: bestCol,
    answer: solution[bestRow][bestCol],
    context: { highlightRows: [bestRow], highlightCols: [bestCol] }
  };
}

function buildHint(result: TechniqueResult, level: 1 | 2 | 3): Hint {
  const { technique, row, col, answer, context } = result;

  const techniqueKey = `hint.technique.${technique}`;

  let descriptionKey = '';
  let descriptionParams: Record<string, number | string> = { row: row + 1, col: col + 1, answer };

  if (level === 1) {
    if (context.highlightRows && !context.highlightCols) descriptionKey = 'hint.desc.l1_row';
    else if (context.highlightCols && !context.highlightRows) descriptionKey = 'hint.desc.l1_col';
    else if (context.highlightBoxRow !== undefined) descriptionKey = 'hint.desc.l1_box';
    else descriptionKey = 'hint.desc.l1_cell';
  } else if (level === 2) {
    if (technique === 'naked_single') descriptionKey = 'hint.desc.l2_naked';
    else if (technique === 'hidden_single') {
      if (context.highlightRows) descriptionKey = 'hint.desc.l2_hidden_row';
      else if (context.highlightCols) descriptionKey = 'hint.desc.l2_hidden_col';
      else descriptionKey = 'hint.desc.l2_hidden_box';
    } else descriptionKey = 'hint.desc.l2_fallback';
  } else {
    descriptionKey = 'hint.desc.l3_answer';
  }

  return {
    level,
    techniqueKey,
    descriptionKey,
    descriptionParams,
    targetRow: row,
    targetCol: col,
    answer: level === 3 ? answer : undefined,
    ...context
  };
}
