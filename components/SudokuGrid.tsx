import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BoardState } from '../src/types';

interface SudokuGridProps {
  board: BoardState;
  selectedCell: { row: number; col: number } | null;
  highlightRows?: number[];
  highlightCols?: number[];
  highlightBoxRow?: number;
  highlightBoxCol?: number;
  hintCell?: { row: number; col: number };
  onCellPress: (row: number, col: number) => void;
}

export default function SudokuGrid({
  board,
  selectedCell,
  highlightRows = [],
  highlightCols = [],
  highlightBoxRow,
  highlightBoxCol,
  hintCell,
  onCellPress,
}: SudokuGridProps) {

  function getCellStyle(r: number, c: number) {
    const isSelected = selectedCell?.row === r && selectedCell?.col === c;
    const isHint = hintCell?.row === r && hintCell?.col === c;
    const isHighlightedRow = highlightRows.includes(r);
    const isHighlightedCol = highlightCols.includes(c);
    const isHighlightedBox =
      highlightBoxRow !== undefined &&
      highlightBoxCol !== undefined &&
      Math.floor(r / 3) === highlightBoxRow &&
      Math.floor(c / 3) === highlightBoxCol;
    const isSameGroup =
      selectedCell &&
      (selectedCell.row === r ||
        selectedCell.col === c ||
        (Math.floor(selectedCell.row / 3) === Math.floor(r / 3) &&
          Math.floor(selectedCell.col / 3) === Math.floor(c / 3)));

    const cell = board[r][c];

    return [
      styles.cell,
      // Bordi box 3×3
      c % 3 === 0 && c !== 0 && styles.borderLeft,
      r % 3 === 0 && r !== 0 && styles.borderTop,
      // Stati
      isHint && styles.cellHint,
      isSelected && styles.cellSelected,
      !isSelected && !isHint && (isHighlightedRow || isHighlightedCol || isHighlightedBox) && styles.cellHighlightTechnique,
      !isSelected && !isHint && isSameGroup && styles.cellSameGroup,
      cell.isError && styles.cellError,
    ];
  }

  function getTextStyle(r: number, c: number) {
    const cell = board[r][c];
    if (cell.isError) return [styles.cellText, styles.textError];
    if (cell.type === 'given') return [styles.cellText, styles.textGiven];
    if (cell.type === 'user') return [styles.cellText, styles.textUser];
    return styles.cellText;
  }

  return (
    <View style={styles.grid}>
      {board.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((cell, c) => (
            <TouchableOpacity
              key={c}
              style={getCellStyle(r, c)}
              onPress={() => onCellPress(r, c)}
              activeOpacity={0.7}
            >
              {cell.value !== 0 && (
                <Text style={getTextStyle(r, c)}>
                  {cell.value}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const CELL_SIZE = 36;

const styles = StyleSheet.create({
  grid: {
    borderWidth: 2,
    borderColor: '#444441',
    borderRadius: 6,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.5,
    borderColor: '#B4B2A9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  borderLeft: {
    borderLeftWidth: 2,
    borderLeftColor: '#444441',
  },
  borderTop: {
    borderTopWidth: 2,
    borderTopColor: '#444441',
  },
  // Stati cella
  cellSelected: {
    backgroundColor: '#EEEDFE',
  },
  cellSameGroup: {
    backgroundColor: '#F1EFE8',
  },
  cellHighlightTechnique: {
    backgroundColor: '#E1F5EE',
  },
  cellHint: {
    backgroundColor: '#FAEEDA',
  },
  cellError: {
    backgroundColor: '#FCEBEB',
  },
  // Testo
  cellText: {
    fontSize: 16,
    color: '#888780',
  },
  textGiven: {
    color: '#2C2C2A',
    fontWeight: '600',
  },
  textUser: {
    color: '#185FA5',
    fontWeight: '500',
  },
  textError: {
    color: '#A32D2D',
  },
});
