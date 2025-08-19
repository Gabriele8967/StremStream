class StreamingApp {
    constructor() {
        this.currentSection = 'movies';
        this.currentShow = null;
        this.tmdbApiKey = '0b5bf58e72d2b79c29927e215709d248';
        this.tmdbToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYjViZjU4ZTcyZDJiNzljMjk5MjdlMjE1NzA5ZDI0OCIsIm5iZiI6MTc1MjA1MTQ4OC4xMDksInN1YiI6IjY4NmUyZjIwMzJmZTZjNGU3ZmU4MDFmYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.o-x1adUNh43o4V-y5l9KaOe38T_Hbt4MkzhCfXLcCbI';
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
        this.loadContent(section);
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
        
        // Verifica disponibilità prima di aprire il player
        const isAvailable = await this.checkContentAvailability(tmdbId, 'movie');
        
        if (!isAvailable) {
            this.showUnavailableMessage(title, 'film');
            return;
        }
        
        document.getElementById('playerTitle').textContent = title;
        document.getElementById('tvControls').classList.add('hidden');
        
        const playerFrame = document.getElementById('playerFrame');
        playerFrame.src = `https://vixsrc.to/movie/${tmdbId}?lang=it&autoplay=true&primaryColor=4ecdc4&secondaryColor=ff6b6b`;
        
        this.showPlayer();
    }

    async playTVShow(show) {
        const title = show.name || 'Serie TV';
        const tmdbId = show.id;
        
        // Verifica disponibilità prima di aprire il player
        const isAvailable = await this.checkContentAvailability(tmdbId, 'tv', 1, 1);
        
        if (!isAvailable) {
            this.showUnavailableMessage(title, 'serie TV');
            return;
        }
        
        this.currentShow = {
            ...show,
            tmdbId: tmdbId
        };
        
        document.getElementById('playerTitle').textContent = title;
        
        // Mostra i controlli TV
        const tvControls = document.getElementById('tvControls');
        tvControls.classList.remove('hidden');
        
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
        playerFrame.src = `https://vixsrc.to/tv/${this.currentShow.tmdbId}/${season}/${episode}?lang=it&autoplay=true&primaryColor=4ecdc4&secondaryColor=ff6b6b`;
    }

    showPlayer() {
        document.getElementById('playerModal').classList.add('active');
        document.body.style.overflow = 'hidden';
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

    async checkContentAvailability(tmdbId, type, season = null, episode = null) {
        try {
            let url;
            if (type === 'movie') {
                url = `https://vixsrc.to/movie/${tmdbId}`;
            } else {
                url = `https://vixsrc.to/tv/${tmdbId}/${season}/${episode}`;
            }

            const response = await fetch(url, { method: 'HEAD' });
            
            // Se ritorna 404 o altri errori, il contenuto non è disponibile
            if (response.status === 404 || response.status >= 400) {
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Errore nel controllo disponibilità:', error);
            return false;
        }
    }

    showUnavailableMessage(title, type) {
        // Crea modal di errore personalizzato
        const modal = document.createElement('div');
        modal.className = 'unavailable-modal';
        modal.innerHTML = `
            <div class="unavailable-content">
                <div class="unavailable-icon">😔</div>
                <h3>Contenuto non disponibile</h3>
                <p><strong>${title}</strong> non è attualmente disponibile nella libreria di streaming.</p>
                <p>Questo ${type} potrebbe essere aggiunto in futuro.</p>
                <button class="close-unavailable">Chiudi</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Gestisci chiusura
        const closeBtn = modal.querySelector('.close-unavailable');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Auto chiusura dopo 5 secondi
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 5000);
    }
}

// Inizializza l'app quando la pagina è caricata
document.addEventListener('DOMContentLoaded', () => {
    new StreamingApp();
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