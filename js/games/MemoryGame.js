/**
 * MemoryGame — Neural Pattern Memory Challenge
 */
class MemoryGame {
    constructor() {
        this.gridEl = document.getElementById('memory-grid');
        this.level  = 1;
        this.score  = 0;
        this.pattern     = [];
        this.playerInput = [];
        this.phase       = 'idle'; // idle | showing | input
        this.baseGridSize = 3;
    }

    _gridSize() { return Math.min(6, this.baseGridSize + Math.floor((this.level - 1) / 3)); }
    _patternLen() { return Math.min(this.level + 2, this._gridSize() * this._gridSize()); }

    _buildGrid() {
        const size = this._gridSize();
        this.gridEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        this.gridEl.innerHTML = '';
        const total = size * size;
        for (let i = 0; i < total; i++) {
            const cell = document.createElement('div');
            cell.className = 'memory-cell disabled';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this._onCellClick(i));
            this.gridEl.appendChild(cell);
        }
    }

    _cells() { return [...this.gridEl.querySelectorAll('.memory-cell')]; }

    _generatePattern() {
        const total = this._gridSize() ** 2;
        const len   = this._patternLen();
        const pool  = [...Array(total).keys()];
        // shuffle
        for (let i = pool.length-1; i>0; i--) {
            const j = Math.floor(Math.random()*(i+1));
            [pool[i],pool[j]] = [pool[j],pool[i]];
        }
        return pool.slice(0, len);
    }

    async _showPattern() {
        this.phase = 'showing';
        this._setStatus('WATCH THE PATTERN');
        this._disableInput();
        const speed = Math.max(300, 600 - this.level * 20);
        for (const idx of this.pattern) {
            await this._delay(speed * 0.3);
            this._flashCell(idx, 'active');
            await this._delay(speed * 0.6);
            this._clearCell(idx);
        }
        await this._delay(300);
        this._startInput();
    }

    _startInput() {
        this.phase       = 'input';
        this.playerInput = [];
        this._enableInput();
        this._setStatus('REPLICATE THE SEQUENCE');
    }

    _flashCell(idx, cls) {
        const cell = this._cells()[idx];
        if (cell) { cell.classList.remove('active','correct','wrong'); cell.classList.add(cls); }
    }

    _clearCell(idx) {
        const cell = this._cells()[idx];
        if (cell) cell.classList.remove('active','correct','wrong');
    }

    _disableInput() { this._cells().forEach(c => c.classList.add('disabled')); }
    _enableInput()  { this._cells().forEach(c => c.classList.remove('disabled')); }
    _setStatus(txt) { document.getElementById('memory-status').textContent = txt; }

    _onCellClick(idx) {
        if (this.phase !== 'input') return;
        const expected = this.pattern[this.playerInput.length];
        this.playerInput.push(idx);
        AudioManager.click();

        if (idx === expected) {
            this._flashCell(idx, 'correct');
            setTimeout(() => this._clearCell(idx), 400);
            if (this.playerInput.length === this.pattern.length) {
                const bonus = Math.max(0, 100 - this.playerInput.length * 2);
                this.score += 100 + bonus;
                document.getElementById('memory-score').textContent = this.score;
                const el = document.getElementById('memory-score');
                el.classList.remove('score-pop'); void el.offsetWidth; el.classList.add('score-pop');
                this._disableInput();
                this.phase = 'idle';
                setTimeout(() => this._nextLevel(), 800);
            }
        } else {
            AudioManager.wrong();
            this._flashCell(idx, 'wrong');
            this._disableInput();
            setTimeout(() => this._gameOver(), 800);
        }
    }

    _nextLevel() {
        this.level++;
        document.getElementById('memory-level-num').textContent = this.level;
        this._buildGrid();
        this.pattern = this._generatePattern();
        this._showPattern();
        if (this.level >= 10) AchievementSystem.check('perfect_memory');
    }

    _gameOver() {
        AudioManager.gameOver();
        const isNew = StorageManager.setHighScore('memory', this.score);
        document.getElementById('memory-final-score').textContent = this.score;
        document.getElementById('memory-final-level').textContent = this.level;
        document.getElementById('memory-high-msg').style.display  = isNew ? 'block' : 'none';
        document.getElementById('memory-gameover').style.display  = 'flex';
        StorageManager.updateStats({ gamesPlayed:1, totalScore: this.score });
        AchievementSystem.check('first_blood');
        const stats = StorageManager.getStats();
        if (stats.totalScore >= 10000) AchievementSystem.check('high_roller');
        App.refreshHub();
    }

    start() {
        this.level  = 1;
        this.score  = 0;
        document.getElementById('memory-level-num').textContent = '1';
        document.getElementById('memory-score').textContent     = '0';
        document.getElementById('memory-gameover').style.display = 'none';
        this._buildGrid();
        this.pattern = this._generatePattern();
        setTimeout(() => this._showPattern(), 800);
    }

    _delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    destroy() {}
}
