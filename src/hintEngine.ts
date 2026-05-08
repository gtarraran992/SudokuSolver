import { Grid, Hint, CellValue } from './types';
import { getCandidates } from './validator';

export function getHint(grid: Grid, solution: Grid, level: 1 | 2 | 3): Hint | null {
  const nakedSingle = findNakedSingle(grid);
  if (nakedSingle) return buildHint(nakedSingle, level);

  const hiddenSingle = findHiddenSingle(grid);
  if (hiddenSingle) return buildHint(hiddenSingle, level);

  const fallback = findAnyEmpty(grid, solution);
  if (fallback) return buildHint(fallback, level);

  return null;
}

interface TechniqueResult {
  technique: 'naked_single' | 'hidden_single' | 'fallback';
  row: number;
  col: number;
  answer: CellValue;
  context: {
    highlightRows?: number[];
    highlightCols?: number[];
    highlightBoxRow?: number;
    highlightBoxCol?: number;
  };
}

function findNakedSingle(grid: Grid): TechniqueResult | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== 0) continue;
      const candidates = getCandidates(grid, r, c);
      if (candidates.length === 1) {
        return {
          technique: 'naked_single',
          row: r,
          col: c,
          answer: candidates[0] as CellValue,
          context: {
            highlightRows: [r],
            highlightCols: [c],
            highlightBoxRow: Math.floor(r / 3),
            highlightBoxCol: Math.floor(c / 3),
          },
        };
      }
    }
  }
  return null;
}

function findHiddenSingle(grid: Grid): TechniqueResult | null {
  for (let r = 0; r < 9; r++) {
    for (let num = 1; num <= 9; num++) {
      if (grid[r].includes(num as CellValue)) continue;
      const positions = [];
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0 && getCandidates(grid, r, c).includes(num)) {
          positions.push(c);
        }
      }
      if (positions.length === 1) {
        return {
          technique: 'hidden_single',
          row: r,
          col: positions[0],
          answer: num as CellValue,
          context: { highlightRows: [r] },
        };
      }
    }
  }

  for (let c = 0; c < 9; c++) {
    for (let num = 1; num <= 9; num++) {
      const colVals = Array.from({ length: 9 }, (_, r) => grid[r][c]);
      if (colVals.includes(num as CellValue)) continue;
      const positions = [];
      for (let r = 0; r < 9; r++) {
        if (grid[r][c] === 0 && getCandidates(grid, r, c).includes(num)) {
          positions.push(r);
        }
      }
      if (positions.length === 1) {
        return {
          technique: 'hidden_single',
          row: positions[0],
          col: c,
          answer: num as CellValue,
          context: { highlightCols: [c] },
        };
      }
    }
  }

  for (let boxR = 0; boxR < 3; boxR++) {
    for (let boxC = 0; boxC < 3; boxC++) {
      for (let num = 1; num <= 9; num++) {
        let alreadyInBox = false;
        for (let r = boxR * 3; r < boxR * 3 + 3; r++) {
          for (let c = boxC * 3; c < boxC * 3 + 3; c++) {
            if (grid[r][c] === num) { alreadyInBox = true; break; }
          }
          if (alreadyInBox) break;
        }
        if (alreadyInBox) continue;

        const positions: Array<[number, number]> = [];
        for (let r = boxR * 3; r < boxR * 3 + 3; r++) {
          for (let c = boxC * 3; c < boxC * 3 + 3; c++) {
            if (grid[r][c] === 0 && getCandidates(grid, r, c).includes(num)) {
              positions.push([r, c]);
            }
          }
        }
        if (positions.length === 1) {
          return {
            technique: 'hidden_single',
            row: positions[0][0],
            col: positions[0][1],
            answer: num as CellValue,
            context: { highlightBoxRow: boxR, highlightBoxCol: boxC },
          };
        }
      }
    }
  }

  return null;
}

function findAnyEmpty(grid: Grid, solution: Grid): TechniqueResult | null {
  let bestRow = -1, bestCol = -1, minCandidates = 10;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== 0) continue;
      const cands = getCandidates(grid, r, c).length;
      if (cands < minCandidates) {
        minCandidates = cands;
        bestRow = r;
        bestCol = c;
      }
    }
  }

  if (bestRow === -1) return null;

  return {
    technique: 'fallback',
    row: bestRow,
    col: bestCol,
    answer: solution[bestRow][bestCol],
    context: { highlightRows: [bestRow], highlightCols: [bestCol] },
  };
}

function buildHint(result: TechniqueResult, level: 1 | 2 | 3): Hint {
  const { technique, row, col, answer, context } = result;

  const techniqueName = {
    naked_single: 'Singolo candidato',
    hidden_single: 'Singolo nascosto',
    fallback: 'Analisi avanzata',
  }[technique];

  let description = '';

  if (level === 1) {
    if (context.highlightRows && !context.highlightCols) {
      description = `Concentrati sulla riga ${row + 1}. Analizza quali numeri sono già presenti.`;
    } else if (context.highlightCols && !context.highlightRows) {
      description = `Concentrati sulla colonna ${col + 1}. Analizza quali numeri sono già presenti.`;
    } else if (context.highlightBoxRow !== undefined) {
      description = `Concentrati sul box evidenziato. Cerca un numero che può stare solo in una posizione.`;
    } else {
      description = `Guarda la cella nella riga ${row + 1}, colonna ${col + 1}.`;
    }
  } else if (level === 2) {
    if (technique === 'naked_single') {
      description = `Tecnica: Singolo candidato. La cella in riga ${row + 1}, colonna ${col + 1} ha un unico numero possibile dopo aver escluso tutti i valori già presenti nella stessa riga, colonna e box 3×3.`;
    } else if (technique === 'hidden_single') {
      if (context.highlightRows) {
        description = `Tecnica: Singolo nascosto in riga. Nella riga ${row + 1} esiste un numero che può essere collocato in un'unica cella.`;
      } else if (context.highlightCols) {
        description = `Tecnica: Singolo nascosto in colonna. Nella colonna ${col + 1} esiste un numero che può andare solo in una cella.`;
      } else {
        description = `Tecnica: Singolo nascosto nel box. In questo box 3×3 c'è un numero che può occupare una sola cella.`;
      }
    } else {
      description = `La cella in riga ${row + 1}, colonna ${col + 1} è la più vincolata. Elenca i candidati rimasti.`;
    }
  } else {
    description = `Nella cella in riga ${row + 1}, colonna ${col + 1} inserisci il numero ${answer}. (${techniqueName})`;
  }

  return {
    level,
    techniqueName,
    description,
    targetRow: row,
    targetCol: col,
    answer: level === 3 ? answer : undefined,
    ...context,
  };
}
