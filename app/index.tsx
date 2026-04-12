import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SudokuGrid from '../components/SudokuGrid';
import { BoardState, CellState, CellValue, Grid } from '../src/types';
import { validateGrid } from '../src/validator';
import { solve } from '../src/solver';

// Crea una board vuota 9×9
function emptyBoard(): BoardState {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, (): CellState => ({
      value: 0,
      type: 'empty',
      isError: false,
    }))
  );
}

// Converte BoardState → Grid (solo i valori numerici)
function boardToGrid(board: BoardState): Grid {
  return board.map(row => row.map(cell => cell.value)) as Grid;
}

type InputMode = 'given' | 'user';

export default function HomeScreen() {
  const router = useRouter();
  const [board, setBoard] = useState<BoardState>(emptyBoard());
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('given');
  const [isReady, setIsReady] = useState(false); // true dopo "Calcola soluzione"

  const handleCellPress = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  const handleNumberPress = useCallback((num: CellValue) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    setBoard(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })));
      const cell = next[row][col];

      // In modalità "dati": imposta come fisso
      // In modalità "risolti": imposta come inserito dall'utente
      // Se il puzzle è già pronto, blocca i dati fissi
      if (isReady && cell.type === 'given') return prev;

      cell.value = num;
      cell.type = inputMode === 'given' ? 'given' : 'user';
      cell.isError = false;
      return next;
    });
  }, [selectedCell, inputMode, isReady]);

  const handleErase = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    setBoard(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })));
      const cell = next[row][col];
      if (isReady && cell.type === 'given') return prev; // non cancellare i fissi
      cell.value = 0;
      cell.type = 'empty';
      cell.isError = false;
      return next;
    });
  }, [selectedCell, isReady]);

  const handleCalculate = useCallback(() => {
    const grid = boardToGrid(board);
    const validation = validateGrid(grid);

    if (!validation.valid) {
      // Marca le celle in errore
      setBoard(prev => {
        const next = prev.map(r => r.map(c => ({ ...c, isError: false })));
        validation.errors.forEach(e => {
          next[e.row][e.col].isError = true;
        });
        return next;
      });
      Alert.alert(
        'Griglia non valida',
        `Sono stati trovati ${validation.errors.length} conflict${validation.errors.length > 1 ? 'i' : 'o'}. Controlla le celle evidenziate in rosso.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const solution = solve(grid);
    if (!solution) {
      Alert.alert(
        'Nessuna soluzione',
        'Questa combinazione di numeri non ha soluzione. Verifica di aver inserito la griglia correttamente.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Tutto ok: passa alla schermata indizi
    router.push({
      pathname: '/hint',
      params: {
        boardJson: JSON.stringify(board),
        solutionJson: JSON.stringify(solution),
      },
    });
  }, [board, router]);

  const handleReset = useCallback(() => {
    Alert.alert('Ricomincia', 'Vuoi cancellare tutta la griglia?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Sì, cancella',
        style: 'destructive',
        onPress: () => {
          setBoard(emptyBoard());
          setSelectedCell(null);
          setIsReady(false);
        },
      },
    ]);
  }, []);

  const filledCount = board.flat().filter(c => c.value !== 0).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sudoku Hint</Text>
          <Text style={styles.subtitle}>Inserisci la griglia per iniziare</Text>
        </View>

        {/* Modalità inserimento */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, inputMode === 'given' && styles.modeBtnActive]}
            onPress={() => setInputMode('given')}
          >
            <Text style={[styles.modeBtnText, inputMode === 'given' && styles.modeBtnTextActive]}>
              Numeri dati
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, inputMode === 'user' && styles.modeBtnActiveUser]}
            onPress={() => setInputMode('user')}
          >
            <Text style={[styles.modeBtnText, inputMode === 'user' && styles.modeBtnTextActiveUser]}>
              Già risolti
            </Text>
          </TouchableOpacity>
        </View>

        {/* Griglia */}
        <View style={styles.gridWrapper}>
          <SudokuGrid
            board={board}
            selectedCell={selectedCell}
            onCellPress={handleCellPress}
          />
        </View>

        {/* Numpad */}
        <View style={styles.numpad}>
          {([1, 2, 3, 4, 5, 6, 7, 8, 9] as CellValue[]).map(num => (
            <TouchableOpacity
              key={num}
              style={styles.numBtn}
              onPress={() => handleNumberPress(num)}
            >
              <Text style={styles.numBtnText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cancella */}
        <TouchableOpacity style={styles.eraseBtn} onPress={handleErase}>
          <Text style={styles.eraseBtnText}>⌫ Cancella</Text>
        </TouchableOpacity>

        {/* Contatore */}
        <Text style={styles.counter}>{filledCount} / 81 celle inserite</Text>

        {/* CTA principale */}
        <TouchableOpacity
          style={[styles.calcBtn, filledCount < 17 && styles.calcBtnDisabled]}
          onPress={handleCalculate}
          disabled={filledCount < 17}
        >
          <Text style={styles.calcBtnText}>Calcola soluzione →</Text>
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
  header: { marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: '#2C2C2A' },
  subtitle: { fontSize: 14, color: '#888780', marginTop: 4 },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#B4B2A9',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  modeBtnActive: {
    backgroundColor: '#F1EFE8',
    borderColor: '#5F5E5A',
  },
  modeBtnActiveUser: {
    backgroundColor: '#E6F1FB',
    borderColor: '#185FA5',
  },
  modeBtnText: { fontSize: 13, color: '#888780', fontWeight: '500' },
  modeBtnTextActive: { color: '#2C2C2A' },
  modeBtnTextActiveUser: { color: '#0C447C' },
  gridWrapper: { alignItems: 'center', marginBottom: 16 },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  numBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#B4B2A9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBtnText: { fontSize: 18, fontWeight: '500', color: '#2C2C2A' },
  eraseBtn: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#B4B2A9',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  eraseBtnText: { fontSize: 14, color: '#5F5E5A' },
  counter: { textAlign: 'center', fontSize: 13, color: '#888780', marginBottom: 16 },
  calcBtn: {
    backgroundColor: '#3C3489',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  calcBtnDisabled: { backgroundColor: '#AFA9EC' },
  calcBtnText: { color: '#EEEDFE', fontSize: 16, fontWeight: '600' },
  resetBtn: { alignItems: 'center', paddingVertical: 8 },
  resetBtnText: { color: '#888780', fontSize: 13 },
});
