# StreamingCommunity

Un sito web funzionale per guardare film e serie TV utilizzando l'API VixSrc.

## 🚀 Funzionalità

- **Navigazione Film/Serie TV**: Sfoglia cataloghi di film e serie TV popolari
- **Ricerca**: Trova rapidamente i tuoi contenuti preferiti
- **Player Integrato**: Guarda direttamente nel sito con player personalizzato
- **Controlli Serie TV**: Naviga facilmente tra stagioni ed episodi
- **Design Responsivo**: Ottimizzato per desktop e mobile
- **Auto-Play**: Riproduzione automatica del prossimo episodio

## 🛠️ Tecnologie

- HTML5 / CSS3 / JavaScript vanilla
- API VixSrc per lo streaming
- Design moderno con gradienti e effetti blur
- Player events per tracking avanzato

## 📋 Setup per GitHub Pages

1. Carica tutti i file in un repository GitHub
2. Vai su Settings > Pages
3. Seleziona "Deploy from a branch" > "main" > "/ (root)"
4. Il sito sarà disponibile su `https://username.github.io/repository-name`

## 🌐 Setup per Netlify

### Opzione 1: Deploy da GitHub
1. Collega il repository GitHub a Netlify
2. Build settings: lascia vuoto (sito statico)
3. Publish directory: `/` (root)

### Opzione 2: Deploy manuale
1. Comprimi tutti i file in un archivio ZIP
2. Trascina il file su netlify.com/deploy
3. Il sito sarà live immediatamente

## 🎮 Come Usare

1. **Film**: Clicca sulla tab "Film" per vedere i film popolari
2. **Serie TV**: Clicca sulla tab "Serie TV" per vedere le serie popolari  
3. **Ricerca**: Usa la barra di ricerca per trovare contenuti specifici
4. **Riproduzione**: Clicca su qualsiasi card per iniziare a guardare
5. **Serie TV**: Usa i selettori stagione/episodio per navigare

## 🔧 Personalizzazione

Il player supporta diversi parametri di personalizzazione:

- `primaryColor`: Colore primario del player
- `secondaryColor`: Colore secondario
- `autoplay`: Riproduzione automatica (true/false)
- `startAt`: Tempo di inizio in secondi
- `lang`: Lingua preferita (es. "it")

## 📡 API Endpoints

- **Film**: `https://vixsrc.to/movie/{tmdbId}`
- **Serie TV**: `https://vixsrc.to/tv/{tmdbId}/{season}/{episode}`
- **Lista contenuti**: `https://vixsrc.to/api/list/{type}?lang=it`

## ⚠️ Note

- Il sito richiede una connessione internet attiva
- Alcuni contenuti potrebbero non essere disponibili in tutte le regioni
- Le API sono fornite da VixSrc e potrebbero cambiare

## 🤝 Contribuire

1. Fork del repository
2. Crea un branch per le tue modifiche
3. Commit delle modifiche
4. Push al branch
5. Apri una Pull Request

## ⚖️ DISCLAIMER LEGALE

**IMPORTANTE: LEGGERE ATTENTAMENTE PRIMA DELL'USO**

### Scopo del Progetto
Questo progetto è stato sviluppato esclusivamente per:
- **Uso educativo e didattico**: Studio di API, sviluppo web e tecnologie frontend
- **Sperimentazione tecnica personale**: Test di integrazione API e sviluppo di interfacce utente
- **Portfolio personale**: Dimostrazione di competenze di sviluppo software

### Limitazioni d'Uso
- ❌ **NON è destinato all'uso commerciale** o al profitto economico
- ❌ **NON fornisce o ospita contenuti protetti da copyright**
- ❌ **NON è un servizio di streaming commerciale**
- ❌ **NON sostituisce servizi di streaming legali**

### Responsabilità dell'Utente
L'utente che utilizza questo codice si assume la piena responsabilità di:
- Rispettare le leggi locali e internazionali sul copyright
- Utilizzare il progetto solo per scopi educativi/sperimentali
- Non utilizzarlo per attività commerciali o illegali
- Verificare la legittimità dei contenuti accessibili tramite API di terze parti

### API di Terze Parti
Il progetto utilizza API esterne (VixSrc, TMDB) per scopi dimostrativi:
- Non controlliamo né siamo responsabili per i contenuti forniti da queste API
- L'uso delle API è soggetto ai loro termini di servizio
- Consigliamo di utilizzare solo servizi di streaming legali e autorizzati

### Raccomandazioni
Per il consumo di contenuti multimediali, consigliamo vivamente di utilizzare:
- Netflix, Amazon Prime Video, Disney+, Apple TV+
- Servizi di streaming legali nel vostro paese
- Piattaforme autorizzate dai detentori dei diritti

### Esonero di Responsabilità
Gli sviluppatori di questo progetto:
- Non sono responsabili per l'uso improprio del codice
- Non supportano la pirateria o violazioni del copyright
- Forniscono il codice "as-is" solo per scopi educativi
- Consigliano il rispetto delle leggi sulla proprietà intellettuale

---

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT esclusivamente per uso educativo e personale. L'uso commerciale è espressamente vietato.