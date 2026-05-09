import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GridSize } from '../logic/types';
import './Screen.css';
import './SettingsScreen.css';
import './HomeScreen.css';

interface Props {
  onSelectSize: (size: GridSize, diagonal?: boolean) => void;
  onSettings: () => void;
}

export default function HomeScreen({ onSelectSize, onSettings }: Props) {
  const { t } = useTranslation();
  const [show9x9Modal, setShow9x9Modal] = useState(false);

  const variants: { size: GridSize; icon: string; diffKey: string; descKey: string; color: string; bg: string }[] = [
    { size: 4,  icon: '🟢', diffKey: 'home.diff4',  descKey: 'home.desc4',  color: '#1D9E75', bg: '#E1F5EE' },
    { size: 6,  icon: '🟡', diffKey: 'home.diff6',  descKey: 'home.desc6',  color: '#BA7517', bg: '#FAEEDA' },
    { size: 9,  icon: '🔴', diffKey: 'home.diff9',  descKey: 'home.desc9',  color: '#D85A30', bg: '#FAECE7' },
    { size: 12, icon: '🟣', diffKey: 'home.diff12', descKey: 'home.desc12', color: '#7B3FA0', bg: '#F3E8FA' },
    { size: 16, icon: '⚫', diffKey: 'home.diff16', descKey: 'home.desc16', color: '#2C2C2C', bg: '#E8E8E8' },
  ];

  const handleCardClick = (size: GridSize) => {
    if (size === 9) {
      setShow9x9Modal(true);
    } else {
      onSelectSize(size, false);
    }
  };

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
            onClick={() => handleCardClick(size)}
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

      {show9x9Modal && (
        <div className="modal-overlay" onClick={() => setShow9x9Modal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{t('home.modal9Title')}</h2>
            <p className="modal-subtitle">{t('home.modal9Subtitle')}</p>

            <button className="modal-option" onClick={() => { setShow9x9Modal(false); onSelectSize(9, false); }}>
              <div className="modal-option-left" style={{ background: '#FAECE7' }}>
                <span>🔴</span>
              </div>
              <div className="modal-option-right">
                <span className="modal-option-title" style={{ color: '#D85A30' }}>{t('home.diff9')}</span>
                <span className="modal-option-desc">{t('home.desc9')}</span>
              </div>
              <span className="variant-arrow" style={{ color: '#D85A30' }}>›</span>
            </button>

            <button className="modal-option" onClick={() => { setShow9x9Modal(false); onSelectSize(9, true); }}>
              <div className="modal-option-left" style={{ background: '#F0E8FA' }}>
                <span>✖️</span>
              </div>
              <div className="modal-option-right">
                <span className="modal-option-title" style={{ color: '#6B35A8' }}>{t('home.diff9d')}</span>
                <span className="modal-option-desc">{t('home.desc9d')}</span>
              </div>
              <span className="variant-arrow" style={{ color: '#6B35A8' }}>›</span>
            </button>

            <button className="modal-close" onClick={() => setShow9x9Modal(false)}>
              {t('home.modalClose')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
