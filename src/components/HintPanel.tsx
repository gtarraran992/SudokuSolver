import { useTranslation } from 'react-i18next';
import { Hint, HintLevel } from '../logic/types';
import './HintPanel.css';

interface Props {
  hint: Hint | null;
  currentLevel: HintLevel;
  onLevelChange: (level: HintLevel) => void;
  onRequestHint: () => void;
  hintCount: number;
}

const levelColors: Record<HintLevel, string> = { 1: '#1D9E75', 2: '#BA7517', 3: '#D85A30' };
const levelBg: Record<HintLevel, string> = { 1: '#E1F5EE', 2: '#FAEEDA', 3: '#FAECE7' };

export default function HintPanel({ hint, currentLevel, onLevelChange, onRequestHint, hintCount }: Props) {
  const { t } = useTranslation();

  const levelLabels: Record<HintLevel, string> = {
    1: t('hint.level1'),
    2: t('hint.level2'),
    3: t('hint.level3'),
  };

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
            <span className="technique-name" style={{ color: levelColors[hint.level] }}>
              {t(hint.techniqueKey)}
            </span>
            <span className="level-badge" style={{ color: levelColors[hint.level] }}>
              {t('hint.levelBadge', { level: hint.level })}
            </span>
          </div>
          <p className="hint-text">{t(hint.descriptionKey, hint.descriptionParams)}</p>
        </div>
      ) : (
        <div className="hint-empty">
          <p>{t('hint.hintPlaceholder')}</p>
        </div>
      )}

      <button className="hint-button" onClick={onRequestHint}>{t('hint.askHint')}</button>

      {hintCount > 0 && <p className="hint-count">{t('hint.hintsUsed', { count: hintCount })}</p>}
    </div>
  );
}
