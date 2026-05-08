import { useState, useEffect } from 'react';
import GivenScreen from './screens/GivenScreen';
import UserScreen from './screens/UserScreen';
import HintScreen from './screens/HintScreen';
import { BoardState, Grid } from './logic/types';
import './App.css';

type Screen = 'given' | 'user' | 'hint';

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
    if (raw) return JSON.parse(raw);
  } catch {}
  return { screen: 'given', givenBoard: null, userBoard: null, solution: null };
}

export default function App() {
  const saved = loadState();
  const [screen, setScreen] = useState<Screen>(saved.screen);
  const [givenBoard, setGivenBoard] = useState<BoardState | null>(saved.givenBoard);
  const [userBoard, setUserBoard] = useState<BoardState | null>(saved.userBoard);
  const [solution, setSolution] = useState<Grid | null>(saved.solution);

  // Salva ogni volta che cambia qualcosa
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

  return (
    <div className="app">
      {screen === 'given' && (
        <GivenScreen
          initialBoard={givenBoard ?? undefined}
          onConfirm={(board) => {
           setGivenBoard(board);
           setUserBoard(null);
           setSolution(null);
           setScreen('user');
          }}
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
        />
      )}
      {screen === 'hint' && userBoard && solution && (
        <HintScreen
          initialBoard={userBoard}
          solution={solution}
          onBack={() => setScreen('user')}
          onReset={handleReset}
          onBoardChange={(board) => setUserBoard(board)}
        />
      )}
    </div>
  );
}