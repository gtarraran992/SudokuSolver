import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SudokuGrid from './SudokuGrid';
import { BoardState, CellState, CellValue, Grid } from '../src/types';
import { validateGrid } from '../src/validator';

export type RootStackParamList = {
  GivenScreen: undefined;
  UserScreen: { givenBoard: BoardState };
  HintScreen: { board: BoardState; solution: Grid };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GivenScreen'>;
};

function emptyBoard(): BoardState {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, (): CellState => ({
      value: 0, type: 'empty', isError: false,
    }))
  );
}

function boardToGrid(board: BoardState): Grid {
  return board.map(row => row.map(cell => cell.value)) as Grid;
}

export default function GivenScreen({ navigation }: Props) {
  const [board, setBoard] = useState<BoardState>(emptyBoard());
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  const handleCellPress = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  const handleNumberPress = useCallback((num: CellValue) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    setBoard(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })));
      next[row][col] = { value: num, type: 'given', isError: false };
      return next;
    });
  }, [selectedCell]);

  const handleErase = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    setBoard(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })));
      next[row][col] = { value: 0, type: 'empty', isError: false };
      return next;
    });
  }, [selectedCell]);

  const handleConfirm = useCallback(() => {
    const grid = boardToGrid(board);
    const validation = validateGrid(grid);

    if (!validation.valid) {
      setBoard(prev => {
        const next = prev.map(r => r.map(c => ({ ...c, isError: false })));
        validation.errors.forEach(e => { next[e.row][e.col].isError = true; });
        return next;
      });
      Alert.alert(
        'Griglia non valida',
        `Ci sono ${validation.errors.length} conflitti. Controlla le celle evidenziate in rosso.`
      );
      return;
    }

    navigation.navigate('UserScreen', { givenBoard: board });
  }, [board, navigation]);

  const handleReset = useCallback(() => {
    Alert.alert('Ricomincia', 'Vuoi cancellare tutti i numeri inseriti?', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Sì, cancella', style: 'destructive', onPress: () => { setBoard(emptyBoard()); setSelectedCell(null); } },
    ]);
  }, []);

  const filledCount = board.flat().filter(c => c.value !== 0).length;
  const canConfirm = filledCount >= 17;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <Text style={styles.title}>Sudoku Hint</Text>
          <Text style={styles.subtitle}>Passo 1 di 2</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inserisci i numeri fissi</Text>
          <Text style={styles.cardDesc}>
            Inserisci tutti i numeri già presenti nella griglia del sudoku. Una volta confermati non potranno essere modificati.
          </Text>
        </View>

        <View style={styles.gridWrapper}>
          <SudokuGrid
            board={board}
            selectedCell={selectedCell}
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

        <Text style={styles.counter}>{filledCount} numeri inseriti {filledCount < 17 ? `(minimo 17)` : '✓'}</Text>

        <TouchableOpacity
          style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!canConfirm}
        >
          <Text style={styles.confirmBtnText}>Conferma numeri fissi →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>Ricomincia</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAF9' },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: '#2C2C2A' },
  subtitle: { fontSize: 13, color: '#888780', marginTop: 2 },
  card: {
    backgroundColor: '#F1EFE8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#2C2C2A', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#5F5E5A', lineHeight: 19 },
  gridWrapper: { alignItems: 'center', marginBottom: 16 },
  numpad: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 8, marginBottom: 12,
  },
  numBtn: {
    width: 44, height: 44, borderRadius: 8,
    borderWidth: 0.5, borderColor: '#B4B2A9',
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
  },
  numBtnText: { fontSize: 18, fontWeight: '500', color: '#2C2C2A' },
  eraseBtn: {
    alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 8, borderWidth: 0.5, borderColor: '#B4B2A9',
    backgroundColor: '#FFFFFF', marginBottom: 14,
  },
  eraseBtnText: { fontSize: 14, color: '#5F5E5A' },
  counter: { textAlign: 'center', fontSize: 13, color: '#888780', marginBottom: 16 },
  confirmBtn: {
    backgroundColor: '#3C3489', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', marginBottom: 10,
  },
  confirmBtnDisabled: { backgroundColor: '#AFA9EC' },
  confirmBtnText: { color: '#EEEDFE', fontSize: 16, fontWeight: '600' },
  resetBtn: { alignItems: 'center', paddingVertical: 8 },
  resetBtnText: { color: '#888780', fontSize: 13 },
});
