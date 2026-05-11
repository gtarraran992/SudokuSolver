import { useTranslation } from 'react-i18next';
import './ConsentScreen.css';

interface Props {
  onAccept: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export default function ConsentScreen({ onAccept, onOpenPrivacy, onOpenTerms }: Props) {
  const { t } = useTranslation();

  return (
    <div className="consent-screen screen">
      <div className="consent-header">
        <div className="consent-icon">💡</div>
        <h1>{t('consent.title')}</h1>
      </div>

      <div className="consent-body">
        <p className="consent-subtitle">{t('consent.subtitle')}</p>

        <div className="consent-links-box">
          <button className="consent-link-row" onClick={onOpenTerms}>
            <span>{t('settings.terms')}</span>
            <span className="consent-arrow">→</span>
          </button>
          <div className="consent-divider" />
          <button className="consent-link-row" onClick={onOpenPrivacy}>
            <span>{t('settings.privacy')}</span>
            <span className="consent-arrow">→</span>
          </button>
        </div>

        <p className="consent-note">{t('consent.note')}</p>
      </div>

      <button className="btn-primary consent-btn" onClick={onAccept}>
        ✓ {t('consent.accept')}
      </button>
    </div>
  );
}
