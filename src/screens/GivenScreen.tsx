import { useState, useCallback } from 'react';
import SudokuGrid from '../components/SudokuGrid';
import Numpad from '../components/Numpad';
import { BoardState, CellState, CellValue, Grid, GridSize } from '../logic/types';
import { validateGrid } from '../logic/validator';
import { useTranslation } from 'react-i18next';
import { Camera } from '@capacitor/camera';
import { createWorker } from 'tesseract.js';
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

// Estrae una griglia size x size dal testo OCR
function parseGridFromText(text: string, size: GridSize): BoardState | null {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const grid: BoardState = emptyBoard(size);
  let row = 0;

  for (const line of lines) {
    if (row >= size) break;
    const tokens = line.match(/\d+|[._\-|]/g);
    if (!tokens) continue;

    let col = 0;
    for (const token of tokens) {
      if (col >= size) break;
      const num = parseInt(token);
      if (!isNaN(num) && num >= 1 && num <= size) {
        grid[row][col] = { value: num as CellValue, type: 'given', isError: false };
      }
      col++;
    }
    if (col > 0) row++;
  }

  const filled = grid.flat().filter(c => c.value !== 0).length;
  return filled >= 4 ? grid : null;
}

export default function GivenScreen({ gridSize, isDiagonal, onConfirm, initialBoard, onBack }: Props) {
  const { t } = useTranslation();
  const [board, setBoard] = useState<BoardState>(initialBoard ?? emptyBoard(gridSize));
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [scanMsg, setScanMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState('');

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
    setScanMsg('');
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
      setIsScanning(true);
      setScanMsg('');
      setErrorMsg('');
      setScanProgress(t('given.scanProgress1'));

      // Scatta foto
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'uri' as any,
        source: 'CAMERA' as any,
      });

      const imageUrl = photo.webPath ?? photo.path ?? '';
      if (!imageUrl) {
        setIsScanning(false);
        setScanProgress('');
        return;
      }

      setScanProgress(t('given.scanProgress2'));

      // Inizializza Tesseract con file locali
const worker = await createWorker('eng', 1, {
  workerPath: '/tesseract/worker.min.js',
  langPath: '/tesseract',
  corePath: '/tesseract/tesseract-core.wasm.js',
  logger: () => {},
});

      // Configura per numeri (whitelist solo cifre)
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789',
      });

      setScanProgress(t('given.scanProgress3'));

      const { data: { text } } = await worker.recognize(imageUrl);
      await worker.terminate();

      setScanProgress('');

      const parsed = parseGridFromText(text, gridSize);

      if (!parsed) {
        setErrorMsg(t('given.scanError'));
        setIsScanning(false);
        return;
      }

      setBoard(parsed);
      setScanMsg(t('given.scanSuccess'));
    } catch (e) {
      console.error('Scan error:', e);
      setErrorMsg(t('given.scanError'));
      setScanProgress('');
    } finally {
      setIsScanning(false);
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
      setScanMsg('');
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

      {scanMsg && (
        <div className="scan-success-msg">
          📷 {scanMsg}
        </div>
      )}

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

      <button className="btn-scan" onClick={handleScan} disabled={isScanning}>
        {isScanning ? (scanProgress || t('given.scanning')) : t('given.scan')}
      </button>

      <button className="btn-primary" onClick={handleConfirm} disabled={!canConfirm}>
        {t('given.confirm')}
      </button>

      <button className="btn-ghost" onClick={handleReset}>{t('given.restart')}</button>
    </div>
  );
}
