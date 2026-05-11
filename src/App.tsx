import { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ConsentScreen from './screens/ConsentScreen';
import HomeScreen from './screens/HomeScreen';
import GivenScreen from './screens/GivenScreen';
import UserScreen from './screens/UserScreen';
import HintScreen from './screens/HintScreen';
import SettingsScreen from './screens/SettingsScreen';
import LegalScreen from './screens/LegalScreen';
import { BoardState, Grid, GridSize } from './logic/types';
import './App.css';

type Screen = 'home' | 'given' | 'user' | 'hint' | 'settings' | 'privacy' | 'terms';
type AppPhase = 'splash' | 'onboarding' | 'consent' | 'app';

const STORAGE_KEY = 'sudokuhint_state';
const ONBOARDING_KEY = 'sudokuhint_onboarding_done';
const CONSENT_KEY = 'sudokuhint_consent_done';
const NOTIFICATION_ID = 1;

interface SavedState {
  screen: Screen;
  gridSize: GridSize;
  isDiagonal: boolean;
  givenBoard: BoardState | null;
  userBoard: BoardState | null;
  solution: Grid | null;
}

function loadState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (['settings', 'privacy', 'terms'].includes(parsed.screen)) {
        parsed.screen = 'home';
      }
      return { isDiagonal: false, ...parsed };
    }
  } catch {}
  return { screen: 'home', gridSize: 9, isDiagonal: false, givenBoard: null, userBoard: null, solution: null };
}

async function scheduleDailyNotification() {
  try {
    // Chiedi permesso
    const { display } = await LocalNotifications.requestPermissions();
    if (display !== 'granted') return;

    // Crea il canale Android con suono personalizzato
    await LocalNotifications.createChannel({
      id: 'sudoku_daily',
      name: 'Promemoria giornaliero',
      description: 'Notifica giornaliera di Sudoku Hint',
      importance: 4, // HIGH
      sound: 'notifica.mp3',
      vibration: true,
    });

    // Cancella eventuali notifiche precedenti
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });

    // Calcola il prossimo mezzogiorno
    const now = new Date();
    const noon = new Date();
    noon.setHours(12, 0, 0, 0);
    if (now >= noon) {
      noon.setDate(noon.getDate() + 1);
    }

    // Schedula notifica ripetuta ogni giorno a mezzogiorno
    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIFICATION_ID,
          title: '🧩 Sudoku Hint',
          body: 'È ora di allenare la mente! Risolvi un sudoku oggi 💡',
          iconColor: '#0D47D9',
          schedule: {
            at: noon,
            repeats: true,
            every: 'day',
          },
          channelId: 'sudoku_daily',
          sound: 'notifica.mp3',
          smallIcon: 'ic_stat_name',
          actionTypeId: '',
          extra: null,
        },
      ],
    });
  } catch (e) {
    console.error('Errore notifica:', e);
  }
}

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('splash');
  const [legalFrom, setLegalFrom] = useState<'consent' | 'settings'>('settings');

  const saved = loadState();
  const [screen, setScreen] = useState<Screen>(saved.screen);
  const [prevScreen, setPrevScreen] = useState<Screen>('home');
  const [gridSize, setGridSize] = useState<GridSize>(saved.gridSize ?? 9);
  const [isDiagonal, setIsDiagonal] = useState<boolean>(saved.isDiagonal ?? false);
  const [givenBoard, setGivenBoard] = useState<BoardState | null>(saved.givenBoard);
  const [userBoard, setUserBoard] = useState<BoardState | null>(saved.userBoard);
  const [solution, setSolution] = useState<Grid | null>(saved.solution);

  const hasActiveGame = givenBoard !== null;
  const currentGame = hasActiveGame ? { size: gridSize, isDiagonal } : null;

  // Schedula notifica quando l'app entra nella fase app
  useEffect(() => {
    if (phase === 'app') {
      scheduleDailyNotification();
    }
  }, [phase]);

  // Gestione tasto back Android
  useEffect(() => {
    const handler = CapApp.addListener('backButton', () => {
      if (phase === 'splash' || phase === 'onboarding') return;
      if (phase === 'consent') { CapApp.exitApp(); return; }

      switch (screen) {
        case 'home':     CapApp.exitApp(); break;
        case 'given':    setScreen('home'); break;
        case 'user':     setScreen('given'); break;
        case 'hint':     setScreen('user'); break;
        case 'settings': setScreen(prevScreen); break;
        case 'privacy':
        case 'terms':
          if (legalFrom === 'consent') { setLegalFrom('settings'); setPhase('consent'); }
          else setScreen('settings');
          break;
        default: setScreen('home');
      }
    });
    return () => { handler.then(h => h.remove()); };
  }, [phase, screen, prevScreen, legalFrom]);

  useEffect(() => {
    if (phase === 'app') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, gridSize, isDiagonal, givenBoard, userBoard, solution }));
    }
  }, [screen, gridSize, isDiagonal, givenBoard, userBoard, solution, phase]);

  const handleSplashFinish = () => {
    const onboardingDone = localStorage.getItem(ONBOARDING_KEY);
    const consentDone = localStorage.getItem(CONSENT_KEY);
    if (!onboardingDone) setPhase('onboarding');
    else if (!consentDone) setPhase('consent');
    else setPhase('app');
  };

  const handleOnboardingFinish = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    const consentDone = localStorage.getItem(CONSENT_KEY);
    if (!consentDone) setPhase('consent');
    else setPhase('app');
  };

  const handleConsentAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'true');
    setPhase('app');
  };

  const handleConsentLegal = (page: 'privacy' | 'terms') => {
    setLegalFrom('consent');
    setScreen(page);
    setPhase('app');
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setScreen('home');
    setGivenBoard(null);
    setUserBoard(null);
    setSolution(null);
  };

  const openSettings = (from: Screen) => {
    setPrevScreen(from);
    setScreen('settings');
  };

  const handleSelectSize = (size: GridSize, diagonal: boolean = false, forceReset: boolean = false) => {
    const variantChanged = size !== gridSize || diagonal !== isDiagonal;
    setGridSize(size);
    setIsDiagonal(diagonal);
    if (forceReset || variantChanged) {
      setGivenBoard(null);
      setUserBoard(null);
      setSolution(null);
    }
    setScreen('given');
  };

  if (phase === 'splash') return <SplashScreen onFinish={handleSplashFinish} />;
  if (phase === 'onboarding') return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  if (phase === 'consent') return (
    <ConsentScreen
      onAccept={handleConsentAccept}
      onOpenPrivacy={() => handleConsentLegal('privacy')}
      onOpenTerms={() => handleConsentLegal('terms')}
    />
  );

  return (
    <div className="app">
      {screen === 'home' && (
        <HomeScreen
          onSelectSize={handleSelectSize}
          onSettings={() => openSettings('home')}
          currentGame={currentGame}
        />
      )}
      {screen === 'given' && (
        <GivenScreen
          gridSize={gridSize}
          isDiagonal={isDiagonal}
          initialBoard={givenBoard ?? undefined}
          onConfirm={(board) => {
            const givenChanged = JSON.stringify(board) !== JSON.stringify(givenBoard);
            setGivenBoard(board);
            if (givenChanged) { setUserBoard(null); setSolution(null); }
            setScreen('user');
          }}
          onBack={() => setScreen('home')}
          onSettings={() => openSettings('given')}
        />
      )}
      {screen === 'user' && givenBoard && (
        <UserScreen
          gridSize={gridSize}
          isDiagonal={isDiagonal}
          givenBoard={givenBoard}
          initialBoard={userBoard ?? undefined}
          onCalculate={(board, sol) => {
            setUserBoard(board);
            setSolution(sol);
            setScreen('hint');
          }}
          onBack={() => setScreen('given')}
          onSettings={() => openSettings('user')}
        />
      )}
      {screen === 'hint' && userBoard && solution && (
        <HintScreen
          gridSize={gridSize}
          isDiagonal={isDiagonal}
          initialBoard={userBoard}
          solution={solution}
          onBack={() => setScreen('user')}
          onReset={handleReset}
          onBoardChange={(board) => setUserBoard(board)}
        />
      )}
      {screen === 'settings' && (
        <SettingsScreen
          onBack={() => setScreen(prevScreen)}
          onOpenPrivacy={() => { setPrevScreen('settings'); setScreen('privacy'); }}
          onOpenTerms={() => { setPrevScreen('settings'); setScreen('terms'); }}
        />
      )}
      {screen === 'privacy' && (
        <LegalScreen
          page="privacy"
          onBack={() => {
            if (legalFrom === 'consent') { setLegalFrom('settings'); setPhase('consent'); }
            else setScreen('settings');
          }}
        />
      )}
      {screen === 'terms' && (
        <LegalScreen
          page="terms"
          onBack={() => {
            if (legalFrom === 'consent') { setLegalFrom('settings'); setPhase('consent'); }
            else setScreen('settings');
          }}
        />
      )}
    </div>
  );
}
