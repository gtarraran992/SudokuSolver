import { useState, useCallback } from 'react';
import SudokuGrid from '../components/SudokuGrid';
import Numpad from '../components/Numpad';
import { BoardState, CellState, CellValue, Grid, GridSize } from '../logic/types';
import { validateGrid } from '../logic/validator';
import { solve } from '../logic/solver';
import { useTranslation } from 'react-i18next';
import './Screen.css';
import './SettingsScreen.css';

interface Props {
  gridSize: GridSize;
  givenBoard: BoardState;
  initialBoard?: BoardState;
  onCalculate: (board: BoardState, solution: Grid) => void;
  onBack: () => void;
  onSettings: () => void;
}

export default function UserScreen({ gridSize, givenBoard, initialBoard, onCalculate, onBack, onSettings }: Props) {
  const { t } = useTranslation();
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
    const validation = validateGrid(grid, gridSize);
    if (!validation.valid) {
      setBoard(prev => {
        const next = prev.map(r => r.map(c => ({ ...c, isError: false })));
        validation.errors.forEach(e => { next[e.row][e.col].isError = true; });
        return next;
      });
      setErrorMsg(t('user.errorConflict'));
      return;
    }
    const solution = solve(grid, gridSize);
    if (!solution) {
      setErrorMsg(t('user.errorNoSolution'));
      return;
    }
    onCalculate(board, solution);
  }, [board, gridSize, onCalculate, t]);

  const userCount = board.flat().filter((c: CellState) => c.type === 'user').length;

  return (
    <div className="screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack}>← {t('settings.back')}</button>
        <h1>{gridSize}x{gridSize}</h1>
      </div>

      <div className="step-row">
        <span className="step-badge">{t('user.step')}</span>
      </div>

      <div className="card card-blue">
        <h3>{t('user.cardTitle')}</h3>
        <p>{t('user.cardDesc')}</p>
      </div>

      {errorMsg && <div className="error-msg">⚠️ {errorMsg}</div>}

      <div className="grid-wrapper">
        <SudokuGrid board={board} selectedCell={selectedCell} onCellPress={handleCellPress} gridSize={gridSize} />
      </div>

      <Numpad onNumber={handleNumber} onErase={handleErase} color="#185FA5" gridSize={gridSize} />

      <p className="counter">
        {userCount === 0 ? t('user.counterZero') : t('user.counter', { count: userCount })}
      </p>

      <button className="btn-primary" onClick={handleCalculate} disabled={userCount === 0}>
        {t('user.calculate')}
      </button>

      <button className="btn-warning" onClick={onBack}>
        {t('user.editGiven')}
      </button>

      <div className="settings-fab">
        <button className="btn-settings" onClick={onSettings}>⚙️</button>
      </div>
    </div>
  );
}