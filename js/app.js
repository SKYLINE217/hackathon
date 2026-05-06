/**
 * App — Main controller, router, hub, and rain generator
 */

let snakeGame     = null;
let memoryGame    = null;
let triviaGame    = null;
let reflexGame    = null;
let typeracerGame = null;

const App = {
    init() {
        AudioManager.init();
        this._spawnRain();
        this._bindHub();
        this._bindGames();
        this.refreshHub();
    },

    // ---- Screen Navigation ----
    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    },

    goHub() {
        snakeGame?.destroy();     snakeGame     = null;
        memoryGame?.destroy();    memoryGame    = null;
        reflexGame?.destroy();    reflexGame    = null;
        typeracerGame?.destroy(); typeracerGame = null;
        // triviaGame kept alive — its click handlers are statically bound
        if (triviaGame) triviaGame.destroy();
        triviaGame = new TriviaGame();
        this.refreshHub();
        this.showScreen('hub-screen');
    },

    // ---- Hub Data ----
    refreshHub() {
        // High scores on cards
        document.getElementById('snake-highscore').textContent     = StorageManager.getHighScore('snake');
        document.getElementById('memory-highscore').textContent    = StorageManager.getHighScore('memory');
        document.getElementById('trivia-highscore').textContent    = StorageManager.getHighScore('trivia');
        const reflexRaw = StorageManager.getHighScore('reflex');
        document.getElementById('reflex-highscore').textContent    = reflexRaw ? (9999 - reflexRaw) + 'ms' : '---ms';
        document.getElementById('typeracer-highscore').textContent = StorageManager.getHighScore('typeracer') + ' WPM';

        // Stats bar
        const stats = StorageManager.getStats();
        document.getElementById('total-score-value').textContent   = stats.totalScore.toLocaleString();
        document.getElementById('games-played-value').textContent  = stats.gamesPlayed;
        const unlocked = StorageManager.getUnlockedAchievements().length;
        document.getElementById('achievements-value').textContent  = `${unlocked}/12`;

        // Sound toggle
        document.getElementById('sound-toggle-value').textContent  = AudioManager.enabled ? 'ON' : 'OFF';

        // Leaderboard
        this._renderLeaderboard();

        // Add global hover sound for clickable elements
        document.querySelectorAll('button, .clickable, .game-card, .btn-category, .trivia-option').forEach(el => {
            el.addEventListener('mouseenter', () => AudioManager.hover());
        });

        // Add scanlines & ambient effects
        AchievementSystem.renderGrid();
    },

    _renderLeaderboard() {
        const list = document.getElementById('leaderboard-list');
        const games = [
            { id:'snake',     label:'SNAKE NEON',    score: StorageManager.getHighScore('snake'),     suffix:'' },
            { id:'memory',    label:'MEMORY MATRIX', score: StorageManager.getHighScore('memory'),    suffix:'' },
            { id:'trivia',    label:'TRIVIA BLITZ',  score: StorageManager.getHighScore('trivia'),    suffix:'' },
            { id:'reflex',    label:'REFLEX RUSH',   score: StorageManager.getHighScore('reflex') ? (9999 - StorageManager.getHighScore('reflex')) : 0, suffix:'ms', invert:true },
            { id:'typeracer', label:'TYPE RACER',    score: StorageManager.getHighScore('typeracer'), suffix:' WPM' },
        ];
        const sorted = [...games].sort((a,b) => b.score - a.score);
        const hasAny  = sorted.some(g => g.score > 0);
        list.innerHTML = hasAny
            ? sorted.map((g, i) => `
                <div class="leaderboard-entry">
                    <span class="lb-rank">#${i+1}</span>
                    <span class="lb-game">${g.label}</span>
                    <span class="lb-score">${g.score}${g.suffix}</span>
                </div>`).join('')
            : '<div class="leaderboard-empty">Play a game to set your first record!</div>';
    },

    // ---- Hub Bindings ----
    _bindHub() {
        // Game card clicks
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                AudioManager.click();
                this._launchGame(card.dataset.game);
            });
        });

        // Sound toggle
        document.getElementById('stat-sound-toggle').addEventListener('click', () => {
            AudioManager.setEnabled(!AudioManager.enabled);
            this.refreshHub();
        });
    },

    _launchGame(game) {
        this.showScreen(`${game}-screen`);
        document.getElementById(`${game}-overlay`).style.display = 'flex';
    },

    // ---- Game Bindings ----
    _bindGames() {
        // ---- SNAKE ----
        document.getElementById('snake-start-btn').addEventListener('click', () => {
            document.getElementById('snake-overlay').style.display   = 'none';
            document.getElementById('snake-gameover').style.display  = 'none';
            snakeGame?.destroy();
            snakeGame = new SnakeGame();
            snakeGame.start();
            AudioManager.jackIn();
        });
        document.getElementById('snake-retry-btn').addEventListener('click', () => {
            document.getElementById('snake-gameover').style.display  = 'none';
            snakeGame?.destroy();
            snakeGame = new SnakeGame();
            snakeGame._reset();
            snakeGame.start();
        });
        document.getElementById('snake-hub-btn').addEventListener('click', () => this.goHub());
        document.getElementById('snake-back').addEventListener('click', () => this.goHub());

        // ---- MEMORY ----
        document.getElementById('memory-start-btn').addEventListener('click', () => {
            document.getElementById('memory-overlay').style.display  = 'none';
            document.getElementById('memory-gameover').style.display = 'none';
            memoryGame?.destroy();
            memoryGame = new MemoryGame();
            memoryGame.start();
            AudioManager.jackIn();
        });
        document.getElementById('memory-retry-btn').addEventListener('click', () => {
            document.getElementById('memory-gameover').style.display = 'none';
            memoryGame?.destroy();
            memoryGame = new MemoryGame();
            memoryGame.start();
        });
        document.getElementById('memory-hub-btn').addEventListener('click', () => this.goHub());
        document.getElementById('memory-back').addEventListener('click', () => this.goHub());

        // ---- TRIVIA ----
        triviaGame = new TriviaGame();
        document.querySelectorAll('.btn-category[data-category]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btn-category[data-category]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                triviaGame.setCategory(btn.dataset.category);
                AudioManager.click();
            });
        });
        document.getElementById('trivia-start-btn').addEventListener('click', () => {
            document.getElementById('trivia-overlay').style.display  = 'none';
            document.getElementById('trivia-gameover').style.display = 'none';
            if (!triviaGame) triviaGame = new TriviaGame();
            triviaGame.start(); // synchronous now
            AudioManager.jackIn();
        });
        document.querySelectorAll('.trivia-option').forEach((btn, i) => {
            btn.addEventListener('click', () => triviaGame.onAnswer(i));
        });
        // Keyboard 1-4 for trivia
        document.addEventListener('keydown', (e) => {
            if (!document.getElementById('trivia-screen').classList.contains('active')) return;
            const k = parseInt(e.key);
            if (k >= 1 && k <= 4) triviaGame.onAnswer(k-1);
        });
        document.getElementById('trivia-retry-btn').addEventListener('click', () => {
            document.getElementById('trivia-gameover').style.display = 'none';
            triviaGame = new TriviaGame();
            document.getElementById('trivia-overlay').style.display  = 'flex';
        });
        document.getElementById('trivia-hub-btn').addEventListener('click', () => this.goHub());
        document.getElementById('trivia-back').addEventListener('click', () => this.goHub());

        // ---- REFLEX ----
        document.getElementById('reflex-start-btn').addEventListener('click', () => {
            document.getElementById('reflex-overlay').style.display  = 'none';
            document.getElementById('reflex-gameover').style.display = 'none';
            reflexGame?.destroy();
            reflexGame = new ReflexGame();
            reflexGame.start();
            AudioManager.jackIn();
        });
        document.getElementById('reflex-retry-btn').addEventListener('click', () => {
            document.getElementById('reflex-gameover').style.display = 'none';
            reflexGame?.destroy();
            reflexGame = new ReflexGame();
            reflexGame.start();
        });
        document.getElementById('reflex-hub-btn').addEventListener('click', () => this.goHub());
        document.getElementById('reflex-back').addEventListener('click', () => this.goHub());

        // ---- TYPE RACER ----
        typeracerGame = new TypeRacerGame();
        document.querySelectorAll('.btn-category[data-duration]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btn-category[data-duration]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // typeracerGame may be null after hub return — store on button for pickup at start
                if (typeracerGame) typeracerGame.setDuration(btn.dataset.duration);
                btn.dataset.selectedDuration = btn.dataset.duration;
                AudioManager.click();
            });
        });
        document.getElementById('typeracer-start-btn').addEventListener('click', () => {
            document.getElementById('typeracer-overlay').style.display  = 'none';
            document.getElementById('typeracer-gameover').style.display = 'none';
            // Read duration from the active duration button
            const activeBtn = document.querySelector('.btn-category[data-duration].active');
            const selectedDuration = activeBtn ? parseInt(activeBtn.dataset.duration) : 60;
            typeracerGame?.destroy();
            typeracerGame = new TypeRacerGame();
            typeracerGame.setDuration(selectedDuration);
            typeracerGame.start();
            AudioManager.jackIn();
        });
        document.getElementById('typeracer-retry-btn').addEventListener('click', () => {
            document.getElementById('typeracer-gameover').style.display = 'none';
            typeracerGame = new TypeRacerGame();
            document.getElementById('typeracer-overlay').style.display  = 'flex';
        });
        document.getElementById('typeracer-hub-btn').addEventListener('click', () => this.goHub());
        document.getElementById('typeracer-back').addEventListener('click', () => this.goHub());
    },

    // ---- Rain Effect ----
    _spawnRain() {
        const container = document.getElementById('rain-container');
        for (let i = 0; i < 60; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left     = Math.random() * 100 + '%';
            drop.style.height   = (10 + Math.random() * 20) + 'px';
            drop.style.opacity  = (0.1 + Math.random() * 0.25).toFixed(2);
            drop.style.animationDuration  = (0.8 + Math.random() * 1.5) + 's';
            drop.style.animationDelay     = (-Math.random() * 2) + 's';
            container.appendChild(drop);
        }
    }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
