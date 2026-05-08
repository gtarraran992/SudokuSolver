import { useState, useCallback, useEffect } from 'react';
import SudokuGrid from '../components/SudokuGrid';
import HintPanel from '../components/HintPanel';
import Numpad from '../components/Numpad';
import { BoardState, CellState, CellValue, Grid, Hint, HintLevel } from '../logic/types';
import { getHint } from '../logic/hintEngine';
import './Screen.css';


interface Props {
  initialBoard: BoardState;
  solution: Grid;
  onBack: () => void;
  onReset: () => void;
  onBoardChange: (board: BoardState) => void;
}
export default function HintScreen({ initialBoard, solution, onBack, onReset, onBoardChange }: Props) {
  const [board, setBoard] = useState<BoardState>(
    initialBoard.map(r => r.map(c => ({ ...c, isError: false })))
  );
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [currentHint, setCurrentHint] = useState<Hint | null>(null);
  const [hintLevel, setHintLevel] = useState<HintLevel>(1);
  const [hintCount, setHintCount] = useState(0);

  useEffect(() => {
   onBoardChange(board);
  }, [board]);

  const currentGrid = () => board.map(row => row.map(cell => cell.value)) as Grid;

  const handleCellPress = useCallback((row: number, col: number) => {
    if (board[row][col].type === 'given') return;
    setSelectedCell({ row, col });
    setCurrentHint(null);
  }, [board]);

const handleNumber = useCallback((num: CellValue) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (board[row][col].type === 'given') return;
    const isFromHint = currentHint?.level === 3;
    setBoard(prev => {
      const next = prev.map(r => r.map(c => ({ ...c, isError: false })));
      next[row][col] = { value: num, type: isFromHint ? 'hint' : 'user', isError: num !== solution[row][col] };
      return next;
    });
    setCurrentHint(null);
  }, [selectedCell, board, solution, currentHint]);

  const handleErase = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (board[row][col].type === 'given') return;
    setBoard(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })));
      next[row][col] = { value: 0, type: 'empty', isError: false };
      return next;
    });
    setCurrentHint(null);
  }, [selectedCell, board]);

  const handleRequestHint = useCallback(() => {
    const hint = getHint(currentGrid(), solution, hintLevel);
    setCurrentHint(hint);
    setHintCount(c => c + 1);
    if (hint) setSelectedCell({ row: hint.targetRow, col: hint.targetCol });
  }, [board, solution, hintLevel]);

const handleShowSolution = useCallback(() => {
  if (!confirm('Vuoi vedere la soluzione completa? I numeri mancanti appariranno in rosso.')) return;
  setBoard(prev => {
    const next = prev.map((r, ri) => r.map((c, ci) => {
      if (c.type === 'given') return c;
      if (c.value !== 0 && !c.isError) return c; // già compilata correttamente, lascia com'è
      return { value: solution[ri][ci], type: 'solution' as const, isError: false };
    }));
    return next;
  });
}, [solution]);

  const isSolved = board.flat().every((cell: CellState, i: number) => cell.value === solution.flat()[i]);
  const filledCount = board.flat().filter((c: CellState) => c.value !== 0).length;
  const progress = Math.round((filledCount / 81) * 100);

  return (
    <div className="screen">
      <div className="hint-screen-header">
        <button className="btn-back" onClick={onBack}>← Indietro</button>
        <h2>Indizi</h2>
        <span className="progress-pill">{progress}%</span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {isSolved && (
        <div className="solved-banner">🎉 Puzzle completato! Ottimo lavoro!</div>
      )}

      <div className="grid-wrapper">
        <SudokuGrid
          board={board}
          selectedCell={selectedCell}
          highlightRows={currentHint?.highlightRows}
          highlightCols={currentHint?.highlightCols}
          highlightBoxRow={currentHint?.highlightBoxRow}
          highlightBoxCol={currentHint?.highlightBoxCol}
          hintCell={currentHint ? { row: currentHint.targetRow, col: currentHint.targetCol } : undefined}
          onCellPress={handleCellPress}
        />
      </div>

      <Numpad onNumber={handleNumber} onErase={handleErase} />

      <HintPanel
        hint={currentHint}
        currentLevel={hintLevel}
        onLevelChange={setHintLevel}
        onRequestHint={handleRequestHint}
        hintCount={hintCount}
      />

      <button className="btn-solution" onClick={handleShowSolution}>
       👁 Mostra soluzione completa
      </button>

      <button className="btn-ghost" onClick={onReset}>↺ Nuova partita</button>
    </div>
  );
}
