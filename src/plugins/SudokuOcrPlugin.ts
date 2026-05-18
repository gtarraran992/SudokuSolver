import { registerPlugin } from '@capacitor/core';

export interface SudokuOcrPlugin {
  /**
   * Lancia la fotocamera/galleria con crop, elabora l'immagine
   * e restituisce la griglia riconosciuta.
   *
   * @param options.gridSize Dimensione della griglia (4, 6, 9, 12, 16)
   * @returns grid: number[][] con i valori riconosciuti (0 = cella vuota)
   */
  recognizeGrid(options: { gridSize: number }): Promise<{
    grid: number[][];
    gridSize: number;
  }>;
}

const SudokuOcr = registerPlugin<SudokuOcrPlugin>('SudokuOcr');

export { SudokuOcr };
