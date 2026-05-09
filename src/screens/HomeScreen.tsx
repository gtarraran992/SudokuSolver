import { useTranslation } from 'react-i18next';
import { GridSize } from '../logic/types';
import './Screen.css';
import './SettingsScreen.css';
import './HomeScreen.css';

interface Props {
  onSelectSize: (size: GridSize) => void;
  onSettings: () => void;
}

export default function HomeScreen({ onSelectSize, onSettings }: Props) {
  const { t } = useTranslation();

  const variants: { size: GridSize; icon: string; diffKey: string; descKey: string; color: string; bg: string }[] = [
    { size: 4,  icon: '🟢', diffKey: 'home.diff4', descKey: 'home.desc4', color: '#1D9E75', bg: '#E1F5EE' },
    { size: 6,  icon: '🟡', diffKey: 'home.diff6', descKey: 'home.desc6', color: '#BA7517', bg: '#FAEEDA' },
    { size: 9,  icon: '🔴', diffKey: 'home.diff9', descKey: 'home.desc9', color: '#D85A30', bg: '#FAECE7' },
  ];

  return (
    <div className="screen home-screen">
      <div className="home-header">
        <div className="home-titles">
          <h1>{t('appName')}</h1>
          <p>{t('home.subtitle')}</p>
        </div>
        <button className="btn-settings" onClick={onSettings}>⚙️</button>
      </div>

      <div className="home-variants">
        {variants.map(({ size, icon, diffKey, descKey, color, bg }) => (
          <button
            key={size}
            className="variant-card"
            style={{ borderColor: color }}
            onClick={() => onSelectSize(size)}
          >
            <div className="variant-card-left" style={{ background: bg }}>
              <span className="variant-icon">{icon}</span>
              <span className="variant-size" style={{ color }}>{size}x{size}</span>
            </div>
            <div className="variant-card-right">
              <span className="variant-diff" style={{ color }}>{t(diffKey)}</span>
              <span className="variant-desc">{t(descKey)}</span>
            </div>
            <span className="variant-arrow" style={{ color }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
