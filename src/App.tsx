import { useState, useEffect } from 'react';
import GivenScreen from './screens/GivenScreen';
import UserScreen from './screens/UserScreen';
import HintScreen from './screens/HintScreen';
import SettingsScreen from './screens/SettingsScreen';
import LegalScreen from './screens/LegalScreen';
import { BoardState, Grid } from './logic/types';
import './App.css';

type Screen = 'given' | 'user' | 'hint' | 'settings' | 'privacy' | 'terms';

const STORAGE_KEY = 'sudokuhint_state';

interface SavedState {
  screen: Screen;
  givenBoard: BoardState | null;
  userBoard: BoardState | null;
  solution: Grid | null;
}

function loadState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Non ripristinare settings/privacy/terms al refresh
      if (['settings', 'privacy', 'terms'].includes(parsed.screen)) {
        parsed.screen = 'given';
      }
      return parsed;
    }
  } catch {}
  return { screen: 'given', givenBoard: null, userBoard: null, solution: null };
}

export default function App() {
  const saved = loadState();
  const [screen, setScreen] = useState<Screen>(saved.screen);
  const [prevScreen, setPrevScreen] = useState<Screen>('given');
  const [givenBoard, setGivenBoard] = useState<BoardState | null>(saved.givenBoard);
  const [userBoard, setUserBoard] = useState<BoardState | null>(saved.userBoard);
  const [solution, setSolution] = useState<Grid | null>(saved.solution);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, givenBoard, userBoard, solution }));
  }, [screen, givenBoard, userBoard, solution]);

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setScreen('given');
    setGivenBoard(null);
    setUserBoard(null);
    setSolution(null);
  };

  const openSettings = (from: Screen) => {
    setPrevScreen(from);
    setScreen('settings');
  };

  return (
    <div className="app">
      {screen === 'given' && (
        <GivenScreen
          initialBoard={givenBoard ?? undefined}
          onConfirm={(board) => {
            const givenChanged = JSON.stringify(board) !== JSON.stringify(givenBoard);
            setGivenBoard(board);
            if (givenChanged) {
              setUserBoard(null);
              setSolution(null);
            }
            setScreen('user');
          }}
          onSettings={() => openSettings('given')}
        />
      )}
      {screen === 'user' && givenBoard && (
        <UserScreen
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
          initialBoard={userBoard}
          solution={solution}
          onBack={() => setScreen('user')}
          onReset={handleReset}
          onBoardChange={(board) => setUserBoard(board)}
          onSettings={() => openSettings('hint')}
        />
      )}
      {screen === 'settings' && (
        <SettingsScreen
          onBack={() => setScreen(prevScreen)}
          onOpenPrivacy={() => setScreen('privacy')}
          onOpenTerms={() => setScreen('terms')}
        />
      )}
      {screen === 'privacy' && (
        <LegalScreen
          page="privacy"
          onBack={() => setScreen('settings')}
        />
      )}
      {screen === 'terms' && (
        <LegalScreen
          page="terms"
          onBack={() => setScreen('settings')}
        />
      )}
    </div>
  );
}