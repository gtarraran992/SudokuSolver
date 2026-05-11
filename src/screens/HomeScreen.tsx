import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GridSize } from '../logic/types';
import './Screen.css';
import './SettingsScreen.css';
import './HomeScreen.css';

interface Props {
  onSelectSize: (size: GridSize, diagonal?: boolean, forceReset?: boolean) => void;
  onSettings: () => void;
  currentGame: { size: GridSize; isDiagonal: boolean } | null;
}

export default function HomeScreen({ onSelectSize, onSettings, currentGame }: Props) {
  const { t } = useTranslation();
  const [show9x9Modal, setShow9x9Modal] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [pendingSize, setPendingSize] = useState<GridSize | null>(null);
  const [pendingDiagonal, setPendingDiagonal] = useState(false);

  const variants: { size: GridSize; icon: string; diffKey: string; descKey: string; color: string; bg: string }[] = [
    { size: 4,  icon: '🟢', diffKey: 'home.diff4',  descKey: 'home.desc4',  color: '#1D9E75', bg: '#E1F5EE' },
    { size: 6,  icon: '🟡', diffKey: 'home.diff6',  descKey: 'home.desc6',  color: '#BA7517', bg: '#FAEEDA' },
    { size: 9,  icon: '🔴', diffKey: 'home.diff9',  descKey: 'home.desc9',  color: '#D85A30', bg: '#FAECE7' },
    { size: 12, icon: '🟣', diffKey: 'home.diff12', descKey: 'home.desc12', color: '#7B3FA0', bg: '#F3E8FA' },
    { size: 16, icon: '⚫', diffKey: 'home.diff16', descKey: 'home.desc16', color: '#2C2C2C', bg: '#E8E8E8' },
  ];

  // Controlla se la variante selezionata è quella della partita in corso
  const isSameVariant = (size: GridSize, diagonal: boolean) =>
    currentGame !== null && currentGame.size === size && currentGame.isDiagonal === diagonal;

  const handleVariantSelected = (size: GridSize, diagonal: boolean) => {
    if (!currentGame) {
      // Nessuna partita in corso, vai direttamente
      onSelectSize(size, diagonal);
    } else if (isSameVariant(size, diagonal)) {
      // Stessa variante — mostra "Continua o Nuova partita"
      setPendingSize(size);
      setPendingDiagonal(diagonal);
      setShowContinueModal(true);
    } else {
      // Variante diversa — avvisa che si perde la partita in corso
      setPendingSize(size);
      setPendingDiagonal(diagonal);
      setShowAbandonModal(true);
    }
  };

  const handleCardClick = (size: GridSize) => {
    if (size === 9) {
      setShow9x9Modal(true);
    } else {
      handleVariantSelected(size, false);
    }
  };

  const handle9x9VariantClick = (diagonal: boolean) => {
    setShow9x9Modal(false);
    handleVariantSelected(9, diagonal);
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

      {/* Modale selezione variante 9x9 */}
      {show9x9Modal && (
        <div className="modal-overlay" onClick={() => setShow9x9Modal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{t('home.modal9Title')}</h2>
            <p className="modal-subtitle">{t('home.modal9Subtitle')}</p>

            <button className="modal-option" onClick={() => handle9x9VariantClick(false)}>
              <div className="modal-option-left" style={{ background: '#FAECE7' }}>
                <span>🔴</span>
              </div>
              <div className="modal-option-right">
                <span className="modal-option-title" style={{ color: '#D85A30' }}>{t('home.diff9')}</span>
                <span className="modal-option-desc">{t('home.desc9')}</span>
              </div>
              <span className="variant-arrow" style={{ color: '#D85A30' }}>›</span>
            </button>

            <button className="modal-option" onClick={() => handle9x9VariantClick(true)}>
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

      {/* Modale continua / nuova partita (stessa variante) */}
      {showContinueModal && (
        <div className="modal-overlay" onClick={() => setShowContinueModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{t('home.continueTitle')}</h2>
            <p className="modal-subtitle">{t('home.continueSubtitle')}</p>

            <button className="modal-option" onClick={() => {
              setShowContinueModal(false);
              if (pendingSize) onSelectSize(pendingSize, pendingDiagonal);
            }}>
              <div className="modal-option-left" style={{ background: '#E1F5EE' }}>
                <span>▶️</span>
              </div>
              <div className="modal-option-right">
                <span className="modal-option-title" style={{ color: '#1D9E75' }}>{t('home.continueContinue')}</span>
                <span className="modal-option-desc">{t('home.continueContinueDesc')}</span>
              </div>
              <span className="variant-arrow" style={{ color: '#1D9E75' }}>›</span>
            </button>

            <button className="modal-option" onClick={() => {
              setShowContinueModal(false);
              if (pendingSize) onSelectSize(pendingSize, pendingDiagonal, true);
            }}>
              <div className="modal-option-left" style={{ background: '#FCEBEB' }}>
                <span>🔄</span>
              </div>
              <div className="modal-option-right">
                <span className="modal-option-title" style={{ color: '#A32D2D' }}>{t('home.continueNew')}</span>
                <span className="modal-option-desc">{t('home.continueNewDesc')}</span>
              </div>
              <span className="variant-arrow" style={{ color: '#A32D2D' }}>›</span>
            </button>

            <button className="modal-close" onClick={() => setShowContinueModal(false)}>
              {t('home.modalClose')}
            </button>
          </div>
        </div>
      )}

      {/* Modale abbandona partita (variante diversa) */}
      {showAbandonModal && (
        <div className="modal-overlay" onClick={() => setShowAbandonModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{t('home.abandonTitle')}</h2>
            <p className="modal-subtitle">{t('home.abandonSubtitle')}</p>

            <button className="modal-option" onClick={() => {
              setShowAbandonModal(false);
              if (pendingSize) onSelectSize(pendingSize, pendingDiagonal, true);
            }}>
              <div className="modal-option-left" style={{ background: '#FCEBEB' }}>
                <span>✅</span>
              </div>
              <div className="modal-option-right">
                <span className="modal-option-title" style={{ color: '#A32D2D' }}>{t('home.abandonConfirm')}</span>
                <span className="modal-option-desc">{t('home.abandonConfirmDesc')}</span>
              </div>
              <span className="variant-arrow" style={{ color: '#A32D2D' }}>›</span>
            </button>

            <button className="modal-close" onClick={() => setShowAbandonModal(false)}>
              {t('home.modalClose')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
