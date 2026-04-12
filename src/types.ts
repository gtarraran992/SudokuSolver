// Tipi base
export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Grid = CellValue[][];

export type CellType = 'given' | 'user' | 'empty';

export interface CellState {
  value: CellValue;
  type: CellType;       // 'given' = fisso, 'user' = inserito dall'utente, 'empty' = vuoto
  isError: boolean;
}

export type BoardState = CellState[][];

// Livello di indizio restituito dal motore
export type HintLevel = 1 | 2 | 3;

export interface Hint {
  level: HintLevel;
  techniqueName: string;         // es. "Singolo candidato"
  description: string;           // testo spiegazione
  targetRow: number;             // 0-8
  targetCol: number;             // 0-8
  highlightRows?: number[];      // righe da evidenziare
  highlightCols?: number[];      // colonne da evidenziare
  highlightBoxRow?: number;      // box 3×3 (0-2)
  highlightBoxCol?: number;
  answer?: CellValue;            // solo al livello 3
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ row: number; col: number; reason: string }>;
}
