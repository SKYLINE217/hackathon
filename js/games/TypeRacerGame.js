/**
 * TypeRacerGame — Real-time WPM Typing Game
 * Fully rewritten for reliability:
 *  - Word-by-word input (type a whole word then space) — more natural UX
 *  - No stale closure issues
 *  - Robust start/stop/destroy lifecycle
 */
class TypeRacerGame {
    constructor() {
        this.input       = document.getElementById('typeracer-input');
        this.display     = document.getElementById('typeracer-text-display');
        this.duration    = 60;
        this.timeLeft    = 60;
        this.chars       = 0;   // correctly typed characters
        this.errors      = 0;   // wrong characters
        this.started     = false;
        this.timerInt    = null;
        this._inputHandler = null;
        this._keyHandler   = null;
        this.words       = [];  // array of word strings for current text
        this.wordIndex   = 0;   // which word we are currently on
        this.charIndex   = 0;   // which char within that word (for display)
        this.wordPool    = this._buildWordPool();
    }

    setDuration(d) {
        this.duration = parseInt(d);
    }

    _buildWordPool() {
        return (
            'the quick brown fox jumps over lazy dog pack my box five dozen ' +
            'programming keyboard algorithm function variable interface class method ' +
            'object array string boolean number return async await promise fetch ' +
            'window document event click screen render update loop frame score level ' +
            'player enemy start pause resume health power speed attack defense shield ' +
            'laser beam energy gravity mass velocity momentum recursion depth breadth ' +
            'search sort filter map reduce stack queue buffer stream pointer cast null ' +
            'undefined integer float complex binary signal reactor core processor cache ' +
            'matrix network circuit digital analog pulse wave signal cipher decrypt ' +
            'encrypt token data packet node edge graph tree path route bridge tunnel ' +
            'fragment vertex pixel shader texture canvas sprite frame rate delta time ' +
            'input output terminal console prompt command execute compile debug trace ' +
            'error warning memory heap stack overflow underflow reference dereference ' +
            'mutation immutable state transition machine finite infinite loop break ' +
            'continue switch case default throw catch finally promise resolve reject'
        ).split(' ').filter(w => w.length > 0);
    }

    // ---- Text Generation ----
    _generateWords(count = 80) {
        const pool = this.wordPool;
        const out  = [];
        for (let i = 0; i < count; i++) {
            out.push(pool[Math.floor(Math.random() * pool.length)]);
        }
        return out;
    }

    // ---- Rendering ----
    _renderWords() {
        this.display.innerHTML = '';
        this.words.forEach((word, wi) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'tr-word';
            wordSpan.id = `tr-w-${wi}`;

            // Each char in the word
            [...word].forEach((ch, ci) => {
                const s = document.createElement('span');
                s.className  = 'tr-char';
                s.id         = `tr-c-${wi}-${ci}`;
                s.textContent = ch;
                wordSpan.appendChild(s);
            });

            // Space after word (except last)
            if (wi < this.words.length - 1) {
                const sp = document.createElement('span');
                sp.className  = 'tr-char tr-space';
                sp.id         = `tr-c-${wi}-space`;
                sp.textContent = ' ';
                wordSpan.appendChild(sp);
            }

            this.display.appendChild(wordSpan);
        });
        this._highlightCurrentWord();
    }

    _highlightCurrentWord() {
        // Remove all active-word highlights
        document.querySelectorAll('.tr-word').forEach(w => w.classList.remove('active-word'));
        const cur = document.getElementById(`tr-w-${this.wordIndex}`);
        if (cur) {
            cur.classList.add('active-word');
            cur.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
        this._updateCharCursor();
    }

    _updateCharCursor() {
        document.querySelectorAll('.tr-char.current').forEach(c => c.classList.remove('current'));
        const cur = document.getElementById(`tr-c-${this.wordIndex}-${this.charIndex}`);
        if (cur) cur.classList.add('current');
    }

    // ---- Input Handling ----
    _onInput() {
        if (!this.started) {
            this.started = true;
            this._startTimer();
        }

        const typed    = this.input.value;
        const target   = this.words[this.wordIndex];

        // User pressed space — attempt to submit the current word
        if (typed.endsWith(' ')) {
            const attempt = typed.trim();
            this._submitWord(attempt, target);
            this.input.value = '';
            return;
        }

        // Live per-character feedback as user types
        this._updateLiveChars(typed, target);
    }

    _updateLiveChars(typed, target) {
        // Reset all chars in current word to default
        [...target].forEach((ch, ci) => {
            const span = document.getElementById(`tr-c-${this.wordIndex}-${ci}`);
            if (!span) return;
            span.classList.remove('correct', 'wrong', 'current');
            if (ci < typed.length) {
                span.classList.add(typed[ci] === ch ? 'correct' : 'wrong');
            } else if (ci === typed.length) {
                span.classList.add('current');
            }
        });
        this.charIndex = typed.length;
    }

    _submitWord(attempt, target) {
        const isCorrect = attempt === target;

        // Mark all chars of the submitted word as correct/wrong permanently
        [...target].forEach((ch, ci) => {
            const span = document.getElementById(`tr-c-${this.wordIndex}-${ci}`);
            if (!span) return;
            span.classList.remove('correct', 'wrong', 'current');
            if (ci < attempt.length) {
                span.classList.add(attempt[ci] === ch ? 'correct' : 'wrong');
            } else {
                span.classList.add('wrong'); // missed characters
            }
        });

        // Mark space after word
        const spaceSpan = document.getElementById(`tr-c-${this.wordIndex}-space`);
        if (spaceSpan) spaceSpan.classList.add(isCorrect ? 'correct' : 'wrong');

        // Tally
        if (isCorrect) {
            this.chars += target.length + 1; // +1 for the space
            AudioManager.eat && AudioManager.eat();
        } else {
            // Count correct chars within wrong word
            let correctInWord = 0;
            [...target].forEach((ch, ci) => {
                if (attempt[ci] === ch) correctInWord++;
            });
            this.chars  += correctInWord;
            this.errors += (target.length - correctInWord) + 1;
        }

        this.wordIndex++;
        this.charIndex = 0;

        // If we've run through all words, generate more
        if (this.wordIndex >= this.words.length) {
            const more = this._generateWords(80);
            more.forEach((w, i) => {
                this.words.push(w);
                // Render new words into display without full re-render
                const wordSpan = document.createElement('span');
                wordSpan.className = 'tr-word';
                wordSpan.id = `tr-w-${this.wordIndex + i}`;
                [...w].forEach((ch, ci) => {
                    const s = document.createElement('span');
                    s.className = 'tr-char';
                    s.id = `tr-c-${this.wordIndex + i}-${ci}`;
                    s.textContent = ch;
                    wordSpan.appendChild(s);
                });
                if (this.wordIndex + i < this.words.length - 1) {
                    const sp = document.createElement('span');
                    sp.className = 'tr-char tr-space';
                    sp.id = `tr-c-${this.wordIndex + i}-space`;
                    sp.textContent = ' ';
                    wordSpan.appendChild(sp);
                }
                this.display.appendChild(wordSpan);
            });
        }

        this._highlightCurrentWord();
        this._updateStats();
    }

    // ---- Timer ----
    _startTimer() {
        this.timerInt = setInterval(() => {
            this.timeLeft--;
            const el = document.getElementById('tr-time');
            if (el) {
                el.textContent = this.timeLeft;
                el.classList.toggle('warning', this.timeLeft <= 10);
            }
            if (this.timeLeft <= 0) this._endGame();
        }, 1000);
    }

    // ---- Stats ----
    _calcWPM() {
        const elapsed = (this.duration - this.timeLeft) / 60;
        return elapsed > 0 ? Math.round((this.chars / 5) / elapsed) : 0;
    }

    _calcAccuracy() {
        const total = this.chars + this.errors;
        return total > 0 ? Math.round((this.chars / total) * 100) : 100;
    }

    _updateStats() {
        const wpm = this._calcWPM();
        const acc = this._calcAccuracy();
        const wpmEl = document.getElementById('typeracer-wpm');
        const accEl = document.getElementById('tr-accuracy');
        const chrEl = document.getElementById('tr-chars');
        if (wpmEl) wpmEl.textContent = wpm;
        if (accEl) accEl.textContent = `${acc}%`;
        if (chrEl) chrEl.textContent = this.chars;
    }

    // ---- End ----
    _endGame() {
        this.destroy();
        const wpm = this._calcWPM();
        const acc = this._calcAccuracy();
        const isNew = StorageManager.setHighScore('typeracer', wpm);

        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setEl('tr-final-wpm',      wpm);
        setEl('tr-final-accuracy', `${acc}%`);
        setEl('tr-final-chars',    this.chars);

        const highMsg = document.getElementById('typeracer-high-msg');
        const gameOver = document.getElementById('typeracer-gameover');
        if (highMsg) highMsg.style.display = isNew ? 'block' : 'none';
        if (gameOver) gameOver.style.display = 'flex';

        StorageManager.updateStats({ gamesPlayed: 1, totalScore: wpm * 10 });
        AchievementSystem.check('first_blood');
        if (wpm >= 80)  AchievementSystem.check('speed_demon');
        if (wpm >= 100) AchievementSystem.check('speed_reader');
        if (acc === 100) AchievementSystem.check('perfectionist');
        const stats = StorageManager.getStats();
        if (stats.totalScore >= 10000) AchievementSystem.check('high_roller');
        App.refreshHub();
    }

    // ---- Public API ----
    start() {
        // Reset all state
        this.timeLeft  = this.duration;
        this.chars     = 0;
        this.errors    = 0;
        this.started   = false;
        this.wordIndex = 0;
        this.charIndex = 0;
        clearInterval(this.timerInt);
        this.timerInt = null;

        // Generate and render
        this.words = this._generateWords(80);
        this._renderWords();

        // Reset UI
        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        const inp = this.input;
        const go  = document.getElementById('typeracer-gameover');
        const tr  = document.getElementById('tr-time');
        const tw  = document.getElementById('tr-time');
        setEl('tr-time',         this.duration);
        setEl('typeracer-wpm',   '0');
        setEl('tr-accuracy',     '100%');
        setEl('tr-chars',        '0');
        if (go) go.style.display = 'none';
        if (tr) tr.classList.remove('warning');

        // Enable input and attach handler fresh
        if (this._inputHandler) inp.removeEventListener('input', this._inputHandler);
        inp.disabled = false;
        inp.value    = '';
        inp.placeholder = 'Type the highlighted word, then SPACE...';
        this._inputHandler = () => this._onInput();
        inp.addEventListener('input', this._inputHandler);

        // Focus after a tick so the overlay has time to hide
        setTimeout(() => inp.focus(), 50);
    }

    destroy() {
        clearInterval(this.timerInt);
        this.timerInt = null;
        if (this._inputHandler && this.input) {
            this.input.removeEventListener('input', this._inputHandler);
            this._inputHandler = null;
        }
        if (this.input) this.input.disabled = true;
    }
}
