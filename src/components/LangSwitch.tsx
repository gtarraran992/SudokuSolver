import { useTranslation } from 'react-i18next';
import './LangSwitch.css';

export default function LangSwitch() {
  const { i18n } = useTranslation();

  const toggle = () => {
    const next = i18n.language === 'it' ? 'en' : 'it';
    i18n.changeLanguage(next);
    localStorage.setItem('sudokuhint_lang', next);
  };

  return (
    <button className="lang-switch" onClick={toggle}>
      {i18n.language === 'it' ? '🇬🇧 EN' : '🇮🇹 IT'}
    </button>
  );
}
