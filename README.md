# La Casa delle Meraviglie — alicerosa.it

Un piccolo sito educativo gratuito: tre stanze, tre giochi, nessuna registrazione.

## Dentro al progetto

- **La Bottega**: scegli le monete per dare il resto giusto.
- **La Porta Segreta**: risolvi tre indizi e trova il codice.
- **Il Laboratorio**: individua la regola di tre sequenze numeriche.

Il sito è statico: HTML, CSS, JavaScript, senza dipendenze o database. Non contiene immagini personali, link affiliati, pubblicità o strumenti di analisi. Funziona anche aprendo localmente `index.html` nel browser.

## Prima pubblicazione da interfaccia GitHub (senza terminale)

1. Accedi a https://github.com/new e crea un repository pubblico chiamato **alicerosa-it**. Non aggiungere un README automatico, perché il progetto ne contiene già uno.
2. Scarica e **decomprimi** il file ZIP consegnato. Su GitHub apri il repository, scegli **Add file → Upload files**, e trascina i **file e la cartella `assets` estratti** (non caricare il file ZIP come un singolo file).
3. Sotto all'area di caricamento scrivi `Prima versione della Casa delle Meraviglie` e seleziona **Commit changes**.
4. Nel repository vai su **Settings → Pages**. In **Build and deployment**, seleziona **Deploy from a branch**, branch **main**, cartella **/(root)** e **Save**.
5. GitHub pubblicherà provvisoriamente su un URL del tipo `https://TUO-USERNAME.github.io/alicerosa-it/` (quando non è impostato il dominio personalizzato). Per lo stato della pubblicazione, controlla **Actions** o **Settings → Pages**.
6. In **Settings → Pages → Custom domain**, inserisci `alicerosa.it` e clicca **Save**. Verifica che GitHub riconosca il dominio. Non modificare i DNS prima di questa operazione.
7. Su Aruba, nel **Pannello di controllo → Gestione DNS**, sostituisci solo gli eventuali record A/AAAA del dominio principale che puntano al vecchio sito con gli indirizzi GitHub indicati sotto. Non modificare MX, SPF, DKIM, DMARC o altre voci utilizzate dalla posta.
8. Per utilizzare anche `www.alicerosa.it`, crea o aggiorna il suo record **CNAME** verso `TUO-USERNAME.github.io` (senza `/alicerosa-it/`). Se un record `www` esiste già con altro tipo/valore, verificane la funzione prima di sostituirlo.
9. Attendi la propagazione DNS (può richiedere fino a 24 ore) e, quando disponibile, abilita **Enforce HTTPS** in GitHub Pages. Verifica `https://alicerosa.it` e `https://www.alicerosa.it`.

### Record DNS per il dominio principale

| Tipo | Nome host | Destinazione |
| ---- | --------- | ------------ |
| A | `@` (o vuoto, secondo il pannello) | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `TUO-USERNAME.github.io` |

**Importante:** la destinazione del CNAME `www` dipende dal tuo username GitHub, non è un valore da copiare letteralmente. Non creare record wildcard `*`. Gli eventuali record AAAA (IPv6) vanno gestiti coerentemente con la configurazione GitHub, per evitare che una parte delle visite arrivi al vecchio hosting.

L'ordine è importante: **prima repository e dominio su GitHub, poi DNS su Aruba**.

Guide ufficiali:
- https://docs.github.com/en/pages/quickstart
- https://docs.github.com/en/pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Come imparare Git con questo progetto

Inizia cambiando un piccolo testo in `index.html` tramite la matita **Edit** su GitHub, poi premi **Commit changes**. Quando la modifica compare sul sito, hai fatto il tuo primo rilascio. In seguito puoi clonare il repository sul Mac e sperimentare con `git add`, `git commit` e `git push`.

### Struttura dei file

```text
alicerosa-it/
├── index.html           # struttura e contenuti
├── assets/
│   ├── style.css        # colori, layout e adattamento mobile
│   ├── app.js           # logica dei tre giochi
│   └── favicon.svg      # icona del sito
├── CNAME                # dominio personalizzato
├── .nojekyll            # non eseguire Jekyll
└── README.md            # istruzioni
```

## Privacy e sicurezza

Il repository GitHub Free deve essere **pubblico** per questa modalità gratuita: non inserire dati privati, fotografie personali, password, chiavi API o informazioni sui minori. Il sito non raccoglie risposte, non salva progressi e non usa servizi esterni. GitHub Pages, come fornitore dell'hosting, può trattare dati tecnici di accesso secondo le proprie policy.

## Idee per i prossimi rilasci

- Più livelli per ciascuna stanza.
- Una biblioteca di libri e film consigliati **senza affiliazioni**.
- Una nuova stanza dedicata a esperimenti e scoperte.
- Test di usabilità con feedback di adulti e bambini, raccolti fuori dal sito e senza pubblicare dati personali.
