import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import SudokuGrid from './SudokuGrid';
import { BoardState, CellState, CellValue } from '../src/types';
import { validateGrid } from '../src/validator';
import { solve } from '../src/solver';
import { RootStackParamList } from './GivenScreen';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UserScreen'>;
  route: RouteProp<RootStackParamList, 'UserScreen'>;
};

export default function UserScreen({ navigation, route }: Props) {
  const { givenBoard } = route.params;

  // Partiamo dalla board con i fissi — aggiungeremo i blu sopra
  const [board, setBoard] = useState<BoardState>(
    givenBoard.map(row => row.map(cell => ({ ...cell })))
  );
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  const handleCellPress = useCallback((row: number, col: number) => {
    // Non selezionare celle fisse
    if (board[row][col].type === 'given') return;
    setSelectedCell({ row, col });
  }, [board]);

  const handleNumberPress = useCallback((num: CellValue) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (board[row][col].type === 'given') return;
    setBoard(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })));
      next[row][col] = { value: num, type: 'user', isError: false };
      return next;
    });
  }, [selectedCell, board]);

  const handleErase = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (board[row][col].type === 'given') return;
    setBoard(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })));
      next[row][col] = { value: 0, type: 'empty', isError: false };
      return next;
    });
  }, [selectedCell, board]);

  const handleCalculate = useCallback(() => {
    const grid = board.map(row => row.map(cell => cell.value)) as any;
    const validation = validateGrid(grid);

    if (!validation.valid) {
      setBoard(prev => {
        const next = prev.map(r => r.map(c => ({ ...c, isError: false })));
        validation.errors.forEach(e => { next[e.row][e.col].isError = true; });
        return next;
      });
      Alert.alert('Conflitto trovato', 'Uno dei numeri inseriti crea un conflitto. Controlla le celle rosse.');
      return;
    }

    const solution = solve(grid);
    if (!solution) {
      Alert.alert(
        'Nessuna soluzione',
        'La combinazione inserita non ha soluzione. Potrebbe esserci un errore nei numeri fissi.',
        [
          { text: 'Correggi i fissi', onPress: () => navigation.goBack() },
          { text: 'Annulla', style: 'cancel' },
        ]
      );
      return;
    }

    navigation.navigate('HintScreen', { board, solution });
  }, [board, navigation]);

  const userCount = board.flat().filter((c: CellState) => c.type === 'user').length;
  const canCalculate = userCount >= 1;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <Text style={styles.title}>Sudoku Hint</Text>
          <Text style={styles.subtitle}>Passo 2 di 2</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inserisci i numeri che hai già risolto</Text>
          <Text style={styles.cardDesc}>
            Aggiungi in blu i numeri che sei già riuscito a trovare da solo. Poi premi "Calcola soluzione" per iniziare a ricevere indizi.
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

        <Text style={styles.counter}>
          {userCount === 0 ? 'Inserisci almeno un numero per procedere' : `${userCount} numeri aggiunti`}
        </Text>

        <TouchableOpacity
          style={[styles.calcBtn, !canCalculate && styles.calcBtnDisabled]}
          onPress={handleCalculate}
          disabled={!canCalculate}
        >
          <Text style={styles.calcBtnText}>Calcola soluzione →</Text>
        </TouchableOpacity>

<TouchableOpacity 
  style={[styles.errorBtn, { marginTop: 16 }]} 
  onPress={() => navigation.goBack()}
>
  <Text style={styles.errorBtnText}>⚠️ C'è un errore nei numeri fissi</Text>
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
    backgroundColor: '#E6F1FB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#0C447C', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#1A5A96', lineHeight: 19 },
errorBtn: {
    borderWidth: 0.5, borderColor: '#E8A317',
    backgroundColor: '#FAEEDA', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14,
    alignItems: 'center', marginBottom: 12, marginTop: 12,
  },
  errorBtnText: { fontSize: 13, color: '#633806', fontWeight: '500' },
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
  numBtnText: { fontSize: 18, fontWeight: '500', color: '#185FA5' },
  eraseBtn: {
    alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 8, borderWidth: 0.5, borderColor: '#B4B2A9',
    backgroundColor: '#FFFFFF', marginBottom: 14,
  },
  eraseBtnText: { fontSize: 14, color: '#5F5E5A' },
  counter: { textAlign: 'center', fontSize: 13, color: '#888780', marginBottom: 16 },
  calcBtn: {
    backgroundColor: '#3C3489', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
  },
  calcBtnDisabled: { backgroundColor: '#AFA9EC' },
  calcBtnText: { color: '#EEEDFE', fontSize: 16, fontWeight: '600' },
});
