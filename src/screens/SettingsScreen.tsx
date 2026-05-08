import { useTranslation } from 'react-i18next';
import './Screen.css';
import './SettingsScreen.css';

interface Props {
  onBack: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export default function SettingsScreen({ onBack, onOpenPrivacy, onOpenTerms }: Props) {
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    const next = i18n.language === 'it' ? 'en' : 'it';
    i18n.changeLanguage(next);
    localStorage.setItem('sudokuhint_lang', next);
  };

  const handleReport = () => {
    window.location.href = 'mailto:gtarraran992@gmail.com?subject=Segnalazione%20Sudoku%20Hint';
  };

  return (
    <div className="screen">
      <div className="settings-header">
        <button className="btn-back" onClick={onBack}>← {t('settings.back')}</button>
        <h2>{t('settings.title')}</h2>
      </div>

      {/* Lingua */}
      <div className="settings-section-label">{t('settings.language')}</div>
      <div className="settings-card" onClick={toggleLang}>
        <span className="settings-card-icon">
          {i18n.language === 'it' ? '🇮🇹' : '🇬🇧'}
        </span>
        <span className="settings-card-text">
          {i18n.language === 'it' ? t('settings.italian') : t('settings.english')}
        </span>
        <span className="settings-card-arrow">›</span>
      </div>

      {/* Legale */}
      <div className="settings-section-label">{t('settings.legal')}</div>
      <div className="settings-card" onClick={onOpenPrivacy}>
        <span className="settings-card-text">{t('settings.privacy')}</span>
        <span className="settings-card-arrow">›</span>
      </div>
      <div className="settings-card" onClick={onOpenTerms}>
        <span className="settings-card-text">{t('settings.terms')}</span>
        <span className="settings-card-arrow">›</span>
      </div>

      {/* Supporto */}
      <div className="settings-section-label">{t('settings.support')}</div>
      <div className="settings-card" onClick={handleReport}>
        <span className="settings-card-icon">✉️</span>
        <span className="settings-card-text">{t('settings.reportProblem')}</span>
        <span className="settings-card-arrow">›</span>
      </div>

      {/* Versione */}
      <div className="settings-version">
        Sudoku Hint v{__APP_VERSION__}
      </div>
    </div>
  );
}
