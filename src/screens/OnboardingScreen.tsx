import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './OnboardingScreen.css';

interface Props {
  onFinish: () => void;
}

const slides = [
  {
    titleKey: 'onboarding.slide1Title',
    descKey: 'onboarding.slide1Desc',
    illustration: (
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="onb-illustration">
        {/* Griglia sudoku stilizzata */}
        <rect x="20" y="20" width="160" height="160" rx="12" fill="white" opacity="0.15"/>
        {/* Linee box */}
        <line x1="20" y1="73" x2="180" y2="73" stroke="white" strokeWidth="2.5" opacity="0.6"/>
        <line x1="20" y1="127" x2="180" y2="127" stroke="white" strokeWidth="2.5" opacity="0.6"/>
        <line x1="73" y1="20" x2="73" y2="180" stroke="white" strokeWidth="2.5" opacity="0.6"/>
        <line x1="127" y1="20" x2="127" y2="180" stroke="white" strokeWidth="2.5" opacity="0.6"/>
        {/* Celle interne */}
        <line x1="20" y1="44" x2="180" y2="44" stroke="white" strokeWidth="0.8" opacity="0.3"/>
        <line x1="20" y1="97" x2="180" y2="97" stroke="white" strokeWidth="0.8" opacity="0.3"/>
        <line x1="20" y1="150" x2="180" y2="150" stroke="white" strokeWidth="0.8" opacity="0.3"/>
        <line x1="44" y1="20" x2="44" y2="180" stroke="white" strokeWidth="0.8" opacity="0.3"/>
        <line x1="97" y1="20" x2="97" y2="180" stroke="white" strokeWidth="0.8" opacity="0.3"/>
        <line x1="150" y1="20" x2="150" y2="180" stroke="white" strokeWidth="0.8" opacity="0.3"/>
        {/* Numeri */}
        <text x="32" y="42" fill="white" fontSize="14" fontWeight="700" opacity="0.9">5</text>
        <text x="79" y="42" fill="white" fontSize="14" fontWeight="700" opacity="0.9">3</text>
        <text x="133" y="42" fill="white" fontSize="14" fontWeight="700" opacity="0.9">9</text>
        <text x="32" y="96" fill="white" fontSize="14" fontWeight="700" opacity="0.9">6</text>
        <text x="155" y="96" fill="white" fontSize="14" fontWeight="700" opacity="0.9">1</text>
        <text x="32" y="150" fill="white" fontSize="14" fontWeight="700" opacity="0.9">8</text>
        <text x="79" y="150" fill="white" fontSize="14" fontWeight="700" opacity="0.9">7</text>
        {/* Cella evidenziata con ? */}
        <rect x="85" y="75" width="42" height="42" rx="4" fill="rgba(255,255,255,0.25)"/>
        <text x="100" y="103" fill="white" fontSize="20" fontWeight="700">?</text>
        {/* Lampadina */}
        <circle cx="155" cy="155" r="18" fill="#F5A623"/>
        <text x="147" y="162" fill="white" fontSize="18">💡</text>
      </svg>
    ),
  },
  {
    titleKey: 'onboarding.slide2Title',
    descKey: 'onboarding.slide2Desc',
    illustration: (
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="onb-illustration">
        {/* 3 livelli di indizio */}
        {/* Livello 1 */}
        <rect x="20" y="30" width="160" height="40" rx="10" fill="rgba(255,255,255,0.15)"/>
        <circle cx="45" cy="50" r="12" fill="#1D9E75"/>
        <text x="40" y="55" fill="white" fontSize="13" fontWeight="700">1</text>
        <rect x="65" y="43" width="80" height="8" rx="4" fill="rgba(255,255,255,0.5)"/>
        <rect x="65" y="55" width="55" height="6" rx="3" fill="rgba(255,255,255,0.3)"/>
        {/* Freccia */}
        <text x="92" y="85" fill="rgba(255,255,255,0.5)" fontSize="12">▼</text>
        {/* Livello 2 */}
        <rect x="20" y="90" width="160" height="40" rx="10" fill="rgba(255,255,255,0.15)"/>
        <circle cx="45" cy="110" r="12" fill="#BA7517"/>
        <text x="40" y="115" fill="white" fontSize="13" fontWeight="700">2</text>
        <rect x="65" y="103" width="90" height="8" rx="4" fill="rgba(255,255,255,0.5)"/>
        <rect x="65" y="115" width="65" height="6" rx="3" fill="rgba(255,255,255,0.3)"/>
        {/* Freccia */}
        <text x="92" y="145" fill="rgba(255,255,255,0.5)" fontSize="12">▼</text>
        {/* Livello 3 */}
        <rect x="20" y="150" width="160" height="40" rx="10" fill="rgba(255,255,255,0.15)"/>
        <circle cx="45" cy="170" r="12" fill="#D85A30"/>
        <text x="40" y="175" fill="white" fontSize="13" fontWeight="700">3</text>
        <rect x="65" y="163" width="70" height="8" rx="4" fill="rgba(255,255,255,0.5)"/>
        <rect x="65" y="175" width="85" height="6" rx="3" fill="rgba(255,255,255,0.3)"/>
      </svg>
    ),
  },
  {
    titleKey: 'onboarding.slide3Title',
    descKey: 'onboarding.slide3Desc',
    illustration: (
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="onb-illustration">
        {/* Varianti */}
        <rect x="20" y="20" width="72" height="72" rx="12" fill="rgba(255,255,255,0.15)"/>
        <text x="34" y="52" fill="white" fontSize="11" fontWeight="600" opacity="0.7">4×4</text>
        <circle cx="56" cy="68" r="6" fill="#1D9E75"/>

        <rect x="108" y="20" width="72" height="72" rx="12" fill="rgba(255,255,255,0.15)"/>
        <text x="122" y="52" fill="white" fontSize="11" fontWeight="600" opacity="0.7">6×6</text>
        <circle cx="144" cy="68" r="6" fill="#BA7517"/>

        <rect x="20" y="108" width="72" height="72" rx="12" fill="rgba(255,255,255,0.15)"/>
        <text x="30" y="140" fill="white" fontSize="11" fontWeight="600" opacity="0.7">9×9</text>
        <circle cx="56" cy="156" r="6" fill="#D85A30"/>

        <rect x="108" y="108" width="72" height="72" rx="12" fill="rgba(255,255,255,0.2)"/>
        <text x="115" y="137" fill="white" fontSize="10" fontWeight="600" opacity="0.7">9×9</text>
        <text x="112" y="152" fill="white" fontSize="9" opacity="0.6">Diag.</text>
        <circle cx="144" cy="164" r="6" fill="#6B35A8"/>

        {/* Stella centrale */}
        <text x="86" y="110" fill="rgba(255,255,255,0.6)" fontSize="22">✦</text>
      </svg>
    ),
  },
];

export default function OnboardingScreen({ onFinish }: Props) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goNext = () => {
    if (animating) return;
    if (current < slides.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setCurrent(c => c + 1);
        setAnimating(false);
      }, 200);
    } else {
      onFinish();
    }
  };

  const isLast = current === slides.length - 1;

  return (
    <div className="onboarding-screen">
      <button className="onb-skip" onClick={onFinish}>{t('onboarding.skip')}</button>

      <div className={`onb-slide ${animating ? 'onb-slide-exit' : 'onb-slide-enter'}`}>
        <div className="onb-illustration-wrapper">
          {slides[current].illustration}
        </div>
        <div className="onb-text">
          <h2>{t(slides[current].titleKey)}</h2>
          <p>{t(slides[current].descKey)}</p>
        </div>
      </div>

      <div className="onb-footer">
        <div className="onb-dots">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`onb-dot ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>

        <button className="btn-primary onb-btn" onClick={goNext}>
          {isLast ? t('onboarding.start') : t('onboarding.next')}
        </button>
      </div>
    </div>
  );
}
