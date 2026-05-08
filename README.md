# SudokuHint

App per risolvere i sudoku con indizi graduali, sviluppata con React + Vite + TypeScript.

## Stack
- React + Vite + TypeScript
- Capacitor (per la build Android)

## Avvio sviluppo
```bash
npm install
npm run dev
```
Apri il browser su `http://localhost:5173`

## Struttura
src/
├── logic/
│   ├── types.ts          # Tipi TypeScript condivisi
│   ├── validator.ts      # Validazione griglia (no duplicati)
│   ├── solver.ts         # Algoritmo backtracking + MRV
│   └── hintEngine.ts     # Motore indizi (naked single, hidden single)
├── components/
│   ├── SudokuGrid.tsx    # Griglia 9×9 interattiva
│   ├── HintPanel.tsx     # Pannello livelli indizio
│   └── Numpad.tsx        # Tastierino numerico
├── screens/
│   ├── GivenScreen.tsx   # Passo 1: inserimento numeri fissi
│   ├── UserScreen.tsx    # Passo 2: numeri già risolti + calcolo
│   ├── HintScreen.tsx    # Passo 3: modalità indizi

## Flusso app
1. **Passo 1** — inserimento numeri fissi (nero), conferma e blocco
2. **Passo 2** — inserimento numeri già risolti (blu), calcolo soluzione
3. **Passo 3** — indizi graduali su 3 livelli:
   - Livello 1: dove guardare
   - Livello 2: quale tecnica usare
   - Livello 3: la risposta diretta

## Tecniche riconosciute
- **Naked single** — una cella ha un solo candidato possibile
- **Hidden single** — un numero può stare solo in una cella di riga/colonna/box
- **Fallback** — cella più vincolata con analisi candidati