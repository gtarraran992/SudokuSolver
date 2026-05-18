import { useState, useCallback } from 'react';
import SudokuGrid from '../components/SudokuGrid';
import Numpad from '../components/Numpad';
import { BoardState, CellState, CellValue, Grid, GridSize } from '../logic/types';
import { validateGrid } from '../logic/validator';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import { SudokuOcr } from '../plugins/SudokuOcrPlugin';
import './Screen.css';
import './SettingsScreen.css';

interface Props {
  gridSize: GridSize;
  isDiagonal: boolean;
  onConfirm: (board: BoardState) => void;
  initialBoard?: BoardState;
  onBack: () => void;
  onSettings: () => void;
}

function emptyBoard(size: GridSize): BoardState {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, (): CellState => ({ value: 0, type: 'empty', isError: false }))
  );
}

function minCells(size: GridSize): number {
  if (size === 4) return 4;
  if (size === 6) return 8;
  return 17;
}

function gridToBoardState(grid: number[][]): BoardState {
  return grid.map(row =>
    row.map((value): CellState => ({
      value: value as CellValue,
      type: value === 0 ? 'empty' : 'given',
      isError: false,
    }))
  );
}

export default function GivenScreen({ gridSize, isDiagonal, onConfirm, initialBoard, onBack }: Props) {
  const { t } = useTranslation();
  const [board, setBoard] = useState<BoardState>(initialBoard ?? emptyBoard(gridSize));
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [scanLoading, setScanLoading] = useState(false);

  const isNative = Capacitor.isNativePlatform();

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

  const handleScan = useCallback(async () => {
    try {
      setScanLoading(true);
      setErrorMsg('');
      const { grid } = await SudokuOcr.recognizeGrid({ gridSize });
      setBoard(gridToBoardState(grid));
    } catch (e: any) {
      setErrorMsg(t('given.scanError'));
    } finally {
      setScanLoading(false);
    }
  }, [gridSize, t]);

  const handleConfirm = useCallback(() => {
    const grid = board.map(r => r.map(c => c.value)) as Grid;
    const validation = validateGrid(grid, gridSize, isDiagonal);
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
  }, [board, onConfirm, gridSize, isDiagonal, t]);

  const handleReset = useCallback(() => {
    if (confirm(t('given.restartConfirm'))) {
      setBoard(emptyBoard(gridSize));
      setSelectedCell(null);
      setErrorMsg('');
    }
  }, [gridSize, t]);

  const filledCount = board.flat().filter(c => c.value !== 0).length;
  const min = minCells(gridSize);
  const canConfirm = filledCount >= min;

  return (
    <div className="screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack}>← {t('settings.back')}</button>
        <h1>{gridSize}x{gridSize}{isDiagonal ? ' ✖️' : ''}</h1>
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
        <SudokuGrid
          board={board}
          selectedCell={selectedCell}
          onCellPress={handleCellPress}
          gridSize={gridSize}
          isDiagonal={isDiagonal}
        />
      </div>

      <Numpad onNumber={handleNumber} onErase={handleErase} color="#2C2C2A" gridSize={gridSize} />

      <p className="counter">
        {t('given.counter', { count: filledCount })} {canConfirm ? t('given.counterOk') : `(minimo ${min})`}
      </p>

      {isNative && (
        <button className="btn-ghost" onClick={handleScan} disabled={scanLoading}>
          {scanLoading ? t('given.scanProgress1') : '📷 ' + t('given.scan')}
        </button>
      )}

      <button className="btn-primary" onClick={handleConfirm} disabled={!canConfirm}>
        {t('given.confirm')}
      </button>

      <button className="btn-ghost" onClick={handleReset}>{t('given.restart')}</button>
    </div>
  );
}