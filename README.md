# Sudoku Hint

App Android per risolvere i sudoku con indizi graduali, sviluppata con React + Vite + TypeScript + Capacitor.

## Stack
- React + Vite + TypeScript
- Capacitor (build Android)
- react-i18next (multilingua: italiano e inglese)
- localStorage (salvataggio partita)

## Avvio sviluppo
```bash
npm install
npm run dev
```
Apri il browser su `http://localhost:5173`

## Build Android
```bash
npm run build
npx cap sync android
npx cap open android
```

## Struttura
```
src/
├── logic/
│   ├── types.ts          # Tipi TypeScript condivisi
│   ├── validator.ts      # Validazione griglia + diagonali
│   ├── solver.ts         # Backtracking + MRV
│   └── hintEngine.ts     # Motore indizi (naked/hidden single)
├── components/
│   ├── SudokuGrid.tsx    # Griglia interattiva (4x4 → 16x16)
│   ├── HintPanel.tsx     # Pannello livelli indizio
│   └── Numpad.tsx        # Tastierino parametrizzato
├── screens/
│   ├── HomeScreen.tsx    # Selezione variante
│   ├── GivenScreen.tsx   # Passo 1: numeri fissi
│   ├── UserScreen.tsx    # Passo 2: numeri risolti + calcolo
│   ├── HintScreen.tsx    # Passo 3: indizi graduali
│   ├── SettingsScreen.tsx # Impostazioni
│   ├── LegalScreen.tsx   # Privacy policy e termini
│   ├── SplashScreen.tsx  # Schermata di avvio animata
│   ├── OnboardingScreen.tsx # Tutorial primo avvio
│   └── ConsentScreen.tsx # Accettazione privacy
└── locales/
    ├── it.json           # Traduzioni italiano
    └── en.json           # Traduzioni inglese
```

## Varianti disponibili
| Variante | Difficoltà | Note |
|----------|-----------|------|
| 4x4 | Principiante | Numeri 1-4 |
| 6x6 | Intermedio | Numeri 1-6 |
| 9x9 Classico | Classico | Numeri 1-9 |
| 9x9 Diagonale | Diagonale | Vincolo sulle due diagonali |
| 12x12 | Esperto | Numeri 1-12 |
| 16x16 | Estremo | Numeri 1-16 |

## Flusso app
1. **Splash** → animazione di avvio
2. **Onboarding** → tutorial al primo avvio (3 schermate)
3. **Consent** → accettazione privacy policy e termini
4. **Home** → selezione variante (modale per 9x9)
5. **Passo 1** → inserimento numeri fissi (nero), validazione
6. **Passo 2** → inserimento numeri già risolti (blu), calcolo soluzione
7. **Passo 3** → indizi graduali su 3 livelli

## Livelli di indizio
- **Livello 1** — dove guardare (riga, colonna o box evidenziato)
- **Livello 2** — quale tecnica usare
- **Livello 3** — la risposta diretta

## Tecniche riconosciute
- **Naked single** — una cella ha un solo candidato possibile
- **Hidden single** — un numero può stare solo in una cella di riga/colonna/box
- **Fallback** — cella più vincolata con analisi candidati

## Colori celle
| Colore | Significato |
|--------|------------|
| Nero | Numeri fissi (given) |
| Blu | Inseriti dall'utente |
| Verde | Inseriti tramite indizio livello 3 |
| Rosso | Errori o soluzione completa |
| Viola chiaro | Celle sulle diagonali (solo variante Diagonale) |

## Stato salvato
La partita viene salvata automaticamente in `localStorage` e ripristinata alla riapertura dell'app.
