import { useEffect, useState } from 'react';
import './SplashScreen.css';

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 600);
    const t2 = setTimeout(() => setPhase('exit'), 2000);
    const t3 = setTimeout(() => onFinish(), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div className={`splash-screen splash-${phase}`}>
      <div className="splash-content">
        <div className="splash-icon-wrapper">
          <img src="/icon-1024.png" alt="Sudoku Hint" className="splash-icon" />
        </div>
        <div className="splash-text">
          <h1 className="splash-title">Sudoku Hint</h1>
          <p className="splash-subtitle">Il tuo assistente per il sudoku</p>
        </div>
      </div>
      <div className="splash-dots">
        <span /><span /><span />
      </div>
    </div>
  );
}
