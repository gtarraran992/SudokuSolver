import { useState, useCallback } from 'react';
import SudokuGrid from '../components/SudokuGrid';
import Numpad from '../components/Numpad';
import { BoardState, CellState, CellValue, Grid } from '../logic/types';
import { validateGrid } from '../logic/validator';
import { solve } from '../logic/solver';
import './Screen.css';

interface Props {
  givenBoard: BoardState;
  initialBoard?: BoardState;
  onCalculate: (board: BoardState, solution: Grid) => void;
  onBack: () => void;
}

export default function UserScreen({ givenBoard, initialBoard, onCalculate, onBack }: Props) {
const [board, setBoard] = useState<BoardState>(
  initialBoard ?? givenBoard.map(row => row.map(cell => ({ ...cell })))
);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCellPress = useCallback((row: number, col: number) => {
    if (board[row][col].type === 'given') return;
    setSelectedCell({ row, col });
  }, [board]);

  const handleNumber = useCallback((num: CellValue) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (board[row][col].type === 'given') return;
    setBoard(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })));
      next[row][col] = { value: num, type: 'user', isError: false };
      return next;
    });
    setErrorMsg('');
  }, [selectedCell, board]);

  const handleErase = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (board[row][col].type === 'given') return;
    setBoard(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })));
      next[row][col] = { value: 0, type: 'empty', isError: false };
      return next;
    });
  }, [selectedCell, board]);

  const handleCalculate = useCallback(() => {
    const grid = board.map(r => r.map(c => c.value)) as Grid;
    const validation = validateGrid(grid);
    if (!validation.valid) {
      setBoard(prev => {
        const next = prev.map(r => r.map(c => ({ ...c, isError: false })));
        validation.errors.forEach(e => { next[e.row][e.col].isError = true; });
        return next;
      });
      setErrorMsg('Conflitto trovato. Controlla le celle rosse.');
      return;
    }
    const solution = solve(grid);
    if (!solution) {
      setErrorMsg('Nessuna soluzione trovata. Controlla che i numeri inseriti siano corretti.');
      return;
    }
    onCalculate(board, solution);
  }, [board, onCalculate]);

  const userCount = board.flat().filter((c: CellState) => c.type === 'user').length;

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Sudoku Hint</h1>
        <span className="step-badge">Passo 2 di 2</span>
      </div>

      <div className="card card-blue">
        <h3>Inserisci i numeri che hai già risolto</h3>
        <p>Aggiungi in blu i numeri che sei già riuscito a trovare da solo, poi calcola la soluzione.</p>
      </div>

      {errorMsg && <div className="error-msg">⚠️ {errorMsg}</div>}

      <div className="grid-wrapper">
        <SudokuGrid board={board} selectedCell={selectedCell} onCellPress={handleCellPress} />
      </div>

      <Numpad onNumber={handleNumber} onErase={handleErase} color="#185FA5" />

      <p className="counter">
        {userCount === 0 ? 'Inserisci almeno un numero per procedere' : `${userCount} numeri aggiunti`}
      </p>

      <button className="btn-primary" onClick={handleCalculate} disabled={userCount === 0}>
        Calcola soluzione →
      </button>

<button className="btn-warning" onClick={onBack}>
  ✏️ Modifica i numeri fissi
</button>

    </div>
  );
}
