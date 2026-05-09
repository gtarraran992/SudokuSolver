import { CellValue, GridSize } from '../logic/types';
import './Numpad.css';

interface Props {
  onNumber: (n: CellValue) => void;
  onErase: () => void;
  color?: string;
  gridSize: GridSize;
}

export default function Numpad({ onNumber, onErase, color = '#2C2C2A', gridSize }: Props) {
  const numbers = Array.from({ length: gridSize }, (_, i) => (i + 1) as CellValue);

  // Colonne del numpad in base alla dimensione
  const cols = gridSize === 4 ? 4 : gridSize === 6 ? 3 : gridSize === 9 ? 5 : gridSize === 12 ? 4 : 4;

  return (
    <div className="numpad" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {numbers.map(n => (
        <button key={n} className="num-btn" style={{ color }} onClick={() => onNumber(n)}>{n}</button>
      ))}
      <button 
        className="erase-btn" 
        style={{ gridColumn: '1 / -1' }}
        onClick={onErase}>⌫
      </button>
    </div>
  );
}