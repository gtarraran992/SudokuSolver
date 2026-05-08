import { useTranslation } from 'react-i18next';
import './Screen.css';
import './SettingsScreen.css';

interface Props {
  page: 'privacy' | 'terms';
  onBack: () => void;
}

export default function LegalScreen({ page, onBack }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'it';

  const title = page === 'privacy' ? t('settings.privacyTitle') : t('settings.termsTitle');

  return (
    <div className="screen">
      <div className="settings-header">
        <button className="btn-back" onClick={onBack}>← {t('settings.back')}</button>
        <h2>{title}</h2>
      </div>

      <div className="legal-content">
        {page === 'privacy'
          ? lang === 'en' ? <PrivacyEN /> : <PrivacyIT />
          : lang === 'en' ? <TermsEN /> : <TermsIT />
        }
      </div>
    </div>
  );
}

function PrivacyIT() {
  return (
    <div className="legal-text">
      <p className="legal-date">Ultimo aggiornamento: Maggio 2026</p>

      <h2>1. Introduzione</h2>
      <p>Sudoku Hint ("noi", "nostra", "app") rispetta la tua privacy. Questa Privacy Policy descrive come raccogliamo, utilizziamo e proteggiamo le tue informazioni.</p>

      <h2>2. Dati raccolti</h2>
      <p>L'app non raccoglie dati personali. Tutti i dati di gioco (griglia, numeri inseriti, progressi) sono salvati esclusivamente sul tuo dispositivo tramite localStorage e non vengono mai trasmessi a server esterni.</p>

      <h2>3. Utilizzo dei dati</h2>
      <p>I dati salvati localmente vengono utilizzati esclusivamente per ripristinare la partita in corso al riavvio dell'app.</p>

      <h2>4. Condivisione dei dati</h2>
      <p>Non vendiamo né condividiamo alcun dato con terze parti. Nessun dato viene trasmesso a server esterni.</p>

      <h2>5. Conservazione dei dati</h2>
      <p>I dati di gioco vengono conservati localmente sul dispositivo finché non avvii una nuova partita o disinstalli l'app.</p>

      <h2>6. Diritti dell'utente</h2>
      <p>Puoi eliminare tutti i dati salvati in qualsiasi momento premendo "Nuova partita" nell'app.</p>

      <h2>7. Contatti</h2>
      <p>Per domande sulla privacy: <a href="mailto:gtarraran992@gmail.com">gtarraran992@gmail.com</a></p>
    </div>
  );
}

function PrivacyEN() {
  return (
    <div className="legal-text">
      <p className="legal-date">Last updated: May 2026</p>

      <h2>1. Introduction</h2>
      <p>Sudoku Hint ("we", "our", "app") respects your privacy. This Privacy Policy describes how we collect, use and protect your information.</p>

      <h2>2. Data collected</h2>
      <p>The app does not collect personal data. All game data (grid, entered numbers, progress) is saved exclusively on your device via localStorage and is never transmitted to external servers.</p>

      <h2>3. Use of data</h2>
      <p>Locally saved data is used exclusively to restore the current game when the app is restarted.</p>

      <h2>4. Data sharing</h2>
      <p>We do not sell or share any data with third parties. No data is transmitted to external servers.</p>

      <h2>5. Data retention</h2>
      <p>Game data is stored locally on the device until you start a new game or uninstall the app.</p>

      <h2>6. User rights</h2>
      <p>You can delete all saved data at any time by pressing "New game" in the app.</p>

      <h2>7. Contact</h2>
      <p>For privacy questions: <a href="mailto:gtarraran992@gmail.com">gtarraran992@gmail.com</a></p>
    </div>
  );
}

function TermsIT() {
  return (
    <div className="legal-text">
      <p className="legal-date">Ultimo aggiornamento: Aprile 2026</p>

      <h2>1. Accettazione dei termini</h2>
      <p>Utilizzando Sudoku Hint accetti i presenti Termini di Servizio. Se non li accetti, ti preghiamo di non utilizzare l'app.</p>

      <h2>2. Descrizione del servizio</h2>
      <p>Sudoku Hint è un'app gratuita che aiuta a risolvere i sudoku fornendo indizi graduali senza rivelare direttamente la soluzione.</p>

      <h2>3. Comportamento dell'utente</h2>
      <p>Ti impegni a non utilizzare l'app per scopi illeciti o per danneggiare il servizio.</p>

      <h2>4. Limitazione di responsabilità</h2>
      <p>Sudoku Hint è fornita "così com'è". Non garantiamo la disponibilità continua del servizio e non siamo responsabili per eventuali perdite di dati.</p>

      <h2>5. Modifiche ai termini</h2>
      <p>Ci riserviamo il diritto di modificare questi termini. Le modifiche saranno comunicate tramite aggiornamento dell'app.</p>

      <h2>6. Contatti</h2>
      <p>Per domande: <a href="mailto:gtarraran992@gmail.com">gtarraran992@gmail.com</a></p>
    </div>
  );
}

function TermsEN() {
  return (
    <div className="legal-text">
      <p className="legal-date">Last updated: April 2026</p>

      <h2>1. Acceptance of terms</h2>
      <p>By using Sudoku Hint you accept these Terms of Service. If you do not accept them, please do not use the app.</p>

      <h2>2. Service description</h2>
      <p>Sudoku Hint is a free app that helps solve sudoku puzzles by providing graduated hints without directly revealing the solution.</p>

      <h2>3. User conduct</h2>
      <p>You agree not to use the app for unlawful purposes or to harm the service.</p>

      <h2>4. Limitation of liability</h2>
      <p>Sudoku Hint is provided "as is". We do not guarantee continuous availability of the service and are not responsible for any data loss.</p>

      <h2>5. Changes to terms</h2>
      <p>We reserve the right to modify these terms. Changes will be communicated through app updates.</p>

      <h2>6. Contact</h2>
      <p>For questions: <a href="mailto:gtarraran992@gmail.com">gtarraran992@gmail.com</a></p>
    </div>
  );
}
