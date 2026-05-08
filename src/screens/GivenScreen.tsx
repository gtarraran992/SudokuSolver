import { useState, useCallback } from 'react';
import SudokuGrid from '../components/SudokuGrid';
import Numpad from '../components/Numpad';
import { BoardState, CellState, CellValue, Grid } from '../logic/types';
import { validateGrid } from '../logic/validator';
import { useTranslation } from 'react-i18next';
import './Screen.css';
import './SettingsScreen.css';

interface Props {
  onConfirm: (board: BoardState) => void;
  initialBoard?: BoardState;
  onSettings: () => void;
}

function emptyBoard(): BoardState {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, (): CellState => ({ value: 0, type: 'empty', isError: false }))
  );
}

export default function GivenScreen({ onConfirm, initialBoard, onSettings }: Props) {
  const { t } = useTranslation();
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
      setErrorMsg(t('given.errorConflicts', { count: validation.errors.length }));
      return;
    }
    onConfirm(board);
  }, [board, onConfirm, t]);

  const handleReset = useCallback(() => {
    if (confirm(t('given.restartConfirm'))) {
      setBoard(emptyBoard());
      setSelectedCell(null);
      setErrorMsg('');
    }
  }, [t]);

  const filledCount = board.flat().filter(c => c.value !== 0).length;
  const canConfirm = filledCount >= 17;

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>{t('appName')}</h1>
      </div>

      <div className="step-row">
        <span className="step-badge">{t('given.step')}</span>
      </div>

      <div className="card card-gray">
        <h3>{t('given.cardTitle')}</h3>
        <p>{t('given.cardDesc')}</p>
        <p>{t('given.cardDesc2')}</p>
      </div>

      {errorMsg && <div className="error-msg">⚠️ {errorMsg}</div>}

      <div className="grid-wrapper">
        <SudokuGrid board={board} selectedCell={selectedCell} onCellPress={handleCellPress} />
      </div>

      <Numpad onNumber={handleNumber} onErase={handleErase} color="#2C2C2A" />

      <p className="counter">
        {t('given.counter', { count: filledCount })} {filledCount >= 17 ? t('given.counterOk') : t('given.counterMin')}
      </p>

      <button className="btn-primary" onClick={handleConfirm} disabled={!canConfirm}>
        {t('given.confirm')}
      </button>

      <button className="btn-ghost" onClick={handleReset}>{t('given.restart')}</button>

      <div className="settings-fab">
        <button className="btn-settings" onClick={onSettings}>⚙️</button>
      </div>
    </div>
  );
}