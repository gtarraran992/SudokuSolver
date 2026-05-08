import { Hint, HintLevel } from '../logic/types';
import './HintPanel.css';

interface Props {
  hint: Hint | null;
  currentLevel: HintLevel;
  onLevelChange: (level: HintLevel) => void;
  onRequestHint: () => void;
  hintCount: number;
}

const levelLabels: Record<HintLevel, string> = { 1: 'Dove guardare', 2: 'Quale tecnica', 3: 'La risposta' };
const levelColors: Record<HintLevel, string> = { 1: '#1D9E75', 2: '#BA7517', 3: '#D85A30' };
const levelBg: Record<HintLevel, string> = { 1: '#E1F5EE', 2: '#FAEEDA', 3: '#FAECE7' };

export default function HintPanel({ hint, currentLevel, onLevelChange, onRequestHint, hintCount }: Props) {
  return (
    <div className="hint-panel">
      <div className="level-row">
        {([1, 2, 3] as HintLevel[]).map(lv => (
          <button
            key={lv}
            className={`level-btn ${currentLevel === lv ? 'active' : ''}`}
            style={currentLevel === lv ? { background: levelBg[lv], borderColor: levelColors[lv], color: levelColors[lv] } : {}}
            onClick={() => onLevelChange(lv)}
          >
            {levelLabels[lv]}
          </button>
        ))}
      </div>

      {hint ? (
        <div className="hint-box" style={{ background: levelBg[hint.level] }}>
          <div className="hint-header">
            <span className="technique-name" style={{ color: levelColors[hint.level] }}>{hint.techniqueName}</span>
            <span className="level-badge" style={{ color: levelColors[hint.level] }}>Livello {hint.level}</span>
          </div>
          <p className="hint-text">{hint.description}</p>
        </div>
      ) : (
        <div className="hint-empty">
          <p>Premi "Chiedi indizio" per ricevere aiuto</p>
        </div>
      )}

      <button className="hint-button" onClick={onRequestHint}>💡 Chiedi indizio</button>

      {hintCount > 0 && <p className="hint-count">Indizi usati: {hintCount}</p>}
    </div>
  );
}
