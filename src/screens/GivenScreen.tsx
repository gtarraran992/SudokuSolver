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

// Ridimensiona l'immagine base64 per migliorare l'OCR
async function resizeBase64(base64: string, maxSize: number = 1200): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.92).split(',')[1]);
    };
    img.src = `data:image/jpeg;base64,${base64}`;
  });
}

// Parsing basato su coordinate pixel dei simboli (hocr)
function parseGridFromHocr(hocr: string, size: GridSize): BoardState | null {
  const grid: BoardState = emptyBoard(size);

  // Estrai tutti i simboli con le loro coordinate bbox
  const symbolRegex = /<span class='ocrx_word'[^>]*bbox (\d+) (\d+) (\d+) (\d+)[^>]*>([^<]+)<\/span>/g;
  const words: { x: number; y: number; w: number; h: number; text: string }[] = [];

  let match;
  while ((match = symbolRegex.exec(hocr)) !== null) {
    const x1 = parseInt(match[1]);
    const y1 = parseInt(match[2]);
    const x2 = parseInt(match[3]);
    const y2 = parseInt(match[4]);
    const text = match[5].trim().replace(/\D/g, '');
    if (text) {
      words.push({
        x: Math.round((x1 + x2) / 2),
        y: Math.round((y1 + y2) / 2),
        w: x2 - x1,
        h: y2 - y1,
        text,
      });
    }
  }

  if (words.length < 4) return null;

  // Trova i bounds della griglia
  const xs = words.map(w => w.x);
  const ys = words.map(w => w.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const cellW = (maxX - minX) / (size - 1);
  const cellH = (maxY - minY) / (size - 1);

  if (cellW < 1 || cellH < 1) return null;

  // Assegna ogni numero alla cella più vicina
  for (const word of words) {
    // Estrai ogni cifra singola dalla parola
    for (let i = 0; i < word.text.length; i++) {
      const digit = parseInt(word.text[i]);
      if (isNaN(digit) || digit < 1 || digit > size) continue;

      // Stima la posizione x per questa cifra nella parola
      const charX = word.x - (word.w / 2) + (word.w / word.text.length) * (i + 0.5);
      const charY = word.y;

      const col = Math.round((charX - minX) / cellW);
      const row = Math.round((charY - minY) / cellH);

      if (row >= 0 && row < size && col >= 0 && col < size) {
        if (grid[row][col].value === 0) {
          grid[row][col] = { value: digit as CellValue, type: 'given', isError: false };
        }
      }
    }
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

    const confirmed = confirm(t('given.scanBeta'));
    if (!confirmed) return;
    
    try {
      setIsScanning(true);
      setScanMsg('');
      setErrorMsg('');
      setScanProgress(t('given.scanProgress1'));

      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'base64' as any,
        source: 'CAMERA' as any,
      });

      if (!photo.base64String) {
        setIsScanning(false);
        setScanProgress('');
        return;
      }

      setScanProgress(t('given.scanProgress2'));

      // Ridimensiona l'immagine
      const resized = await resizeBase64(photo.base64String);
      const imageData = `data:image/jpeg;base64,${resized}`;

      const worker = await createWorker('eng', 1, {
        logger: () => {},
      });

      await worker.setParameters({
        tessedit_char_whitelist: '0123456789',
        tessedit_pageseg_mode: '6' as any,
      });

      setScanProgress(t('given.scanProgress3'));

      // Usa hocr per ottenere le coordinate pixel
      const { data: { hocr } } = await worker.recognize(imageData, {}, { hocr: true });
      await worker.terminate();

      setScanProgress('');

      const parsed = hocr ? parseGridFromHocr(hocr, gridSize) : null;

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
