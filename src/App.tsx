import { useState } from 'react';
import GivenScreen from './screens/GivenScreen';
import UserScreen from './screens/UserScreen';
import HintScreen from './screens/HintScreen';
import { BoardState, Grid } from './logic/types';
import './App.css';

type Screen = 'given' | 'user' | 'hint';

export default function App() {
  const [screen, setScreen] = useState<Screen>('given');
  const [givenBoard, setGivenBoard] = useState<BoardState | null>(null);
  const [userBoard, setUserBoard] = useState<BoardState | null>(null);
  const [solution, setSolution] = useState<Grid | null>(null);

  return (
    <div className="app">
      {screen === 'given' && (
        <GivenScreen
          onConfirm={(board) => {
            setGivenBoard(board);
            setScreen('user');
          }}
        />
      )}
      {screen === 'user' && givenBoard && (
        <UserScreen
          givenBoard={givenBoard}
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
        />
      )}
    </div>
  );
}
