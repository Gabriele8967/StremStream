class StreamingApp {
    constructor() {
        this.currentSection = 'movies';
        this.currentShow = null;
        this.currentContent = null;
        this.tmdbApiKey = '0b5bf58e72d2b79c29927e215709d248';
        this.tmdbToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjViZjU4ZTcyZDJiNzljMjk5MjdlMjE1NzA5ZDI0OCIsIm5iZiI6MTc1MjA1MTQ4OC4xMDksInN1YiI6IjY4NmUyZjIwMzJmZTZjNGU3ZmU4MDFmYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.o-x1adUNh43o4V-y5l9KaOe38T_Hbt4MkzhCfXLcCbI';
        
        // Initialize storage systems
        this.watchlist = this.loadFromStorage('watchlist') || [];
        this.history = this.loadFromStorage('history') || [];
        this.bookmarks = this.loadFromStorage('bookmarks') || [];
        this.notes = this.loadFromStorage('notes') || {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadContent('movies');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });

        // Search
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        searchBtn.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Modal controls
        document.getElementById('closePlayer').addEventListener('click', () => {
            this.closePlayer();
        });

        document.getElementById('playerModal').addEventListener('click', (e) => {
            if (e.target.id === 'playerModal') {
                this.closePlayer();
            }
        });

        // TV controls
        document.getElementById('seasonSelect').addEventListener('change', () => {
            this.updateEpisodes();
        });

        document.getElementById('episodeSelect').addEventListener('change', () => {
            this.updatePlayer();
        });

        // Player events
        window.addEventListener('message', (event) => {
            if (event.data.type === 'PLAYER_EVENT') {
                this.handlePlayerEvent(event.data);
            }
        });

        // Player action buttons
        document.getElementById('addToWatchlistBtn').addEventListener('click', () => {
            this.addToWatchlist();
        });

        document.getElementById('addBookmarkBtn').addEventListener('click', () => {
            this.addBookmark();
        });

        document.getElementById('addNoteBtn').addEventListener('click', () => {
            this.openNoteModal();
        });

        // Note modal controls
        document.getElementById('closeNoteModal').addEventListener('click', () => {
            this.closeNoteModal();
        });

        document.getElementById('saveNoteBtn').addEventListener('click', () => {
            this.saveNote();
        });

        document.getElementById('cancelNoteBtn').addEventListener('click', () => {
            this.closeNoteModal();
        });

        // History controls
        document.querySelector('.clear-history-btn').addEventListener('click', () => {
            this.clearHistory();
        });
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        // Hide search results
        document.getElementById('searchResults').classList.remove('active');

        this.currentSection = section;
        
        if (section === 'watchlist') {
            this.renderWatchlist();
        } else if (section === 'history') {
            this.renderHistory();
        } else {
            this.loadContent(section);
        }
    }

    async loadContent(type) {
        const loadingElement = document.getElementById(`${type}Loading`);
        const gridElement = document.getElementById(`${type}Grid`);

        try {
            loadingElement.style.display = 'block';
            gridElement.innerHTML = '';

            // Usa TMDB API per ottenere contenuti popolari
            const tmdbType = type === 'movies' ? 'movie' : 'tv';
            const response = await fetch(
                `https://api.themoviedb.org/3/${tmdbType}/popular?language=it-IT&page=1`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.tmdbToken}`,
                        'accept': 'application/json'
                    }
                }
            );
            
            const data = await response.json();

            loadingElement.style.display = 'none';

            if (data && data.results && data.results.length > 0) {
                this.renderGrid(data.results, gridElement, type);
            } else {
                gridElement.innerHTML = '<p class="no-results">Nessun contenuto trovato</p>';
            }
        } catch (error) {
            console.error('Errore nel caricamento:', error);
            loadingElement.style.display = 'none';
            gridElement.innerHTML = '<p class="error">Errore nel caricamento del contenuto</p>';
        }
    }

    async performSearch() {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) return;

        const searchResults = document.getElementById('searchResults');
        const searchGrid = document.getElementById('searchGrid');

        // Show search results section
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        searchResults.classList.add('active');

        searchGrid.innerHTML = '<div class="loading">Ricerca in corso...</div>';

        try {
            // Cerca con TMDB API
            const response = await fetch(
                `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=it-IT&page=1`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.tmdbToken}`,
                        'accept': 'application/json'
                    }
                }
            );
            
            const data = await response.json();

            searchGrid.innerHTML = '';
            
            if (data && data.results && data.results.length > 0) {
                // Filtra solo film e serie TV
                const filteredResults = data.results.filter(item => 
                    item.media_type === 'movie' || item.media_type === 'tv'
                );
                this.renderGrid(filteredResults, searchGrid, 'mixed');
            } else {
                searchGrid.innerHTML = '<p class="no-results">Nessun risultato trovato</p>';
            }
        } catch (error) {
            console.error('Errore nella ricerca:', error);
            searchGrid.innerHTML = '<p class="error">Errore nella ricerca</p>';
        }
    }

    renderGrid(items, container, type) {
        container.innerHTML = '';
        
        items.forEach(item => {
            const card = this.createCard(item, type);
            container.appendChild(card);
        });
    }

    createCard(item, type) {
        const card = document.createElement('div');
        card.className = 'card';
        
        const title = item.title || item.name || 'Titolo sconosciuto';
        const overview = item.overview || 'Descrizione non disponibile';
        const releaseDate = item.release_date || item.first_air_date || '';
        const rating = item.vote_average || 0;
        const posterPath = item.poster_path || '';
        
        const isTV = item.first_air_date || type === 'tv' || item.media_type === 'tv';
        
        card.innerHTML = `
            <div class="card-image">
                ${posterPath ? 
                    `<img src="https://image.tmdb.org/t/p/w500${posterPath}" alt="${title}" loading="lazy">` : 
                    '🎬'
                }
            </div>
            <div class="card-content">
                <h3 class="card-title">${title}</h3>
                <p class="card-info">${overview.substring(0, 100)}${overview.length > 100 ? '...' : ''}</p>
                ${releaseDate ? `<p class="card-info">📅 ${new Date(releaseDate).getFullYear()}</p>` : ''}
                ${rating > 0 ? `<span class="rating">⭐ ${rating.toFixed(1)}</span>` : ''}
            </div>
        `;

        card.addEventListener('click', () => {
            if (isTV) {
                this.playTVShow(item);
            } else {
                this.playMovie(item);
            }
        });

        return card;
    }

    async playMovie(movie) {
        const title = movie.title || 'Film';
        const tmdbId = movie.id;
        
        document.getElementById('playerTitle').textContent = title;
        document.getElementById('tvControls').classList.add('hidden');
        
        // Save current content for actions
        this.currentContent = movie;
        
        // Add to history
        this.addToHistory(movie, 'movie');
        
        // Update watchlist button
        this.updateWatchlistButton();
        
        const playerFrame = document.getElementById('playerFrame');
        // Aggiungi parametri per ridurre annunci
        playerFrame.src = `https://vixsrc.to/movie/${tmdbId}?lang=it&autoplay=true&primaryColor=4ecdc4&secondaryColor=ff6b6b&ads=0&popups=0`;
        
        this.showPlayer();
    }

    async playTVShow(show) {
        const title = show.name || 'Serie TV';
        const tmdbId = show.id;
        
        this.currentShow = {
            ...show,
            tmdbId: tmdbId
        };
        
        // Save current content for actions
        this.currentContent = show;
        
        document.getElementById('playerTitle').textContent = title;
        
        // Mostra i controlli TV
        const tvControls = document.getElementById('tvControls');
        tvControls.classList.remove('hidden');
        
        // Update watchlist button
        this.updateWatchlistButton();
        
        // Carica le stagioni reali da TMDB
        await this.loadSeasons(tmdbId);
        
        this.showPlayer();
    }

    async loadSeasons(tmdbId) {
        const seasonSelect = document.getElementById('seasonSelect');
        seasonSelect.innerHTML = '<option>Caricamento...</option>';
        
        try {
            // Ottieni dettagli della serie TV da TMDB
            const response = await fetch(
                `https://api.themoviedb.org/3/tv/${tmdbId}?language=it-IT`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.tmdbToken}`,
                        'accept': 'application/json'
                    }
                }
            );
            
            const data = await response.json();
            seasonSelect.innerHTML = '';
            
            if (data.seasons) {
                data.seasons.forEach(season => {
                    if (season.season_number > 0) { // Esclude "Speciali" (season 0)
                        const option = document.createElement('option');
                        option.value = season.season_number;
                        option.textContent = `Stagione ${season.season_number}`;
                        seasonSelect.appendChild(option);
                    }
                });
            }
            
            // Salva i dati della serie per il caricamento degli episodi
            this.currentShow.seasons = data.seasons;
            
            await this.updateEpisodes();
        } catch (error) {
            console.error('Errore nel caricamento stagioni:', error);
            seasonSelect.innerHTML = '';
            
            // Fallback alle stagioni comuni
            for (let i = 1; i <= 10; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Stagione ${i}`;
                seasonSelect.appendChild(option);
            }
            
            this.updateEpisodes();
        }
    }

    async updateEpisodes() {
        const episodeSelect = document.getElementById('episodeSelect');
        const seasonNumber = document.getElementById('seasonSelect').value;
        
        episodeSelect.innerHTML = '<option>Caricamento...</option>';
        
        try {
            if (this.currentShow && this.currentShow.seasons) {
                // Trova la stagione selezionata
                const selectedSeason = this.currentShow.seasons.find(s => s.season_number == seasonNumber);
                
                if (selectedSeason) {
                    // Ottieni dettagli della stagione da TMDB
                    const response = await fetch(
                        `https://api.themoviedb.org/3/tv/${this.currentShow.tmdbId}/season/${seasonNumber}?language=it-IT`,
                        {
                            headers: {
                                'Authorization': `Bearer ${this.tmdbToken}`,
                                'accept': 'application/json'
                            }
                        }
                    );
                    
                    const seasonData = await response.json();
                    episodeSelect.innerHTML = '';
                    
                    if (seasonData.episodes) {
                        seasonData.episodes.forEach(episode => {
                            const option = document.createElement('option');
                            option.value = episode.episode_number;
                            option.textContent = `Episodio ${episode.episode_number}${episode.name ? ` - ${episode.name}` : ''}`;
                            episodeSelect.appendChild(option);
                        });
                    }
                } else {
                    throw new Error('Stagione non trovata');
                }
            } else {
                throw new Error('Dati serie non disponibili');
            }
        } catch (error) {
            console.error('Errore nel caricamento episodi:', error);
            episodeSelect.innerHTML = '';
            
            // Fallback agli episodi comuni
            for (let i = 1; i <= 24; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Episodio ${i}`;
                episodeSelect.appendChild(option);
            }
        }
        
        this.updatePlayer();
    }

    updatePlayer() {
        if (!this.currentShow) return;
        
        const season = document.getElementById('seasonSelect').value;
        const episode = document.getElementById('episodeSelect').value;
        
        const playerFrame = document.getElementById('playerFrame');
        // Aggiungi parametri per ridurre annunci
        playerFrame.src = `https://vixsrc.to/tv/${this.currentShow.tmdbId}/${season}/${episode}?lang=it&autoplay=true&primaryColor=4ecdc4&secondaryColor=ff6b6b&ads=0&popups=0`;
        
        // Add to history when episode changes
        if (this.currentContent) {
            this.addToHistory(this.currentContent, 'tv', season, episode);
        }
    }

    showPlayer() {
        document.getElementById('playerModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Migliora l'esperienza rimuovendo l'overlay informatico dopo 5 secondi
        setTimeout(() => {
            const overlay = document.querySelector('.player-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 1000);
            }
        }, 5000);
    }

    closePlayer() {
        const modal = document.getElementById('playerModal');
        const playerFrame = document.getElementById('playerFrame');
        
        modal.classList.remove('active');
        playerFrame.src = '';
        document.body.style.overflow = 'auto';
        
        this.currentShow = null;
    }

    handlePlayerEvent(eventData) {
        const { event, currentTime, duration, video_id } = eventData.data;
        
        // Log degli eventi per debug
        console.log(`Player Event: ${event}`, {
            currentTime,
            duration,
            video_id
        });
        
        // Qui puoi aggiungere logica per tracciare il progresso dell'utente
        switch (event) {
            case 'play':
                console.log('Video iniziato');
                break;
            case 'pause':
                console.log('Video in pausa');
                break;
            case 'ended':
                console.log('Video terminato');
                // Auto-play del prossimo episodio per le serie TV
                if (this.currentShow) {
                    this.playNextEpisode();
                }
                break;
        }
    }

    playNextEpisode() {
        if (!this.currentShow) return;
        
        const seasonSelect = document.getElementById('seasonSelect');
        const episodeSelect = document.getElementById('episodeSelect');
        
        let currentSeason = parseInt(seasonSelect.value);
        let currentEpisode = parseInt(episodeSelect.value);
        
        // Prova a passare al prossimo episodio
        if (currentEpisode < 24) {
            episodeSelect.value = currentEpisode + 1;
            this.updatePlayer();
        } else if (currentSeason < 10) {
            // Prossima stagione, episodio 1
            seasonSelect.value = currentSeason + 1;
            this.updateEpisodes();
        }
    }


    // Storage Management
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(`streamingApp_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from storage:', error);
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(`streamingApp_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    // Watchlist Management
    addToWatchlist() {
        if (!this.currentContent) return;

        const contentId = this.currentContent.id;
        const isAlreadyInWatchlist = this.watchlist.some(item => item.id === contentId);

        if (isAlreadyInWatchlist) {
            this.showMessage('Già presente nei preferiti!', 'info');
            return;
        }

        const watchlistItem = {
            id: contentId,
            title: this.currentContent.title || this.currentContent.name,
            type: this.currentContent.first_air_date || this.currentContent.media_type === 'tv' ? 'tv' : 'movie',
            poster_path: this.currentContent.poster_path,
            added_date: new Date().toISOString(),
            vote_average: this.currentContent.vote_average
        };

        this.watchlist.unshift(watchlistItem);
        this.saveToStorage('watchlist', this.watchlist);
        this.showMessage('Aggiunto ai preferiti!', 'success');

        // Update button text
        const btn = document.getElementById('addToWatchlistBtn');
        btn.innerHTML = '✅ Nei Preferiti';
        btn.disabled = true;
    }

    removeFromWatchlist(id) {
        this.watchlist = this.watchlist.filter(item => item.id !== id);
        this.saveToStorage('watchlist', this.watchlist);
        this.renderWatchlist();
        this.showMessage('Rimosso dai preferiti', 'info');
    }

    renderWatchlist() {
        const grid = document.getElementById('watchlistGrid');
        const emptyMessage = document.getElementById('watchlistEmpty');

        if (this.watchlist.length === 0) {
            grid.style.display = 'none';
            emptyMessage.style.display = 'block';
            return;
        }

        emptyMessage.style.display = 'none';
        grid.style.display = 'grid';
        grid.innerHTML = '';

        this.watchlist.forEach(item => {
            const card = this.createWatchlistCard(item);
            grid.appendChild(card);
        });
    }

    createWatchlistCard(item) {
        const card = document.createElement('div');
        card.className = 'card watchlist-card';
        
        const addedDate = new Date(item.added_date).toLocaleDateString('it-IT');
        
        card.innerHTML = `
            <div class="card-image">
                ${item.poster_path ? 
                    `<img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${item.title}" loading="lazy">` : 
                    '🎬'
                }
                <button class="remove-watchlist-btn" onclick="app.removeFromWatchlist(${item.id})">&times;</button>
            </div>
            <div class="card-content">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-info">Tipo: ${item.type === 'tv' ? 'Serie TV' : 'Film'}</p>
                <p class="card-info">Aggiunto: ${addedDate}</p>
                ${item.vote_average > 0 ? `<span class="rating">⭐ ${item.vote_average.toFixed(1)}</span>` : ''}
                ${this.notes[item.id] ? '<span class="has-note">📝 Nota presente</span>' : ''}
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-watchlist-btn')) {
                if (item.type === 'tv') {
                    this.playTVShow(item);
                } else {
                    this.playMovie(item);
                }
            }
        });

        return card;
    }

    // History Management
    addToHistory(content, type, season = null, episode = null) {
        const historyItem = {
            id: content.id,
            title: content.title || content.name,
            type: type,
            season: season,
            episode: episode,
            watched_date: new Date().toISOString(),
            poster_path: content.poster_path
        };

        // Remove if already exists
        this.history = this.history.filter(item => 
            !(item.id === content.id && item.season === season && item.episode === episode)
        );

        this.history.unshift(historyItem);
        
        // Keep only last 100 items
        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }

        this.saveToStorage('history', this.history);
    }

    clearHistory() {
        if (confirm('Sei sicuro di voler cancellare tutta la cronologia?')) {
            this.history = [];
            this.saveToStorage('history', this.history);
            this.renderHistory();
            this.showMessage('Cronologia cancellata', 'info');
        }
    }

    renderHistory() {
        const list = document.getElementById('historyList');
        const emptyMessage = document.getElementById('historyEmpty');

        if (this.history.length === 0) {
            list.style.display = 'none';
            emptyMessage.style.display = 'block';
            return;
        }

        emptyMessage.style.display = 'none';
        list.style.display = 'block';
        list.innerHTML = '';

        this.history.forEach(item => {
            const historyItem = this.createHistoryItem(item);
            list.appendChild(historyItem);
        });
    }

    createHistoryItem(item) {
        const div = document.createElement('div');
        div.className = 'history-item';
        
        const watchedDate = new Date(item.watched_date).toLocaleString('it-IT');
        const displayTitle = item.type === 'tv' && item.season && item.episode ? 
            `${item.title} - S${item.season}E${item.episode}` : item.title;
        
        div.innerHTML = `
            <div class="history-poster">
                ${item.poster_path ? 
                    `<img src="https://image.tmdb.org/t/p/w92${item.poster_path}" alt="${item.title}">` : 
                    '<div class="placeholder">🎬</div>'
                }
            </div>
            <div class="history-info">
                <h4>${displayTitle}</h4>
                <p>Visto il: ${watchedDate}</p>
                <span class="history-type">${item.type === 'tv' ? 'Serie TV' : 'Film'}</span>
            </div>
            <button class="replay-btn" onclick="app.replayFromHistory(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                ▶️ Rivedere
            </button>
        `;

        return div;
    }

    replayFromHistory(item) {
        if (item.type === 'tv') {
            this.playTVShow(item, item.season, item.episode);
        } else {
            this.playMovie(item);
        }
    }

    // Bookmark Management
    addBookmark() {
        if (!this.currentContent) return;

        const playerFrame = document.getElementById('playerFrame');
        const currentTime = 0; // In a real implementation, you'd get this from the player

        const bookmark = {
            id: Date.now(),
            content_id: this.currentContent.id,
            title: this.currentContent.title || this.currentContent.name,
            type: this.currentShow ? 'tv' : 'movie',
            season: this.currentShow ? document.getElementById('seasonSelect').value : null,
            episode: this.currentShow ? document.getElementById('episodeSelect').value : null,
            timestamp: currentTime,
            created_date: new Date().toISOString(),
            poster_path: this.currentContent.poster_path
        };

        this.bookmarks.unshift(bookmark);
        this.saveToStorage('bookmarks', this.bookmarks);
        this.showMessage('Bookmark aggiunto!', 'success');
    }

    // Notes Management
    openNoteModal() {
        if (!this.currentContent) return;

        const modal = document.getElementById('noteModal');
        const textarea = document.getElementById('noteTextarea');
        
        // Load existing note if available
        const existingNote = this.notes[this.currentContent.id];
        textarea.value = existingNote || '';
        
        modal.classList.add('active');
        textarea.focus();
    }

    closeNoteModal() {
        const modal = document.getElementById('noteModal');
        modal.classList.remove('active');
        document.getElementById('noteTextarea').value = '';
    }

    saveNote() {
        if (!this.currentContent) return;

        const noteText = document.getElementById('noteTextarea').value.trim();
        
        if (noteText) {
            this.notes[this.currentContent.id] = {
                text: noteText,
                title: this.currentContent.title || this.currentContent.name,
                created_date: new Date().toISOString()
            };
            this.showMessage('Nota salvata!', 'success');
        } else {
            delete this.notes[this.currentContent.id];
            this.showMessage('Nota rimossa', 'info');
        }

        this.saveToStorage('notes', this.notes);
        this.closeNoteModal();

        // Update UI if in watchlist
        if (this.currentSection === 'watchlist') {
            this.renderWatchlist();
        }
    }

    // Utility Functions
    showMessage(text, type = 'info') {
        const message = document.createElement('div');
        message.className = `toast-message ${type}`;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(message)) {
                    document.body.removeChild(message);
                }
            }, 300);
        }, 3000);
    }

    updateWatchlistButton() {
        const btn = document.getElementById('addToWatchlistBtn');
        if (!this.currentContent) return;

        const isInWatchlist = this.watchlist.some(item => item.id === this.currentContent.id);
        
        if (isInWatchlist) {
            btn.innerHTML = '✅ Nei Preferiti';
            btn.disabled = true;
        } else {
            btn.innerHTML = '❤️ Aggiungi ai Preferiti';
            btn.disabled = false;
        }
    }
}

// Global app instance
let app;

// Inizializza l'app quando la pagina è caricata
document.addEventListener('DOMContentLoaded', () => {
    app = new StreamingApp();
});

// CSS aggiuntivo per messaggi di errore
const style = document.createElement('style');
style.textContent = `
    .no-results, .error {
        text-align: center;
        padding: 3rem;
        color: rgba(255, 255, 255, 0.7);
        font-size: 1.2rem;
    }
    
    .error {
        color: #ff6b6b;
    }
    
    .loading {
        animation: pulse 2s ease-in-out infinite alternate;
    }
    
    @keyframes pulse {
        from { opacity: 1; }
        to { opacity: 0.4; }
    }
`;
document.head.appendChild(style);