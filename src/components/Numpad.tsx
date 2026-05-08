import { CellValue } from '../logic/types';
import './Numpad.css';

interface Props {
  onNumber: (n: CellValue) => void;
  onErase: () => void;
  color?: string;
}

export default function Numpad({ onNumber, onErase, color = '#2C2C2A' }: Props) {
  return (
    <div className="numpad">
      {([1,2,3,4,5,6,7,8,9] as CellValue[]).map(n => (
        <button key={n} className="num-btn" style={{ color }} onClick={() => onNumber(n)}>{n}</button>
      ))}
      <button className="erase-btn" onClick={onErase}>⌫</button>
    </div>
  );
}
