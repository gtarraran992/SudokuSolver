import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import SudokuGrid from './SudokuGrid';
import HintPanel from './HintPanel';
import { BoardState, CellState, CellValue, Hint } from '../src/types';
import { getHint } from '../src/hintEngine';
import { RootStackParamList } from './GivenScreen';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'HintScreen'>;
  route: RouteProp<RootStackParamList, 'HintScreen'>;
};

export default function HintScreen({ navigation, route }: Props) {
  const { board: initialBoard, solution } = route.params;

  const [board, setBoard] = useState<BoardState>(initialBoard);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [currentHint, setCurrentHint] = useState<Hint | null>(null);
  const [hintLevel, setHintLevel] = useState<1 | 2 | 3>(1);
  const [hintCount, setHintCount] = useState(0);

  function currentGrid() {
    return board.map(row => row.map(cell => cell.value)) as any;
  }

  const handleCellPress = useCallback((row: number, col: number) => {
    if (board[row][col].type === 'given') return;
    setSelectedCell({ row, col });
    setCurrentHint(null);
  }, [board]);

  const handleNumberPress = useCallback((num: CellValue) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (board[row][col].type === 'given') return;
    setBoard(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })));
      next[row][col] = { value: num, type: 'user', isError: num !== solution[row][col] };
      return next;
    });
    setCurrentHint(null);
  }, [selectedCell, board, solution]);

  const handleErase = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (board[row][col].type === 'given') return;
    setBoard(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })));
      next[row][col] = { value: 0, type: 'empty', isError: false };
      return next;
    });
    setCurrentHint(null);
  }, [selectedCell, board]);

  const handleRequestHint = useCallback(() => {
    const hint = getHint(currentGrid(), solution, hintLevel);
    setCurrentHint(hint);
    setHintCount(c => c + 1);
    if (hint) setSelectedCell({ row: hint.targetRow, col: hint.targetCol });
  }, [board, solution, hintLevel]);

  const isSolved = board.flat().every(
    (cell: CellState, i: number) => cell.value === solution.flat()[i]
  );

  const filledCount = board.flat().filter((c: CellState) => c.value !== 0).length;
  const progress = Math.round((filledCount / 81) * 100);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Indietro</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Indizi</Text>
          <View style={styles.progressPill}>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
        </View>

        {isSolved && (
          <View style={styles.solvedBanner}>
            <Text style={styles.solvedText}>🎉 Puzzle completato! Ottimo lavoro!</Text>
          </View>
        )}

        <View style={styles.gridWrapper}>
          <SudokuGrid
            board={board}
            selectedCell={selectedCell}
            highlightRows={currentHint?.highlightRows}
            highlightCols={currentHint?.highlightCols}
            highlightBoxRow={currentHint?.highlightBoxRow}
            highlightBoxCol={currentHint?.highlightBoxCol}
            hintCell={currentHint ? { row: currentHint.targetRow, col: currentHint.targetCol } : undefined}
            onCellPress={handleCellPress}
          />
        </View>

        <View style={styles.numpad}>
          {([1, 2, 3, 4, 5, 6, 7, 8, 9] as CellValue[]).map(num => (
            <TouchableOpacity key={num} style={styles.numBtn} onPress={() => handleNumberPress(num)}>
              <Text style={styles.numBtnText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.eraseBtn} onPress={handleErase}>
          <Text style={styles.eraseBtnText}>⌫ Cancella</Text>
        </TouchableOpacity>

        <HintPanel
          hint={currentHint}
          currentLevel={hintLevel}
          onLevelChange={setHintLevel}
          onRequestHint={handleRequestHint}
          hintCount={hintCount}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAF9' },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backBtn: { marginRight: 12 },
  backText: { fontSize: 14, color: '#534AB7' },
  title: { flex: 1, fontSize: 20, fontWeight: '600', color: '#2C2C2A' },
  progressPill: { backgroundColor: '#E1F5EE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  progressText: { fontSize: 12, color: '#0F6E56', fontWeight: '600' },
  progressBar: { height: 4, backgroundColor: '#D3D1C7', borderRadius: 2, marginBottom: 16, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: '#1D9E75', borderRadius: 2 },
  solvedBanner: { backgroundColor: '#E1F5EE', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 12 },
  solvedText: { fontSize: 15, color: '#085041', fontWeight: '600' },
  gridWrapper: { alignItems: 'center', marginBottom: 16 },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 10 },
  numBtn: {
    width: 44, height: 44, borderRadius: 8,
    borderWidth: 0.5, borderColor: '#B4B2A9',
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
  },
  numBtnText: { fontSize: 18, fontWeight: '500', color: '#2C2C2A' },
  eraseBtn: {
    alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 8, borderWidth: 0.5, borderColor: '#B4B2A9',
    backgroundColor: '#FFFFFF', marginBottom: 16,
  },
  eraseBtnText: { fontSize: 14, color: '#5F5E5A' },
});
