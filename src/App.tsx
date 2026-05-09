import { useState, useEffect } from 'react';
import HomeScreen from './screens/HomeScreen';
import GivenScreen from './screens/GivenScreen';
import UserScreen from './screens/UserScreen';
import HintScreen from './screens/HintScreen';
import SettingsScreen from './screens/SettingsScreen';
import LegalScreen from './screens/LegalScreen';
import { BoardState, Grid, GridSize } from './logic/types';
import './App.css';

type Screen = 'home' | 'given' | 'user' | 'hint' | 'settings' | 'privacy' | 'terms';

const STORAGE_KEY = 'sudokuhint_state';

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

export default function App() {
  const saved = loadState();
  const [screen, setScreen] = useState<Screen>(saved.screen);
  const [prevScreen, setPrevScreen] = useState<Screen>('home');
  const [gridSize, setGridSize] = useState<GridSize>(saved.gridSize ?? 9);
  const [isDiagonal, setIsDiagonal] = useState<boolean>(saved.isDiagonal ?? false);
  const [givenBoard, setGivenBoard] = useState<BoardState | null>(saved.givenBoard);
  const [userBoard, setUserBoard] = useState<BoardState | null>(saved.userBoard);
  const [solution, setSolution] = useState<Grid | null>(saved.solution);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, gridSize, isDiagonal, givenBoard, userBoard, solution }));
  }, [screen, gridSize, isDiagonal, givenBoard, userBoard, solution]);

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

  const handleSelectSize = (size: GridSize, diagonal: boolean = false) => {
    setGridSize(size);
    setIsDiagonal(diagonal);
    setGivenBoard(null);
    setUserBoard(null);
    setSolution(null);
    setScreen('given');
  };

  return (
    <div className="app">
      {screen === 'home' && (
        <HomeScreen
          onSelectSize={handleSelectSize}
          onSettings={() => openSettings('home')}
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
            if (givenChanged) {
              setUserBoard(null);
              setSolution(null);
            }
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
