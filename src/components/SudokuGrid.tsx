import { BoardState } from '../logic/types';
import './SudokuGrid.css';

interface Props {
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
  board, selectedCell, highlightRows = [], highlightCols = [],
  highlightBoxRow, highlightBoxCol, hintCell, onCellPress,
}: Props) {

  function getCellClass(r: number, c: number): string {
    const cell = board[r][c];
    const isSelected = selectedCell?.row === r && selectedCell?.col === c;
    const isHint = hintCell?.row === r && hintCell?.col === c;
    const isHighlighted =
      highlightRows.includes(r) || highlightCols.includes(c) ||
      (highlightBoxRow !== undefined && highlightBoxCol !== undefined &&
        Math.floor(r / 3) === highlightBoxRow && Math.floor(c / 3) === highlightBoxCol);
    const isSameGroup = selectedCell && (
      selectedCell.row === r || selectedCell.col === c ||
      (Math.floor(selectedCell.row / 3) === Math.floor(r / 3) && Math.floor(selectedCell.col / 3) === Math.floor(c / 3))
    );

    const borderRight = (c === 2 || c === 5) ? 'border-box-right' : '';
    const borderBottom = (r === 2 || r === 5) ? 'border-box-bottom' : '';

    let state = '';
    if (cell.isError) state = 'cell-error';
    else if (isHint) state = 'cell-hint';
    else if (isSelected) state = 'cell-selected';
    else if (isHighlighted) state = 'cell-highlighted';
    else if (isSameGroup) state = 'cell-same-group';

    return `cell ${borderRight} ${borderBottom} ${state}`.trim();
  }

  function getTextClass(r: number, c: number): string {
    const cell = board[r][c];
    if (cell.isError) return 'text-error';
    if (cell.type === 'given') return 'text-given';
    if (cell.type === 'user') return 'text-user';
    return '';
  }

  return (
    <div className="sudoku-grid">
      {board.map((row, r) => (
        <div key={r} className="grid-row">
          {row.map((cell, c) => (
            <div key={c} className={getCellClass(r, c)} onClick={() => onCellPress(r, c)}>
              {cell.value !== 0 && (
                <span className={getTextClass(r, c)}>{cell.value}</span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
