# Sudoku Hint

App Android per risolvere i sudoku con indizi graduali.

## Requisiti
- Node.js 18+
- Android Studio con emulatore configurato
- Java 17+ (incluso in Android Studio)

## Avvio
```bash
# Avvia Metro
npx @react-native-community/cli start

# Oppure compila e avvia direttamente da Android Studio
```

## Struttura
```
SudokuHint/
├── components/
│   ├── GivenScreen.tsx   # Schermata inserimento numeri fissi
│   ├── UserScreen.tsx    # Schermata numeri già risolti
│   ├── HintScreen.tsx    # Schermata indizi
│   ├── SudokuGrid.tsx    # Griglia interattiva
│   └── HintPanel.tsx     # Pannello livelli indizio
└── src/
    ├── types.ts          # Tipi TypeScript
    ├── validator.ts      # Validazione griglia
    ├── solver.ts         # Algoritmo backtracking
    └── hintEngine.ts     # Motore degli indizi
```