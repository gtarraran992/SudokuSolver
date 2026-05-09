import { BoardState, GridSize } from '../logic/types';
import { getBoxDimensions } from '../logic/validator';
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
  gridSize: GridSize;
}

export default function SudokuGrid({
  board, selectedCell, highlightRows = [], highlightCols = [],
  highlightBoxRow, highlightBoxCol, hintCell, onCellPress, gridSize,
}: Props) {

  const { boxRows, boxCols } = getBoxDimensions(gridSize);

  // Calcola cellSize in base alla viewport
  const maxGridWidth = Math.min(window.innerWidth - 32, 480); // 32px di padding laterale
  const cellSize = Math.floor(maxGridWidth / gridSize);
  const fontSize = cellSize < 30 ? cellSize * 0.45 : cellSize * 0.5;

  function getCellClass(r: number, c: number): string {
    const cell = board[r][c];
    const isSelected = selectedCell?.row === r && selectedCell?.col === c;
    const isHint = hintCell?.row === r && hintCell?.col === c;
    const isHighlighted =
      highlightRows.includes(r) || highlightCols.includes(c) ||
      (highlightBoxRow !== undefined && highlightBoxCol !== undefined &&
        Math.floor(r / boxRows) === highlightBoxRow && Math.floor(c / boxCols) === highlightBoxCol);
    const isSameGroup = selectedCell && (
      selectedCell.row === r || selectedCell.col === c ||
      (Math.floor(selectedCell.row / boxRows) === Math.floor(r / boxRows) &&
        Math.floor(selectedCell.col / boxCols) === Math.floor(c / boxCols))
    );

    const borderRight = ((c + 1) % boxCols === 0 && c !== gridSize - 1) ? 'border-box-right' : '';
    const borderBottom = ((r + 1) % boxRows === 0 && r !== gridSize - 1) ? 'border-box-bottom' : '';

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
    if (cell.type === 'hint') return 'text-hint';
    if (cell.type === 'solution') return 'text-solution';
    return '';
  }

  return (
    <div className="sudoku-grid">
      {board.map((row, r) => (
        <div key={r} className="grid-row">
          {row.map((cell, c) => (
            <div
              key={c}
              className={getCellClass(r, c)}
              style={{ 
               width: cellSize, 
               height: cellSize, 
               fontSize: fontSize
              }}
              onClick={() => onCellPress(r, c)}
            >
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