export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Grid = CellValue[][];

export type CellType = 'given' | 'user' | 'empty';

export interface CellState {
  value: CellValue;
  type: CellType;
  isError: boolean;
}

export type BoardState = CellState[][];

export type HintLevel = 1 | 2 | 3;

export interface Hint {
  level: HintLevel;
  techniqueName: string;
  description: string;
  targetRow: number;
  targetCol: number;
  highlightRows?: number[];
  highlightCols?: number[];
  highlightBoxRow?: number;
  highlightBoxCol?: number;
  answer?: CellValue;
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ row: number; col: number; reason: string }>;
}
