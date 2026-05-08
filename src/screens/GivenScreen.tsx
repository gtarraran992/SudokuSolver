import { useState, useCallback } from 'react';
import SudokuGrid from '../components/SudokuGrid';
import Numpad from '../components/Numpad';
import { BoardState, CellState, CellValue, Grid } from '../logic/types';
import { validateGrid } from '../logic/validator';
import './Screen.css';

interface Props {
  onConfirm: (board: BoardState) => void;
  initialBoard?: BoardState;
}

function emptyBoard(): BoardState {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, (): CellState => ({ value: 0, type: 'empty', isError: false }))
  );
}

export default function GivenScreen({ onConfirm, initialBoard }: Props) {
  const [board, setBoard] = useState<BoardState>(initialBoard ?? emptyBoard());
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCellPress = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  const handleNumber = useCallback((num: CellValue) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    setBoard(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })));
      next[row][col] = { value: num, type: 'given', isError: false };
      return next;
    });
    setErrorMsg('');
  }, [selectedCell]);

  const handleErase = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    setBoard(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })));
      next[row][col] = { value: 0, type: 'empty', isError: false };
      return next;
    });
  }, [selectedCell]);

  const handleConfirm = useCallback(() => {
    const grid = board.map(r => r.map(c => c.value)) as Grid;
    const validation = validateGrid(grid);
    if (!validation.valid) {
      setBoard(prev => {
        const next = prev.map(r => r.map(c => ({ ...c, isError: false })));
        validation.errors.forEach(e => { next[e.row][e.col].isError = true; });
        return next;
      });
      setErrorMsg(`Trovati ${validation.errors.length} conflitti. Controlla le celle rosse.`);
      return;
    }
    onConfirm(board);
  }, [board, onConfirm]);

  const handleReset = useCallback(() => {
    if (confirm('Vuoi cancellare tutti i numeri inseriti?')) {
      setBoard(emptyBoard());
      setSelectedCell(null);
      setErrorMsg('');
    }
  }, []);

  const filledCount = board.flat().filter(c => c.value !== 0).length;
  const canConfirm = filledCount >= 17;

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Sudoku Hint</h1>
        <span className="step-badge">Passo 1 di 2</span>
      </div>

      <div className="card card-gray">
        <h3>Inserisci i numeri fissi</h3>
        <p>Inserisci tutti i numeri già presenti nella griglia. Una volta confermati non potranno essere modificati.</p>
      </div>

      {errorMsg && <div className="error-msg">⚠️ {errorMsg}</div>}

      <div className="grid-wrapper">
        <SudokuGrid board={board} selectedCell={selectedCell} onCellPress={handleCellPress} />
      </div>

      <Numpad onNumber={handleNumber} onErase={handleErase} color="#2C2C2A" />

      <p className="counter">{filledCount} numeri inseriti {filledCount >= 17 ? '✓' : '(minimo 17)'}</p>

      <button className="btn-primary" onClick={handleConfirm} disabled={!canConfirm}>
        Conferma numeri fissi →
      </button>

      <button className="btn-ghost" onClick={handleReset}>Ricomincia</button>
    </div>
  );
}
